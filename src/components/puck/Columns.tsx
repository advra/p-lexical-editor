import * as React from 'react';
import type { ComponentConfig, Slot } from '@measured/puck';

export type TwoColumnProps = {
  gap?: number; // px
  stackOnMobile?: boolean; // collapse to 1 col on small screens
  leftColumn: Slot; // slot
  rightColumn: Slot; // slot
};

export const TwoColumnBlock: ComponentConfig<TwoColumnProps> = {
  label: 'Two Columns',
  fields: {
    gap: { type: 'number', label: 'Gap (px)', placeholder: '16' },
    // stackOnMobile: { type: 'checkbox', label: 'Stack on mobile' },
    leftColumn: { type: 'slot', label: 'Left column' },
    rightColumn: { type: 'slot', label: 'Right column' },
  },
  defaultProps: {
    gap: 16,
    // stackOnMobile: true,
  },
  render: ({
    gap = 16,
    // stackOnMobile = true,
    leftColumn: Left,
    rightColumn: Right,
  }) => {
    const style: React.CSSProperties = {
      display: 'grid',
      gap,
      gridTemplateColumns: '1fr 1fr',
    };

    return (
      <section>
        <div
          style={style}
          className="grid-cols-1 md:[grid-template-columns:1fr_1fr]"
        >
          <Left />
          <Right />
        </div>
      </section>
    );
  },
};

export default TwoColumnBlock;
