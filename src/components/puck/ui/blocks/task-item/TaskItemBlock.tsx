import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { useProc } from '@/context/ProcContext';
import CompletionStatus from '../../constants/taskitem/CompletionStatus';
import { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from '../../redline/RedlineWrapper';
import {
  redlineOptions,
  AddRedlineProps,
  RedlineProps,
} from '../../redline/RedlineComponent';
import { RedlineInfo } from '../../redline/RedlineInfo';
import { DisplayRedlineText } from '../../redline/DisplayRedlineText';
import CompleteTimestamp from '../../completed/CompleteTimestamp';
import { MarkCompleteButton } from './components/MarkCompleteButton';
import { useCompletion } from '../hooks/use-completion';
import useUser from '@/hooks/use-user';

export type TaskItemProps = {
  // This id is inherited by default puck's internal props
  id?: string;
  step: string;
  content: string;
  items?: any;
  embeddedSlot?: string;
  record?: any;
};

const TASK_ITEM_LABEL = 'Task Item';

const taskItemNetworkOptions = [
  { label: 'Countdown', value: 'countdown' },
  { label: 'Space 1', value: 'space1' },
  { label: 'Space 2', value: 'space2' },
];

enum REDLINE_TARGETS {
  CONTENT = 'content',
  STEP = 'step',
}

// type NetworkItems = {
//   id: string;
//   network: string;
//   message: string;
//   response: string;
// };

export const TaskItemBlock: ComponentConfig<
  TaskItemProps & Partial<AddRedlineProps>
> = {
  label: TASK_ITEM_LABEL,
  fields: {
    step: { type: 'text', contentEditable: true },
    content: { type: 'textarea', contentEditable: true },
    items: {
      label: 'Verbal Confirmation',
      type: 'array',
      arrayFields: {
        network: {
          type: 'select',
          label: 'Network',
          options: taskItemNetworkOptions,
        },
        message: { type: 'text', contentEditable: true },
        response: { type: 'text', contentEditable: true },
      },
      defaultItemProps: { network: 'countdown', message: '', response: '' },
      getItemSummary: (item: { network?: string }) => {
        const opt = taskItemNetworkOptions.find(
          (o) => o.value === item?.network,
        );
        return `Network: ${opt?.label ?? '—'}`;
      },
    },
  },
  defaultProps: {
    step: '1.',
    content: 'Describe the task here...',
    items: [],
  },
  render: ({
    id,
    step,
    content,
    items,
    embeddedSlot,
    record,
    redlineHoverEnabled = false,
    onRedlineClick,
    redlinesByTarget,
    onRedlineDelete,
    onRedlineTextClick,
  }: TaskItemProps &
    Partial<AddRedlineProps> & {
      onRedlineDelete?: (redlineId: string) => void;
      onRedlineTextClick?: (redline: any) => void;
    }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const blockId = id || '';

    const { completionData } = useCompletion(blockId);
    const { viewMode } = useProc();
    const { session } = useUser();

    const menuOpen = Boolean(anchorEl);

    const handleMenuClose = () => setAnchorEl(null);
    const onIconButton = async (event: any) => {
      setAnchorEl(event.currentTarget);
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
        <div className="flex gap-2 items-stretch mb-2">
          <div className="flex min-w-[3%] justify-center">
            <span className="text-xl font-semibold text-left mr-auto">
              <RedlineWrapper
                onClick={() => handleRedline(displayStep, 'step')}
                redlineHoverEnabled={redlineHoverEnabled}
              >
                <DisplayRedlineText
                  isRedlined={isRedlined}
                  redline={redlineStep}
                  fallbackText={step}
                  onRedlineClick={onRedlineTextClick}
                />
              </RedlineWrapper>
            </span>
          </div>
          <div className="w-px self-stretch bg-gray-300" />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <RedlineWrapper
                onClick={() => handleRedline(displayContent, 'content')}
                redlineHoverEnabled={redlineHoverEnabled}
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
        {/* Verbal Confirmation Table */}
        {items && items.length > 0 && (
          <div className="pb-2 flex-1 mt-4">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300">
                <div className="col-span-2 px-4 py-2 font-semibold text-gray-700 border-r border-gray-300">
                  Network
                </div>
                <div className="col-span-5 px-4 py-2 font-semibold text-gray-700 border-r border-gray-300">
                  Message
                </div>
                <div className="col-span-5 px-4 py-2 font-semibold text-gray-700">
                  Response
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {items.map(
                  (
                    item: {
                      network: string;
                      message: string;
                      response: string;
                    },
                    index: number,
                  ) => (
                    <div key={index} className="grid grid-cols-12">
                      {/* NET */}
                      <div className="col-span-2 px-4 py-2 border-r border-gray-300 bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">
                          {item.network || 'Countdown'}
                        </span>
                      </div>

                      {/* Message */}
                      {item.message ? (
                        <div className="col-span-5 px-4 py-2 border-r border-gray-300">
                          {item.message || ''}
                        </div>
                      ) : (
                        <div className="col-span-5 px-4 py-2 border-r border-gray-300 italic text-gray-400">
                          N/A
                        </div>
                      )}

                      {/* Response */}
                      {item.response ? (
                        <div className="col-span-5 px-4 py-2 ">
                          {item.response || ''}
                        </div>
                      ) : (
                        <div className="col-span-5 px-4 py-2 italic text-gray-400">
                          N/A
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
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
            <MarkCompleteButton
              blockId={blockId}
              record={record}
              blockData={{ step, content }}
            />
            <IconButton onClick={onIconButton}>
              <MoreVertIcon />
            </IconButton>
          </div>
        </div>
        <CompleteTimestamp
          completionData={completionData}
          session={session}
          blockData={{ label: TASK_ITEM_LABEL, id: `${step}` }}
        />
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
          <MenuItem
            onClick={() =>
              handleRedline(displayContent, REDLINE_TARGETS.CONTENT)
            }
          >
            Redline (Content)
          </MenuItem>
          <MenuItem
            onClick={() => handleRedline(displayStep, REDLINE_TARGETS.STEP)}
          >
            Redline (Step)
          </MenuItem>
          {items.length > 0 &&
            items.map((item) => (
              <MenuItem
                onClick={() =>
                  handleRedline(displayContent, REDLINE_TARGETS.CONTENT)
                }
              >
                Redline (Content)
              </MenuItem>
            ))}
        </Menu>
      </div>
    );
  },
};
