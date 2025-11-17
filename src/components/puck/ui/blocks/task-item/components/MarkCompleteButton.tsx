import { Tooltip } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Button from '@/components/common/buttons/Button';
import { useCompletion } from '../../hooks/use-completion';
import { useProcPermissions } from '@/context/ProcContext';
import { toast } from 'sonner';

interface MarkCompleteButtonProps {
  blockId: string;
  record?: any;
  blockType?: string;
  blockData?: any;
  onMarkComplete?: () => void;
  onRemoveComplete?: () => void;
}

export const MarkCompleteButton: React.FC<MarkCompleteButtonProps> = ({
  blockId,
  record,
  blockType = 'TaskItem',
  blockData = {},
  onMarkComplete,
  onRemoveComplete,
}) => {
  const { canExecute, isOwner } = useProcPermissions();
  const canMarkComplete = canExecute || isOwner;

  const {
    isCompleted: localCompleted,
    markComplete,
    removeComplete,
    isLoading,
  } = useCompletion(blockId);

  // Determine if the task is completed (either from session record or local completion)
  const isCompleted = record?.state === 'complete' || localCompleted;
  const showMarkComplete = !canMarkComplete || isCompleted;

  const handleMarkComplete = async () => {
    try {
      await markComplete(blockType, blockData);
      onMarkComplete?.();
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to mark task complete:', error);
    }
  };

  const handleRemoveComplete = async () => {
    try {
      await removeComplete(blockType, blockData);
      onRemoveComplete?.();
      toast.success('Removed Complete from task');
    } catch (error) {
      console.error('Failed to remove complete from task:', error);
    }
  };

  return (
    <Tooltip
      title={
        !canMarkComplete
          ? 'You do not have permission to execute this task'
          : ''
      }
      disableHoverListener={canMarkComplete}
      disableFocusListener={canMarkComplete}
      disableTouchListener={canMarkComplete}
    >
      <span className="flex gap-2 ml-auto">
        <Button
          className="flex border h-2 rounded-sm text-green-700 hover:bg-green-100/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:opacity-100"
          color="success"
          onClick={showMarkComplete ? handleRemoveComplete : handleMarkComplete}
          disabled={!canMarkComplete || isLoading}
        >
          <TaskAltIcon fontSize="small" className="mr-2" />
          <span className="text-xs">
            {showMarkComplete ? 'Remove Complete' : 'Mark Complete'}
          </span>
        </Button>
      </span>
    </Tooltip>
  );
};
