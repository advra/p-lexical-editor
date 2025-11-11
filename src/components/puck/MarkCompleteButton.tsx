'use client';

import { ComponentConfig } from '@measured/puck';
import { useState, useEffect } from 'react';
import { useProc } from '@/context/ProcContext';
import useUser from '@/hooks/use-user';
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

export type MarkCompleteButtonProps = {
  id: string;
  dependencies?: string[];
  label?: string;
  onComplete?: (blockId: string) => void;
  onIncomplete?: (blockId: string) => void;
};

// React component that can be used within other components
export const MarkCompleteButtonComponent: React.FC<MarkCompleteButtonProps> = ({
  id,
  dependencies = [],
  label = 'Mark Complete',
  onComplete,
  onIncomplete,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dependenciesCompleted, setDependenciesCompleted] = useState(false);

  const { session } = useUser();
  const { procId, viewMode } = useProc();
  const completionStore = useCompletionStore();
  const { activeSession } = useSession();

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

  // Initialize completion state and dependencies
  useEffect(() => {
    const initializeCompletionState = async () => {
      if (id) {
        // First check local completion store
        const completionData = completionStore.completions[id];
        setIsCompleted(completionData?.completed === true);

        // If we have an active session, also check session records
        if (activeSession?._id && viewMode !== 'view') {
          try {
            const response = await fetch(
              `/api/proc-sessions?sessionId=${activeSession._id}&recordId=${id}`,
            );
            if (response.ok) {
              const result = await response.json();
              if (result.records && result.records.length > 0) {
                const record = result.records[0];
                setIsCompleted(record.state === 'complete');
              }
            }
          } catch (error) {
            console.error('Failed to fetch session record:', error);
          }
        }
      }

      setDependenciesCompleted(checkDependencies());
    };

    initializeCompletionState();
  }, [id, completionStore, dependencies, activeSession?._id, viewMode]);

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

    try {
      const response = await fetch('/api/proc-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession._id,
          recordId: id,
          blockType: 'TaskItem',
          state: 'complete',
          data: {
            completedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark task complete');
      }

      await response.json();
      setIsCompleted(true);
      onComplete?.(id);
      toast.success('Task marked as complete');

      // Emit socket event to notify other clients
      const socket = getSocket();
      if (socket) {
        socket.emit('session:record-updated', {
          room: procId,
          sessionId: activeSession._id,
          recordId: id,
          state: 'complete',
        });
      }
    } catch (error) {
      console.error('Failed to mark task complete:', error);
      toast.error('Failed to mark task as complete');
    } finally {
      setIsLoading(false);
    }
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

    try {
      const response = await fetch('/api/proc-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession._id,
          recordId: id,
          blockType: 'TaskItem',
          state: 'pending',
          data: {
            unmarkedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unmark task');
      }

      await response.json();
      setIsCompleted(false);
      onIncomplete?.(id);
      toast.success('Removed Complete from task');

      // Emit socket event to notify other clients
      const socket = getSocket();
      if (socket) {
        socket.emit('session:record-updated', {
          room: procId,
          sessionId: activeSession._id,
          recordId: id,
          state: 'pending',
        });
      }
    } catch (error) {
      console.error('Failed to remove complete from task:', error);
      toast.error('Failed to remove complete from task');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Tooltip title="Remove completion">
        <span>
          <Button
            className="flex border h-2 rounded-sm text-green-700 hover:bg-green-100/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:opacity-100"
            color="success"
            onClick={handleRemoveComplete}
            disabled={isLoading}
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
        title={`Waiting for ${dependencies.length} dependencies to complete`}
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
    <Tooltip title="Mark as complete">
      <span>
        <Button
          className="flex border h-2 rounded-sm text-green-700 hover:bg-green-100/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:opacity-100"
          color="success"
          onClick={handleMarkComplete}
          disabled={isLoading}
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
  },
  render: (props: MarkCompleteButtonProps) => {
    return <MarkCompleteButtonComponent {...props} />;
  },
};

export default MarkCompleteButton;
