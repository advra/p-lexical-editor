import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState, useEffect } from 'react';
import { useProcPermissions, useProc } from '@/context/ProcContext';
import CompletionStatus from './constants/taskitem/CompletionStatus';
import { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { cn } from '@/lib/utils/cn';
import {
  redlineOptions,
  AddRedlineProps,
  RedlineProps,
} from './ui/redline/RedlineComponent';
import { RedlineInfo } from './ui/redline/RedlineInfo';
import { DisplayRedlineText } from './ui/redline/DisplayRedlineText';
import { toast } from 'sonner';
import { useStore } from '@/context/StoreContext';

export type TaskItemProps = {
  step: string;
  content: string;
  record?: any;
};

export const TaskItemBlock: ComponentConfig<TaskItemProps & AddRedlineProps> = {
  label: 'Task Item',
  fields: {
    step: { type: 'text', contentEditable: true },
    content: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    step: '1.',
    content: 'Describe the task here...',
  },
  render: ({
    step,
    content,
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
    const menuOpen = Boolean(anchorEl);

    const { canExecute, isOwner } = useProcPermissions();
    const { procId, viewMode } = useProc();
    const canMarkComplete = canExecute || isOwner;
    let localStore;
    if (viewMode === 'view') {
      localStore = useStore();
    }

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
        toast.info('Item Marked complete. No changes applied in preview mode');
        return;
      }
      if (!currentSessionId) {
        toast.error('No active session found');
        return;
      }

      try {
        const blockId = record?._id || 'unknown';

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

        // TODO: Update local state or trigger refresh
        console.log('Task marked complete in session:', result.session);
      } catch (error) {
        console.error('Failed to mark task complete:', error);
        toast.error('Failed to mark task as complete');
      }
    };

    const onUnmarkComplete = async () => {
      if (viewMode === 'view') {
        toast.info(
          'Item Marked uncomplete. No changes applied in preview mode',
        );
        return;
      }
      if (!currentSessionId) {
        toast.error('No active session found');
        return;
      }

      try {
        const blockId = record?._id || 'unknown';

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
        toast.success('Task unmarked');
        handleMenuClose();

        // TODO: Update local state or trigger refresh
        console.log('Task unmarked in session:', result.session);
      } catch (error) {
        console.error('Failed to unmark task:', error);
        toast.error('Failed to unmark task');
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

    return (
      <div className="p-2 h-auto my-2 border border-gray-300 rounded-md shadow-sm">
        <div className="flex gap-2 items-stretch">
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
          <div className="flex items-start">
            <div className="ml-auto">
              {record && <CompletionStatus record={record} />}
            </div>

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
                <span>
                  {' '}
                  {/* Wrapper span needed for disabled buttons */}
                  <Button
                    className="w-40"
                    variant="outlined"
                    color="success"
                    onClick={onMarkComplete}
                    disabled={
                      !canMarkComplete || record?.state === 'complete'
                      // loadingSession ||
                      // sessionId == null ||
                      // loading
                    }
                  >
                    Mark Complete
                  </Button>
                </span>
              </Tooltip>
              <IconButton onClick={onIconButton}>
                <MoreVertIcon />
              </IconButton>
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
                {canMarkComplete && (
                  <MenuItem onClick={onMarkComplete}>Unmark Complete</MenuItem>
                )}
                <MenuItem onClick={() => handleRedline(displayContent)}>
                  Redline (Content)
                </MenuItem>
                <MenuItem onClick={() => handleRedline(displayStep)}>
                  Redline (Step)
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
