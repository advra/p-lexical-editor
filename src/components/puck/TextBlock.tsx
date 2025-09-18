/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';

export type TextBlockProps = { text: string };

export const TextBlock: ComponentConfig<TextBlockProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    text: 'Sample pragraph text',
  },
  render: ({ text }: TextBlockProps) => <p>{text}</p>,
};

export default TextBlock;
