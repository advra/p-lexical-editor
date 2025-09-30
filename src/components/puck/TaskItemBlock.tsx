import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import useUser from '@/hooks/use-user';
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
  }: TaskItemProps & AddRedlineProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const { session, loading } = useUser();
    // const isViewer = !!session?.user?.roles?.includes('viewer');
    const isViewer = false;

    const onUnmarkComplete = () => {};
    const handleMenuClose = () => setAnchorEl(null);
    const onIconButton = async (event: any) => {
      setAnchorEl(event.currentTarget);
    };
    const onMarkComplete = async () => {};

    // redline options
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    // Extract redlines by target
    const redlineContent = redlinesByTarget?.['content'] as RedlineProps;
    const redlineStep = redlinesByTarget?.['step'] as RedlineProps;
    const isRedlined = !!redlineContent || !!redlineStep;

    // Use redline content if available
    const displayContent = redlineContent?.newText || content;
    const displayStep = redlineStep?.newText || step;
    const originalContent = redlineContent?.originalText || content;
    const originalStep = redlineStep?.originalText || step;

    return (
      <div className="p-2 h-auto my-2 border border-gray-300 rounded-md shadow-sm">
        <div className="flex gap-2 items-stretch">
          <div className="flex min-w-[3%] justify-center">
            <span className="text-xl font-semibold text-left mr-auto">
              <RedlineWrapper
                onClick={() => handleRedline(displayStep, 'step')}
              >
                <div
                  className={cn(
                    'whitespace-pre-wrap break-words',
                    isRedlined &&
                      'line-through decoration-red-500 decoration-1',
                  )}
                >
                  {isRedlined ? originalStep : displayStep}
                </div>
              </RedlineWrapper>
            </span>
          </div>
          <div className="w-px self-stretch bg-gray-300" />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <RedlineWrapper
                onClick={() => handleRedline(displayContent, 'content')}
              >
                <div
                  className={cn(
                    'whitespace-pre-wrap break-words',
                    isRedlined &&
                      'line-through decoration-red-500 decoration-1',
                  )}
                >
                  {isRedlined ? originalContent : displayContent}
                </div>
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
            <Tooltip
              title={
                isViewer ? 'These actions are not permitted by viewers' : ''
              }
            >
              <div className="flex">
                <Button
                  className="w-40"
                  variant="outlined"
                  color="success"
                  onClick={onMarkComplete}
                  disabled={
                    isViewer || record?.state === 'complete'
                    // loadingSession ||
                    // sessionId == null ||
                    // loading
                  }
                >
                  Mark Complete
                </Button>
                <IconButton disabled={isViewer} onClick={onIconButton}>
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
                  <MenuItem onClick={onUnmarkComplete}>
                    Unmark Complete
                  </MenuItem>
                  <MenuItem onClick={() => handleRedline(displayContent)}>
                    Create Redline
                  </MenuItem>
                </Menu>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  },
};
