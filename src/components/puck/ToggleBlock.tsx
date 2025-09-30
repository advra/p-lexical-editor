/*
  Accordian toggle with a slot
*/

import {
  registerOverlayPortal,
  type ComponentConfig,
  type Slot,
} from '@measured/puck';
import { useEffect, useRef } from 'react';

export type ToggleBlockProps = { summary: string; details?: Slot };

export const HeadingBlock: ComponentConfig<ToggleBlockProps> = {
  label: 'Toggle Block',
  fields: {
    summary: { type: 'text', contentEditable: true },
    details: { type: 'slot' },
  },
  defaultProps: {
    summary: 'Toggle Block (Click to edit)',
  },
  render: ({ summary, details }: ToggleBlockProps) => {
    const ref = useRef(null);

    useEffect(() => registerOverlayPortal(ref.current), [ref.current]);

    return (
      <>
        <details style={{ padding: 8 }}>
          {/* Exclude summary from the overlay so it can be clicked */}
          <summary ref={ref} className="hover:cursor-pointer">
            {summary}
          </summary>
          {details()}
        </details>
      </>
    );
  },
};

export default HeadingBlock;
