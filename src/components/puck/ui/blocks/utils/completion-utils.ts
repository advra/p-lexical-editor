// Re-export all completion hooks and utilities for easy reuse by other blocks
export { useLocalCompletion } from '../hooks/use-local-completion';
export { useSessionCompletion } from '../hooks/use-session-completion';
export { useCompletion } from '../hooks/use-completion';

// Example of how other blocks can use these utilities:

/*
// Example usage in another block component:
import { useCompletion, MarkCompleteButton } from './task-item/utils/completion-utils';

export const AnotherBlock: ComponentConfig<AnotherBlockProps> = {
  // ... other config
  render: ({ id, ...props }) => {
    const blockId = id || '';
    const { completionData } = useCompletion(blockId);
    
    return (
      <div>
        {/* Your block content *}
        <MarkCompleteButton
          blockId={blockId}
          blockType="AnotherBlock"
          blockData={{ ...props }}
        />
      </div>
    );
  },
};
*/

// Helper function to check if completion is available for a view mode
export const canUseCompletion = (viewMode: string): boolean => {
  return viewMode === 'view' || viewMode === 'execute';
};

// Helper function to get completion status text
export const getCompletionStatusText = (isCompleted: boolean): string => {
  return isCompleted ? 'Completed' : 'Pending';
};
