import { useStore } from '@/context/LocalStoreContext';
import { useProc } from '@/context/ProcContext';
import { LocalCompletionState } from '@/context/LocalStoreContext';

export interface UseLocalCompletionReturn {
  isCompleted: boolean;
  completionData: LocalCompletionState | null;
  markComplete: () => void;
  removeComplete: () => void;
  updateCompletion: (data: LocalCompletionState) => void;
}

export const useLocalCompletion = (blockId: string): UseLocalCompletionReturn => {
  const { viewMode } = useProc();
  const localStore = useStore();

  const isCompleted = viewMode === 'view' && localStore && blockId 
    ? localStore.completions[blockId]?.completed || false
    : false;

  const completionData = viewMode === 'view' && localStore && blockId
    ? localStore.completions[blockId] || null
    : null;

  const markComplete = () => {
    if (viewMode === 'view' && localStore && blockId) {
      localStore.updateCompletion(blockId, {
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const removeComplete = () => {
    if (viewMode === 'view' && localStore && blockId) {
      localStore.updateCompletion(blockId, {
        completed: false,
      });
    }
  };

  const updateCompletion = (data: LocalCompletionState) => {
    if (viewMode === 'view' && localStore && blockId) {
      localStore.updateCompletion(blockId, data);
    }
  };

  return {
    isCompleted,
    completionData,
    markComplete,
    removeComplete,
    updateCompletion,
  };
};
