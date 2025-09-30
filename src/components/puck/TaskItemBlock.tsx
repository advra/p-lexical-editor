import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import useUser from '@/hooks/use-user';
import CompletionStatus from './constants/taskitem/CompletionStatus';
import { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { cn } from '@/lib/utils/cn';
import { redlineOptions, RedlineProps } from './ui/redline/RedlineComponent';
import { RedlineInfo } from './ui/redline/RedlineInfo';

export type TaskItemProps = {
  step: string;
  // recordId: string;
  content: string;
  record?: any;
};

export const TaskItemBlock: ComponentConfig<TaskItemProps & RedlineProps> = {
  label: 'Task Item',
  fields: {
    step: { type: 'text', contentEditable: true },
    content: { type: 'textarea', contentEditable: true },
    // recordId: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    step: '1.',
    content: 'Describe the task here...',
    // recordId: '',
  },
  render: ({
    step,
    content,
    record,
    onRedlineClick,
    isRedlined,
    redlineContent,
    originalContent,
    redlinesByTarget,
  }: TaskItemProps &
    RedlineProps & {
      isRedlined?: boolean;
      redlineContent?: string;
      redlineDcn?: string;
      redlineDescription?: string;
      originalContent?: string;
      author?: string;
      createdAt?: string;
      redlinesByTarget?: { [target: string]: any };
    }) => {
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

    // Use redline content if available
    const displayContent =
      isRedlined && redlineContent ? redlineContent : content;
    const displayStep = isRedlined && redlineContent ? step : step;

    const findRecordById = (record: any[], recordId: string) => {
      if (!Array.isArray(record)) {
        console.warn('Expected record to be an array');
        return null;
      }
      const entry = record.find((entry) => entry.recordId === recordId);
      if (entry === null) {
        return null;
      }

      return entry?.record?.data?.record || null;
    };
    // todo reference record id from data.content
    // const myRecord = findRecordById(record, recordId);
    // console.log('redlinesByTarget step:', redlinesByTarget?.step);

    return (
      <div className="p-2 h-auto my-2 border border-gray-300 rounded-md shadow-sm">
        <div className="flex gap-2 items-stretch">
          <div className="flex min-w-[3%] justify-center">
            <span className="text-xl font-semibold text-left mr-auto">
              <RedlineWrapper
                onClick={() => handleRedline(displayStep, 'step')}
              >
                {displayStep}
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
                  {Object.entries(redlinesByTarget).map(([target, redline]) => (
                    <RedlineInfo
                      key={`${target}-${redline.redlineId}`}
                      dcn={redline.dcn}
                      description={redline.description}
                      author={redline.userId}
                      createdAt={redline.createdAt}
                      target={target}
                    />
                  ))}
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
