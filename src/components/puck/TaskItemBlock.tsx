import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState, useEffect } from 'react';
import { useProcPermissions, useProc } from '@/context/ProcContext';
import CompletionStatus from './constants/taskitem/CompletionStatus';
import { ComponentConfig, Slot } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import {
  redlineOptions,
  AddRedlineProps,
  RedlineProps,
} from './ui/redline/RedlineComponent';
import { RedlineInfo } from './ui/redline/RedlineInfo';
import { DisplayRedlineText } from './ui/redline/DisplayRedlineText';
import { toast } from 'sonner';
import { useStore } from '@/context/LocalStoreContext';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Button from '../common/buttons/Button';
import { getSocket } from '@/lib/socket';

export type TaskItemProps = {
  // This id is inherited by default puck's internal props
  id?: string;

  step: string;
  content: string;
  items?: any;
  embeddedSlot?: string;

  record?: any;
};

export const TaskItemBlock: ComponentConfig<TaskItemProps & AddRedlineProps> = {
  label: 'Task Item',
  fields: {
    step: { type: 'text', contentEditable: true },
    content: { type: 'textarea', contentEditable: true },
    embeddedSlot: {
      type: 'radio',
      label: 'Show Embedded Grid',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    items: { type: 'slot', label: 'Grid content' },
  },
  defaultProps: {
    step: '1.',
    content: 'Describe the task here...',
    embeddedSlot: 'false',
    items: [],
  },
  render: ({
    id,
    step,
    content,
    items,
    embeddedSlot,
    record,
    onRedlineClick,
    redlinesByTarget,
    onRedlineDelete,
  }: TaskItemProps &
    AddRedlineProps & { onRedlineDelete?: (redlineId: string) => void }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
      null,
    );

    // Get local completion state for this block
    // reference the block id provided by puck
    const blockId = id || '';

    const setupLocalStorage = () => {
      let isLocallyCompleted = false;
      let localStore;
      let completionData = null;
      if (viewMode === 'view') {
        localStore = useStore();
        if (localStore && blockId) {
          completionData = localStore.localCompletions[blockId];
          if (completionData) isLocallyCompleted = completionData?.completed;
        }
      } else {
        localStore = null;
      }

      return { localStore, isLocallyCompleted, completionData };
    };

    const menuOpen = Boolean(anchorEl);
    const { canExecute, isOwner } = useProcPermissions();
    const { procId, viewMode } = useProc();
    const canMarkComplete = canExecute || isOwner;
    const { localStore, isLocallyCompleted, completionData } =
      setupLocalStorage();

    // Get or create session when component mounts
    useEffect(() => {
      const initializeSession = async () => {
        try {
          // Check for existing active session
          const response = await fetch(`/api/proc-sessions?procId=${procId}`);
          if (response.ok) {
            const result = await response.json();
            const activeSession = result.sessions.find(
              (s: any) => s.status === 'active',
            );

            if (activeSession) {
              setCurrentSessionId(activeSession._id);
            } else {
              // Create new session
              const createResponse = await fetch('/api/proc-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ procId }),
              });

              if (createResponse.ok) {
                const sessionResult = await createResponse.json();
                setCurrentSessionId(sessionResult.session._id);
              }
            }
          }
        } catch (error) {
          console.error('Failed to initialize session:', error);
        }
      };

      if (procId) {
        initializeSession();
      }
    }, [procId]);

    const handleMenuClose = () => setAnchorEl(null);
    const onIconButton = async (event: any) => {
      setAnchorEl(event.currentTarget);
    };

    const onMarkComplete = async () => {
      if (viewMode === 'view') {
        // Use local state for view mode
        if (localStore) {
          localStore.updateLocalCompletion(blockId, {
            completed: true,
            completedAt: new Date().toISOString(),
          });
        }
        toast.success('(PREVIEW): Task marked as complete');
        handleMenuClose();
        return;
      }

      if (!currentSessionId) {
        toast.error('No active session found');
        return;
      }

      try {
        const response = await fetch('/api/proc-sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            recordId: blockId,
            blockType: 'TaskItem',
            state: 'complete',
            data: {
              step,
              content,
              completedAt: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to mark task complete');
        }

        const result = await response.json();
        toast.success('Task marked as complete');

        // Emit socket event to notify other clients
        const socket = getSocket();
        if (socket) {
          socket.emit('session:record-updated', {
            room: procId,
            sessionId: currentSessionId,
            recordId: blockId,
            state: 'complete',
          });
        }
      } catch (error) {
        console.error('Failed to mark task complete:', error);
        toast.error('Failed to mark task as complete');
      }
    };

    const onRemoveComplete = async () => {
      if (viewMode === 'view' && localStore) {
        // Use local state for view mode
        localStore.updateLocalCompletion(blockId, {
          completed: false,
        });
        toast.success('(PREVIEW): Removed Complete from task');
        handleMenuClose();
        return;
      }

      if (!currentSessionId) {
        toast.error('No active session found');
        return;
      }

      try {
        const response = await fetch('/api/proc-sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            recordId: blockId,
            blockType: 'TaskItem',
            state: 'pending',
            data: {
              step,
              content,
              unmarkedAt: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to unmark task');
        }

        const result = await response.json();
        toast.success('Removed Complete from task');
        handleMenuClose();

        // Emit socket event to notify other clients
        const socket = getSocket();
        if (socket) {
          socket.emit('session:record-updated', {
            room: procId,
            sessionId: currentSessionId,
            recordId: blockId,
            state: 'pending',
          });
        }
      } catch (error) {
        console.error('Failed to remove complete from task:', error);
        toast.error('Failed to remove complete from task');
      }
    };

    // redline options
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    // Extract redlines by target
    const redlineContent = redlinesByTarget?.['content'] as RedlineProps;
    const redlineStep = redlinesByTarget?.['step'] as RedlineProps;
    const isRedlined = !!redlineContent || !!redlineStep;

    // Use redline content if available
    const displayContent = redlineContent?.newText || content;
    const displayStep = redlineStep?.newText || step;

    const showMarkComplete =
      !canMarkComplete || record?.state === 'complete' || isLocallyCompleted;

    return (
      <div className="p-2 h-auto my-2 border border-gray-300 rounded-md shadow-sm">
        <div className="flex gap-2 items-stretch mb-2">
          <div className="flex min-w-[3%] justify-center">
            <span className="text-xl font-semibold text-left mr-auto">
              <RedlineWrapper
                onClick={() => handleRedline(displayStep, 'step')}
              >
                <DisplayRedlineText
                  isRedlined={isRedlined}
                  redline={redlineStep}
                  fallbackText={step}
                />
              </RedlineWrapper>
            </span>
          </div>
          <div className="w-px self-stretch bg-gray-300" />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <RedlineWrapper
                onClick={() => handleRedline(displayContent, 'content')}
              >
                <DisplayRedlineText
                  isRedlined={isRedlined}
                  redline={redlineContent}
                  fallbackText={content}
                />
              </RedlineWrapper>
              {isRedlined && redlinesByTarget && (
                <div className="flex flex-col gap-2">
                  {Object.entries(redlinesByTarget).map(([target, redline]) => {
                    const redlineObj = redline as any;
                    return (
                      <RedlineInfo
                        key={`${target}-${redlineObj.redlineId}`}
                        dcn={redlineObj.dcn}
                        description={redlineObj.newText}
                        author={redlineObj.userId}
                        createdAt={redlineObj.createdAt}
                        target={target}
                        redlineId={redlineObj.redlineId}
                        onRedlineDelete={onRedlineDelete}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        {items && embeddedSlot === 'true' && (
          <div className="flex-1 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items()}
            </div>
          </div>
        )}
        <div className="flex items-start">
          <div className="ml-auto">
            {record && (
              <CompletionStatus
                record={record}
                completionData={completionData}
              />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex">
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
                  className="flex border h-2 rounded-sm text-green-700 hover:bg-green-100/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
    disabled:opacity-100"
                  color="success"
                  onClick={onMarkComplete}
                  disabled={showMarkComplete}
                >
                  <TaskAltIcon fontSize="small" className="mr-2" />
                  <span className="text-xs">Mark Complete</span>
                </Button>
              </span>
            </Tooltip>
            <IconButton onClick={onIconButton}>
              <MoreVertIcon />
            </IconButton>
          </div>
        </div>
        <Menu
          disableScrollLock
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <div>
            {showMarkComplete ? (
              <>
                <MenuItem
                  onClick={onRemoveComplete}
                  disabled={!canMarkComplete}
                >
                  Remove Complete
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={onMarkComplete} disabled={!canMarkComplete}>
                  Mark Complete
                </MenuItem>
              </>
            )}
          </div>
          {/* )} */}
          <MenuItem onClick={() => handleRedline(displayContent)}>
            Redline (Content)
          </MenuItem>
          <MenuItem onClick={() => handleRedline(displayStep)}>
            Redline (Step)
          </MenuItem>
        </Menu>
      </div>
    );
  },
};
