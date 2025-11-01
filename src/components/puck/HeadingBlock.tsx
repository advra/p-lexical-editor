/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { redlineOptions, AddRedlineProps } from './ui/redline/RedlineComponent';
import { cn } from '@/lib/utils/cn';
import { RedlineInfo } from './ui/redline/RedlineInfo';

export type HeadingBlockProps = {
  id?: string;
  title: string;
};

export const HeadingBlock: ComponentConfig<
  HeadingBlockProps & AddRedlineProps
> = {
  label: 'Heading',
  fields: {
    title: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    title: 'Heading',
  },
  render: ({
    id,
    title,
    onRedlineClick,
    isRedlined,
    redlineContent,
    redlineDcn,
    redlineDescription,
    originalContent,
    author,
    createdAt,
  }: HeadingBlockProps & AddRedlineProps) => {
    const handleMenuClose = () => {};
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    const displayTitle = isRedlined && redlineContent ? redlineContent : title;

    return (
      <>
        <RedlineWrapper onClick={() => handleRedline(displayTitle)}>
          <div className="text-center mx-16" id={id}>
            <span
              className={cn(
                'text-[42px] font-semibold',
                isRedlined && 'line-through decoration-red-500 decoration-1',
              )}
            >
              {isRedlined ? originalContent : displayTitle}
            </span>
          </div>
          {isRedlined && (
            <RedlineInfo
              dcn={redlineDcn}
              description={redlineDescription}
              author={author}
              createdAt={createdAt}
            />
          )}
        </RedlineWrapper>
      </>
    );
  },
};

export default HeadingBlock;
