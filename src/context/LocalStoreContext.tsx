// context/StoreContext.tsx
'use client';
import {
  ProcInternal,
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react';

/*
  All puck components stored in database are documents represented as BlockDoc
*/
type BlockDoc = { id: string; type: string; props: any };
type Store = Record<string, BlockDoc>;

// Local completion state for view mode
export type LocalCompletionState = {
  completed: boolean;
  completedAt?: string;
};

type LocalCompletions = Record<string, LocalCompletionState>;

const StoreContext = createContext<{
  store: Store;
  updateStore: (block: BlockDoc) => void;
  completions: LocalCompletions;
  updateCompletion: (blockId: string, state: LocalCompletionState) => void;
} | null>(null);

export function LocalStoreProvider({
  children,
  initialProc,
}: {
  children: React.ReactNode;
  initialProc: ProcPublic | ProcPublicWithAcl;
}) {
  if (!initialProc)
    throw new Error('LocalStoreProvider requires valid initial proc data');
  const initialProcData = extractInitialBlocks(initialProc);
  const [store, setStore] = useState<Store>(
    () =>
      Object.fromEntries(
        (initialProcData ?? [])
          .filter((block) => block?.id)
          .map((block) => [block.id, block]),
      ) as Store,
  );

  const [completions, setLocalCompletions] = useState<LocalCompletions>({});

  const updateStore = useCallback((block: BlockDoc) => {
    if (!block?.id) return;
    setStore((prev) => ({
      ...prev,
      [block.id]: { ...prev[block.id], ...block },
    }));
  }, []);

  const updateCompletion = useCallback(
    (blockId: string, state: LocalCompletionState) => {
      setLocalCompletions((prev) => ({
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
      completions,
      updateCompletion,
    }),
    [store, updateStore, completions, updateCompletion],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

function extractInitialBlocks(proc: ProcPublic): BlockDoc[] {
  return (proc?.data?.content ?? [])
    .filter((b: any) => b?.props?.id)
    .map((b: any) => ({ id: b.props.id, type: b.type, props: b.props }));
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error('useStore must be used within <LocalStoreProvider>');
  return ctx;
}
