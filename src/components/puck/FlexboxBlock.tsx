// components/puck/FlexboxBlock.tsx
import * as React from 'react';
import type { ComponentConfig, ItemWithId, Slot } from '@measured/puck';

// type Direction = 'row' | 'row-reverse' | 'column' | 'column-reverse';
// type Justify =
//   | 'flex-start'
//   | 'center'
//   | 'flex-end'
//   | 'space-between'
//   | 'space-around'
//   | 'space-evenly';
// type Align = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
// type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';

// export type FlexboxBlockProps = {
//   items?: Slot; // children go here
//   direction?: Direction;
//   justify?: Justify;
//   align?: Align;
//   wrap?: Wrap;
//   gap?: number; // px
// };

// export const FlexboxBlock: ComponentConfig<FlexboxBlockProps> = {
//   label: 'Flexbox',
//   fields: {
//     items: { type: 'slot', label: 'Items' },

//     direction: {
//       type: 'select',
//       label: 'Direction',
//       options: [
//         { label: 'Row', value: 'row' },
//         { label: 'Row Reverse', value: 'row-reverse' },
//         { label: 'Column', value: 'column' },
//         { label: 'Column Reverse', value: 'column-reverse' },
//       ],
//     },
//     justify: {
//       type: 'select',
//       label: 'Justify Content',
//       options: [
//         { label: 'Start', value: 'flex-start' },
//         { label: 'Center', value: 'center' },
//         { label: 'End', value: 'flex-end' },
//         { label: 'Space Between', value: 'space-between' },
//         { label: 'Space Around', value: 'space-around' },
//         { label: 'Space Evenly', value: 'space-evenly' },
//       ],
//     },
//     align: {
//       type: 'select',
//       label: 'Align Items',
//       options: [
//         { label: 'Stretch', value: 'stretch' },
//         { label: 'Start', value: 'flex-start' },
//         { label: 'Center', value: 'center' },
//         { label: 'End', value: 'flex-end' },
//         { label: 'Baseline', value: 'baseline' },
//       ],
//     },
//     wrap: {
//       type: 'select',
//       label: 'Wrap',
//       options: [
//         { label: 'No wrap', value: 'nowrap' },
//         { label: 'Wrap', value: 'wrap' },
//         { label: 'Wrap Reverse', value: 'wrap-reverse' },
//       ],
//     },
//     gap: { type: 'number', label: 'Gap (px)', placeholder: '12' },
//   },
//   defaultProps: {
//     direction: 'row',
//     justify: 'flex-start',
//     align: 'stretch',
//     wrap: 'wrap',
//     gap: 12,
//   },
//   render: ({
//     items: Items,
//     direction = 'row',
//     justify = 'flex-start',
//     align = 'stretch',
//     wrap = 'wrap',
//     gap = 12,
//   }) => {
//     const style: React.CSSProperties = {
//       display: 'flex',
//       flexDirection: direction,
//       justifyContent: justify,
//       alignItems: align,
//       flexWrap: wrap,
//       gap,
//     };

//     return (
//       <div style={style}>
//         <Items />
//       </div>
//     );
//   },
// };

export type FlexboxBlockProps = { items: Itm };

export const FlexboxBlock: ComponentConfig<FlexboxBlockProps> = {
  label: 'Flexbox',
  fields: {
    items: { type: 'slot' },
  },
  render: ({ items }) => {
    return <ItemWithId style={{ display: 'flex' }} />;
  },
};

export default FlexboxBlock;
