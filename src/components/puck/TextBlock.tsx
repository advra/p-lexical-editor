/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { redlineOptions, AddRedlineProps } from './ui/redline/RedlineComponent';

export type TextBlockProps = { text: string };

export const TextBlock: ComponentConfig<TextBlockProps & AddRedlineProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    text: 'Sample pragraph text',
  },
  render: ({
    text,
    onRedlineClick,
    isRedlined,
    redlineContent,
    redlineDcn,
    redlineDescription,
    originalContent,
  }: TextBlockProps &
    AddRedlineProps & {
      isRedlined?: boolean;
      redlineContent?: string;
      redlineDcn?: string;
      redlineDescription?: string;
      originalContent?: string;
    }) => {
    const handleMenuClose = () => {};
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    const displayText = isRedlined && redlineContent ? redlineContent : text;

    return (
      <>
        <RedlineWrapper onClick={() => handleRedline(displayText)}>
          <div
            className={
              isRedlined ? 'line-through decoration-red-500 decoration-1' : ''
            }
          >
            {isRedlined ? originalContent : displayText}
          </div>
        </RedlineWrapper>
        {isRedlined && (
          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <div className="text-red-800 font-semibold">
              Redline: {redlineDcn}
            </div>
            <div className="text-red-700">{redlineDescription}</div>
            <div className="text-red-900 font-medium mt-1">{displayText}</div>
          </div>
        )}
      </>
    );
  },
};

export default TextBlock;
