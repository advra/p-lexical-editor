/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/RedlineWrapper';

export type TextBlockProps = { text: string };

export const TextBlock: ComponentConfig<TextBlockProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    text: 'Sample pragraph text',
  },
  render: ({ text }: TextBlockProps) => {
    return (
      <>
        <RedlineWrapper>
          <span>{text}</span>
        </RedlineWrapper>
      </>
    );
  },
};

export default TextBlock;
