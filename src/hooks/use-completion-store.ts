'use client';
import { useStore } from '@/context/LocalStoreContext';
import { useExecuteStore } from '@/context/ExecuteStoreContext';
import { useProc } from '@/context/ProcContext';

export type CompletionState = {
  completed: boolean;
  completedAt?: string;
  userId?: string;
  sessionId?: string;
};

export type CompletionStore = {
  completions: Record<string, CompletionState>;
  updateCompletion: (blockId: string, state: CompletionState) => void;
};

/**
 * Unified hook that automatically selects the appropriate store based on view mode
 * - In 'view' mode: uses LocalStoreProvider (local user state)
 * - In 'execute' mode: uses ExecuteStoreProvider (shared session state)
 */
export function useCompletionStore(): CompletionStore {
  const { viewMode } = useProc();

  try {
    if (viewMode === 'view') {
      // Use local store for view mode
      const localStore = useStore();
      return {
        completions: localStore.completions,
        updateCompletion: localStore.updateCompletion,
      };
    } else {
      // Use execute store for execution mode
      const executeStore = useExecuteStore();
      return {
        completions: executeStore.sharedCompletions,
        updateCompletion: executeStore.updateSessionCompletion,
      };
    }
  } catch (error) {
    // Fallback if no store provider is available
    console.warn('No store provider available, using fallback store');
    return {
      completions: {},
      updateCompletion: () => {},
    };
  }
}
