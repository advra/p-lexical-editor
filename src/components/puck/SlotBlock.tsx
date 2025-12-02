import { type ComponentConfig, type Slot } from '@measured/puck';
import { AddRedlineProps } from './ui/redline/RedlineComponent';
import { DefaultPuckProps } from './types';

export type SlotBlockProps = DefaultPuckProps & {
  slot?: Slot;
};

const TASK_ITEM_LABEL = 'Slot Block';

export const SlotBlock: ComponentConfig<SlotBlockProps & AddRedlineProps> = {
  label: TASK_ITEM_LABEL,
  fields: {
    slot: { type: 'slot' },
  },
  defaultProps: {
    slot: [],
  },
  render: ({ id, slot: SlotComponent }: SlotBlockProps & AddRedlineProps) => {
    console.log('SlotComponent', SlotComponent);

    return (
      <div
        id={id}
        className="p-2 h-auto my-2 border border-gray-300 rounded-md"
      >
        <div className="flex gap-2 items-stretch mb-2">
          <div className="flex min-w-[3%] justify-center">
            <span className="text-xl font-semibold text-left mr-auto">
              Slot Block Example:
            </span>
          </div>
          <div className="w-px self-stretch bg-gray-300" />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              {SlotComponent && <SlotComponent />}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export default SlotBlock;
