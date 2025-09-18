/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';

export type TextBlockProps = { text: string };

export const HeadingBlock: ComponentConfig<TextBlockProps> = {
  label: 'Text',
  fields: {
    text: { type: 'textarea' },
  },
  defaultProps: {
    text: 'Enter your text here',
  },
  render: ({ text }: TextBlockProps) => <p>{text}</p>,
};

export default HeadingBlock;
