'use client';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { getSocket } from '@/lib/socket';
// import { useProc } from './ProcContext';

/*
  All puck components stored in database are documents represented as BlockDoc
*/
type BlockDoc = { id: string; type: string; props: any };
type Store = Record<string, BlockDoc>;

// Shared completion state for execution mode
export type SharedCompletionState = {
  completed: boolean;
  completedAt?: string;
  userId?: string;
  sessionId?: string;
};

type SharedCompletions = Record<string, SharedCompletionState>;

const ExecuteStoreContext = createContext<{
  store: Store;
  updateStore: (block: BlockDoc) => void;
  sharedCompletions: SharedCompletions;
  updateSessionCompletion: (
    blockId: string,
    state: SharedCompletionState,
  ) => void;
} | null>(null);

export function ExecuteStoreProvider({
  children,
  initialProc,
}: {
  children: React.ReactNode;
  initialProc: ProcPublic | ProcPublicWithAcl;
}) {
  if (!initialProc)
    throw new Error('ExecuteStoreProvider requires valid initial proc data');

  const initialProcData = extractInitialBlocks(initialProc);
  const [store, setStore] = useState<Store>(
    () =>
      Object.fromEntries(
        (initialProcData ?? [])
          .filter((block) => block?.id)
          .map((block) => [block.id, block]),
      ) as Store,
  );

  const [sharedCompletions, setSharedCompletions] = useState<SharedCompletions>(
    {},
  );

  //   const { procId } = useProc();

  // Listen for socket events to update shared completions
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.log('[ExecuteStoreContext] No socket available');
      return;
    }

    console.log(
      '[ExecuteStoreContext] Setting up session:record-updated listener',
    );

    const handleRecordUpdated = (data: {
      recordId: string;
      state: 'complete' | 'pending';
      sessionId: string;
    }) => {
      console.log(
        '[ExecuteStoreContext] Received session:record-updated event:',
        data,
      );
      setSharedCompletions((prev) => ({
        ...prev,
        [data.recordId]: {
          completed: data.state === 'complete',
          completedAt:
            data.state === 'complete' ? new Date().toISOString() : undefined,
          sessionId: data.sessionId,
        },
      }));
      console.log(
        '[ExecuteStoreContext] Updated shared completions for record:',
        data.recordId,
      );
    };

    socket.on('session:record-updated', handleRecordUpdated);

    return () => {
      console.log(
        '[ExecuteStoreContext] Cleaning up session:record-updated listener',
      );
      socket.off('session:record-updated', handleRecordUpdated);
    };
  }, []);

  const updateStore = useCallback((block: BlockDoc) => {
    if (!block?.id) return;
    setStore((prev) => ({
      ...prev,
      [block.id]: { ...prev[block.id], ...block },
    }));
  }, []);

  const updateSessionCompletion = useCallback(
    (blockId: string, state: SharedCompletionState) => {
      setSharedCompletions((prev) => ({
        ...prev,
        [blockId]: state,
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      store,
      updateStore,
      sharedCompletions,
      updateSessionCompletion,
    }),
    [store, updateStore, sharedCompletions, updateSessionCompletion],
  );

  return (
    <ExecuteStoreContext.Provider value={value}>
      {children}
    </ExecuteStoreContext.Provider>
  );
}

function extractInitialBlocks(proc: ProcPublic): BlockDoc[] {
  return (proc?.data?.content ?? [])
    .filter((b: any) => b?.props?.id)
    .map((b: any) => ({ id: b.props.id, type: b.type, props: b.props }));
}

export function useExecuteStore() {
  const ctx = useContext(ExecuteStoreContext);
  if (!ctx)
    throw new Error(
      'useExecuteStore must be used within <ExecuteStoreProvider>',
    );
  return ctx;
}
