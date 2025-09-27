/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/RedlineWrapper';
import { redlineOptions, RedlineProps } from './ui/redline/RedlineComponent';

export type HeadingBlockProps = { title: string };

export const HeadingBlock: ComponentConfig<HeadingBlockProps & RedlineProps> = {
  label: 'Heading',
  fields: {
    title: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    title: 'Heading',
  },
  render: ({ title, onRedlineClick }: HeadingBlockProps & RedlineProps) => {
    const handleMenuClose = () => {};
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);
    return (
      <>
        <RedlineWrapper onClick={() => handleRedline(title)}>
          <div className="text-center mx-16">
            <span className="text-[42px] font-semibold">{title}</span>
          </div>
        </RedlineWrapper>
      </>
    );
  },
};

export default HeadingBlock;
