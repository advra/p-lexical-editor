/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/RedlineWrapper';
import { redlineOptions, RedlineProps } from './ui/redline/RedlineComponent';

export type TextBlockProps = { text: string };

export const TextBlock: ComponentConfig<TextBlockProps & RedlineProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    text: 'Sample pragraph text',
  },
  render: ({ text, onRedlineClick }: TextBlockProps & RedlineProps) => {
    const handleMenuClose = () => {};
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);
    return (
      <>
        <RedlineWrapper onClick={() => handleRedline(text)}>
          <span>{text}</span>
        </RedlineWrapper>
      </>
    );
  },
};

export default TextBlock;
