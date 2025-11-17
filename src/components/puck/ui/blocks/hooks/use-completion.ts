import { useProc } from '@/context/ProcContext';
import { useLocalCompletion } from './use-local-completion';
import { useSessionCompletion } from './use-session-completion';
import { LocalCompletionState } from '@/context/LocalStoreContext';

export interface UseCompletionReturn {
  isCompleted: boolean;
  completionData: LocalCompletionState | null;
  markComplete: (blockType?: string, data?: any) => Promise<void> | void;
  removeComplete: (blockType?: string, data?: any) => Promise<void> | void;
  isLoading: boolean;
  currentSessionId: string | null;
}

export const useCompletion = (blockId: string): UseCompletionReturn => {
  const { viewMode } = useProc();
  
  const localCompletion = useLocalCompletion(blockId);
  const sessionCompletion = useSessionCompletion(blockId);

  // Route to appropriate completion method based on viewMode
  switch (viewMode) {
    case 'view':
      return {
        isCompleted: localCompletion.isCompleted,
        completionData: localCompletion.completionData,
        markComplete: () => {
          localCompletion.markComplete();
          return Promise.resolve();
        },
        removeComplete: () => {
          localCompletion.removeComplete();
          return Promise.resolve();
        },
        isLoading: false,
        currentSessionId: null,
      };
    
    case 'execute':
      return {
        isCompleted: false, // Session completion state comes from record prop
        completionData: null,
        markComplete: sessionCompletion.markComplete,
        removeComplete: sessionCompletion.removeComplete,
        isLoading: sessionCompletion.isLoading,
        currentSessionId: sessionCompletion.currentSessionId,
      };
    
    case 'edit':
    default:
      return {
        isCompleted: false,
        completionData: null,
        markComplete: () => Promise.resolve(),
        removeComplete: () => Promise.resolve(),
        isLoading: false,
        currentSessionId: null,
      };
  }
};
