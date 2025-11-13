import * as React from 'react';
import type { ComponentConfig, Slot } from '@measured/puck';

type ColCount = 2 | 3 | 4;

export type ColumnsBlockProps = {
  gap?: number; // px
  numberOfColumns: ColCount; // 2 | 3 | 4
  col1?: Slot;
  col2?: Slot;
  col3?: Slot;
  col4?: Slot;
};

export const ColumnsBlock: ComponentConfig<ColumnsBlockProps> = {
  label: 'Columns',
  fields: {
    numberOfColumns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
      ],
    },
    gap: { type: 'number', label: 'Gutter Gap (px)', placeholder: '16' },

    // Slots (show only those needed)
    col1: { type: 'slot', label: 'Column 1' },
    col2: { type: 'slot', label: 'Column 2' },
    col3: {
      type: 'slot',
      label: 'Column 3',
    },
    col4: {
      type: 'slot',
      label: 'Column 4',
    },
  },
  defaultProps: {
    numberOfColumns: 2,
    gap: 16,
    col1: undefined,
    col2: undefined,
  },
  render: ({ numberOfColumns, gap = 16, col1, col2, col3, col4 }) => {
    const cols = [col1, col2, col3, col4].slice(0, numberOfColumns);

    const style: React.CSSProperties = {
      display: 'grid',
      gap,
      gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
    };

    return (
      <section>
        <div style={style}>
          {cols.map((SlotComp, i) => (
            <div key={i} className="min-h-[60px]">
              {SlotComp ? <SlotComp /> : null}
            </div>
          ))}
        </div>
      </section>
    );
  },
};

export default ColumnsBlock;
