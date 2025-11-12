import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
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
import { useUser } from '@/context/UserContext';
import { useCompletionStore } from '@/hooks/use-completion-store';
import CompleteTimestamp from './ui/completed/CompleteTimestamp';
import { MarkCompleteButtonComponent } from './MarkCompleteButton';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

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
  ITEM_NETWORK = `items.{index}.network`,
  ITEM_MESSAGE = `items.{index}.message`,
  ITEM_RESPONSE = `items.{index}.response`,
}

export const TaskItemBlock: ComponentConfig<TaskItemProps & AddRedlineProps> = {
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
    onRedlineClick,
    redlinesByTarget,
  }: TaskItemProps & AddRedlineProps) => {
    const trpc = useTRPC();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // Get local completion state for this block
    // reference the block id provided by puck
    const blockId = id || '';

    const { session, isAdmin } = useUser();
    const menuOpen = Boolean(anchorEl);
    const { canExecute, isOwner } = useProcPermissions();
    const canMarkComplete = canExecute || isOwner || isAdmin;

    // Use unified completion store for both view and execute modes
    const completionStore = useCompletionStore();
    const completionData = blockId
      ? completionStore.completions[blockId]
      : null;
    const isLocallyCompleted = completionData?.completed === true;

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

    // Extract redlines for table items
    const getItemRedline = (index: number, field: string) => {
      const target = `items.${index}.${field}`;
      return redlinesByTarget?.[target] as RedlineProps;
    };

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
              >
                <DisplayRedlineText
                  blockId={id}
                  isRedlined={isRedlined}
                  redline={redlineStep}
                  originalText={step}
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
                  blockId={id}
                  isRedlined={isRedlined}
                  redline={redlineContent}
                  originalText={content}
                />
              </RedlineWrapper>
              {/* {isRedlined && redlinesByTarget && (
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
              )} */}
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
                  ) => {
                    const redlineNetwork = getItemRedline(index, 'network');
                    const redlineMessage = getItemRedline(index, 'message');
                    const redlineResponse = getItemRedline(index, 'response');
                    const isRowRedlined =
                      !!redlineNetwork || !!redlineMessage || !!redlineResponse;

                    return (
                      <div key={index} className="grid grid-cols-12">
                        {/* NET */}
                        <div className="col-span-2 px-4 py-2 border-r border-gray-300 bg-gray-50">
                          <RedlineWrapper
                            onClick={() =>
                              handleRedline(
                                item.network || 'Countdown',
                                `items.${index}.network`,
                              )
                            }
                          >
                            <DisplayRedlineText
                              blockId={id}
                              isRedlined={isRowRedlined}
                              redline={redlineNetwork}
                              originalText={item.network || 'Countdown'}
                            />
                          </RedlineWrapper>
                        </div>

                        {/* Message */}
                        <div className="col-span-5 px-4 py-2 border-r border-gray-300">
                          <RedlineWrapper
                            onClick={() =>
                              handleRedline(
                                item.message || '',
                                `items.${index}.message`,
                              )
                            }
                          >
                            <DisplayRedlineText
                              blockId={id}
                              isRedlined={isRowRedlined}
                              redline={redlineMessage}
                              originalText={item.message || ''}
                            />
                          </RedlineWrapper>
                        </div>

                        {/* Response */}
                        <div className="col-span-5 px-4 py-2">
                          <RedlineWrapper
                            onClick={() =>
                              handleRedline(
                                item.response || '',
                                `items.${index}.response`,
                              )
                            }
                          >
                            <DisplayRedlineText
                              blockId={id}
                              isRedlined={isRowRedlined}
                              redline={redlineResponse}
                              originalText={item.response || ''}
                            />
                          </RedlineWrapper>
                        </div>
                      </div>
                    );
                  },
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
          <div className="flex gap-2 ">
            <span className="ml-auto">
              <MarkCompleteButtonComponent
                disabled={!canMarkComplete}
                id={blockId}
                dependencies={[]}
                label="Mark Complete"
                initialCompletionData={completionData || undefined}
                onComplete={() => {
                  console.log('Task marked as complete');
                }}
                onIncomplete={() => {
                  console.log('Removed Complete from task');
                }}
              />
            </span>
            {canMarkComplete && (
              <IconButton onClick={onIconButton}>
                <MoreVertIcon />
              </IconButton>
            )}
          </div>
        </div>
        <CompleteTimestamp
          completionData={completionData}
          session={session}
          blockData={{ label: TASK_ITEM_LABEL, id: `${step}` }}
        />

        {/* <Menu
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
            onClick={() => handleRedline(displayStep, REDLINE_TARGETS.STEP)}
          >
            Undo Complete
          </MenuItem> */}
        {/* <MenuItem
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
          </MenuItem> */}
        {/* Table Item Redline Options */}
        {/* {items && items.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
                Table Items
              </div>
              {items.map((item: any, index: number) => (
                <div key={index}>
                  <MenuItem
                    onClick={() =>
                      handleRedline(
                        item.network || 'Countdown',
                        `items.${index}.network`,
                      )
                    }
                  >
                    Redline Network {index + 1}
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleRedline(
                        item.message || '',
                        `items.${index}.message`,
                      )
                    }
                  >
                    Redline Message {index + 1}
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleRedline(
                        item.response || '',
                        `items.${index}.response`,
                      )
                    }
                  >
                    Redline Response {index + 1}
                  </MenuItem>
                </div>
              ))}
            </div>
          )}  */}
        {/* </Menu> */}
      </div>
    );
  },
};
