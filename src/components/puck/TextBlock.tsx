/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { redlineOptions, AddRedlineProps } from './ui/redline/RedlineComponent';

export type TextBlockProps = { text: string };

export const TextBlock: ComponentConfig<TextBlockProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    text: 'Sample paragraph text',
  },
  render: ({ text }: TextBlockProps) => {
    return <div className="whitespace-pre-wrap break-words">{text}</div>;
  },
};

export default TextBlock;
