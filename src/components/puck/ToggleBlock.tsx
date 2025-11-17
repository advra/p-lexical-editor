/*
  Accordion toggle with a slot
*/
import {
  registerOverlayPortal,
  type ComponentConfig,
  type Slot,
} from '@measured/puck';
import { useEffect, useRef } from 'react';

export type ToggleBlockProps = {
  summary: string;
  details?: Slot;
  isOpen: boolean;
};

export const HeadingBlock: ComponentConfig<ToggleBlockProps> = {
  label: 'Toggle Block',
  fields: {
    summary: { type: 'text', contentEditable: true },
    details: { type: 'slot' },
    isOpen: {
      type: 'checkbox',
      label: '  Open by default?',
    },
  },
  defaultProps: {
    summary: 'Toggle Block',
    isOpen: true,
  },
  render: ({ summary, details, isOpen }: ToggleBlockProps) => {
    const ref = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (ref.current) registerOverlayPortal(ref.current);
    }, [ref]);

    return (
      <details
        open={!!isOpen}
        className="bg-white border-1 border-gray-200 shadow-xs rounded-sm p-2"
      >
        {/* Exclude summary from the overlay so it can be clicked */}
        <summary
          ref={ref as any}
          className="hover:cursor-pointer hover:underline select-none"
        >
          {summary}
        </summary>
        {details && <div className="ml-4">{details()}</div>}
      </details>
    );
  },
};

export default HeadingBlock;
