'use client';

import { ComponentConfig } from '@measured/puck';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useProc } from '@/context/ProcContext';
import { useUser } from '@/context/UserContext';
import { useCompletionStore } from '@/hooks/use-completion-store';
import { useSession } from '@/context/SessionContext';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import LockIcon from '@mui/icons-material/Lock';
import Button from '../common/buttons/Button';
import { Tooltip } from '@mui/material';
import { DefaultPuckProps } from './types';
import { useTRPC } from '@/trpc/client';

export type MarkCompleteButtonProps = {
  id: string;
  disabled: boolean;
  dependencies?: string[];
  label?: string;
  onComplete?: (blockId: string) => void;
  onIncomplete?: (blockId: string) => void;
  initialCompletionData?: {
    completed: boolean;
    completedAt?: string;
    userId?: string;
    sessionId?: string;
  };
};

// React component that can be used within other components
export const MarkCompleteButtonComponent: React.FC<MarkCompleteButtonProps> = ({
  id,
  disabled,
  dependencies = [],
  label = 'Mark Complete',
  onComplete,
  onIncomplete,
  initialCompletionData,
}) => {
  const trpc = useTRPC();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dependenciesCompleted, setDependenciesCompleted] = useState(false);

  const { session } = useUser();
  const { procId, viewMode } = useProc();
  const completionStore = useCompletionStore();
  const { activeSession, getRecordCompletion } = useSession();

  // tRPC mutations for session updates
  const { mutate: updateSessionRecord, isPending: isUpdatingSession } =
    useMutation(
      trpc.procSessions.updateSessionRecord.mutationOptions({
        onSuccess: (data, variables) => {
          // Update completion store after successful mutation
          if (data.session.records) {
            const record = data.session.records.find((r) => r.recordId === id);
            if (record) {
              completionStore.updateCompletion(id, {
                completed: record.state === 'complete',
                completedAt:
                  record.state === 'complete'
                    ? record.data?.completedAt
                    : undefined,
                sessionId: activeSession?._id,
              });
            }
          }

          const isComplete = variables.state === 'complete';
          setIsCompleted(isComplete);
          setIsLoading(false);

          // Broadcast completion status to other users in the room
          const socket = getSocket();
          if (socket && activeSession?._id) {
            const room = `proc:${procId}`;
            socket.emit('session:record-updated', {
              room,
              sessionId: activeSession._id,
              recordId: id,
              state: variables.state,
              blockType: variables.blockType,
              data: variables.data,
            });
          }

          // Show success toast and call appropriate callback
          if (isComplete) {
            onComplete?.(id);
          } else {
            onIncomplete?.(id);
          }
        },
        onError: (error) => {
          console.error('Failed to update session record:', error);
          toast.error('Failed to update task');
          setIsLoading(false);
        },
      }),
    );

  // Check if all dependencies are completed
  const checkDependencies = (): boolean => {
    if (dependencies.length === 0) return true;

    // Check completion store for dependency completion status
    const allDepsCompleted = dependencies.every((depId) => {
      const depCompletion = completionStore.completions[depId];
      return depCompletion?.completed === true;
    });
    return allDepsCompleted;
  };

  // Initialize completion state from prop or store
  useEffect(() => {
    const initializeCompletionState = async () => {
      if (id) {
        // Use initialCompletionData prop if provided (from parent component)
        if (initialCompletionData !== undefined) {
          setIsCompleted(initialCompletionData.completed);
        } else {
          // Fall back to checking completion store if no prop provided
          const completionData = completionStore.completions[id];
          setIsCompleted(completionData?.completed === true);

          // Use centralized session data instead of individual API calls
          // This prevents duplicate API requests from multiple buttons
          if (activeSession && viewMode !== 'view') {
            const sessionCompletion = getRecordCompletion(id);
            if (sessionCompletion !== undefined) {
              setIsCompleted(sessionCompletion);
            }
          }
        }
      }

      setDependenciesCompleted(checkDependencies());
    };

    initializeCompletionState();
  }, [
    id,
    initialCompletionData,
    completionStore,
    activeSession,
    viewMode,
    getRecordCompletion,
    setIsCompleted,
  ]);

  // Update state when initialCompletionData prop changes
  useEffect(() => {
    if (initialCompletionData !== undefined) {
      setIsCompleted(initialCompletionData.completed);
    }
  }, [initialCompletionData]);

  // Listen for dependency completion updates
  useEffect(() => {
    const handleStoreUpdate = () => {
      setDependenciesCompleted(checkDependencies());
    };

    // Re-check dependencies when completion store changes
    handleStoreUpdate();
  }, [completionStore, dependencies]);

  const handleMarkComplete = async () => {
    if (!dependenciesCompleted) {
      toast.error('Cannot complete: dependencies not met');
      return;
    }

    setIsLoading(true);

    if (viewMode === 'view') {
      // Use completion store for view mode
      completionStore.updateCompletion(id, {
        completed: true,
        completedAt: new Date().toISOString(),
      });
      setIsCompleted(true);
      onComplete?.(id);
      toast.success('(PREVIEW): Task marked as complete');
      setIsLoading(false);
      return;
    }

    if (!activeSession?._id) {
      toast.error('No active session found');
      setIsLoading(false);
      return;
    }

    // Use tRPC mutation instead of fetch
    updateSessionRecord({
      sessionId: activeSession._id,
      recordId: id,
      state: 'complete',
      blockType: 'TaskItem',
      data: {
        completedAt: new Date().toISOString(),
      },
    });
  };

  const handleRemoveComplete = async () => {
    setIsLoading(true);

    if (viewMode === 'view') {
      // Use completion store for view mode
      completionStore.updateCompletion(id, {
        completed: false,
      });
      setIsCompleted(false);
      onIncomplete?.(id);
      toast.success('(PREVIEW): Removed Complete from task');
      setIsLoading(false);
      return;
    }

    if (!activeSession?._id) {
      toast.error('No active session found');
      setIsLoading(false);
      return;
    }

    // Use tRPC mutation instead of fetch
    updateSessionRecord({
      sessionId: activeSession._id,
      recordId: id,
      state: 'pending',
      blockType: 'TaskItem',
      data: {
        unmarkedAt: new Date().toISOString(),
      },
    });
  };

  if (isCompleted) {
    return (
      <Tooltip
        title={
          disabled ? 'Requires Execute Permissions' : 'Undo Task Execution'
        }
      >
        <span>
          <Button
            className="flex border h-2 rounded-sm text-green-700 hover:bg-green-100/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:opacity-100"
            color="success"
            onClick={handleRemoveComplete}
            disabled={isLoading || disabled}
          >
            <TaskAltIcon fontSize="small" className="mr-2" />
            <span className="text-xs">Remove Complete</span>
          </Button>
        </span>
      </Tooltip>
    );
  }

  if (!dependenciesCompleted) {
    return (
      <Tooltip
        title={
          disabled
            ? 'Requires Execute Permissions'
            : `Waiting for ${dependencies.length} dependencies to complete`
        }
      >
        <span>
          <Button
            className="flex border h-2 rounded-sm text-gray-400 bg-gray-100 border-gray-300 opacity-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:opacity-100"
            color="success"
            disabled={true}
          >
            <LockIcon fontSize="small" className="mr-2" />
            <span className="text-xs">Complete</span>
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      title={
        disabled ? 'Requires Execute Permissions' : 'Complete Task as Executed'
      }
    >
      <span>
        <Button
          className="flex border h-2 rounded-sm text-green-700 hover:bg-green-100/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:opacity-100"
          color="success"
          onClick={handleMarkComplete}
          disabled={isLoading || disabled}
        >
          <PanoramaFishEyeIcon fontSize="small" className="mr-2" />
          <span className="text-xs">{label}</span>
        </Button>
      </span>
    </Tooltip>
  );
};

// Puck component configuration
const MarkCompleteButton: ComponentConfig<
  MarkCompleteButtonProps & DefaultPuckProps
> = {
  label: 'Mark Complete Button',
  fields: {
    id: { type: 'text', label: 'Block ID' },
    dependencies: {
      type: 'array',
      label: 'Dependencies',
      arrayFields: {
        blockId: { type: 'text', label: 'Block ID' },
      },
      getItemSummary: (item: { blockId?: string }) =>
        item?.blockId ? `Depends on: ${item.blockId}` : '—',
    },
    label: { type: 'text', label: 'Button Label' },
  },
  defaultProps: {
    id: '',
    dependencies: [],
    label: 'Mark Complete',
    disabled: false,
  },
  render: (props: MarkCompleteButtonProps) => {
    return <MarkCompleteButtonComponent {...props} />;
  },
};

export default MarkCompleteButton;
