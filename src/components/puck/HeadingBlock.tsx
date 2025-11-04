/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import {
  redlineOptions,
  AddRedlineProps,
  RedlineProps,
} from './ui/redline/RedlineComponent';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { DisplayRedlineText } from './ui/redline/DisplayRedlineText';

export type HeadingBlockProps = {
  // This id is inherited by default puck's internal props
  id?: string;
  // block specific
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
    redlinesByTarget,
    onRedlineClick,
  }: HeadingBlockProps & AddRedlineProps) => {
    const redlineData = redlinesByTarget?.['text'] as RedlineProps;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMenuClose = () => setAnchorEl(null);
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    const displayTitle = redlineData?.newText || title;
    const isRedlined = !!redlineData;

    return (
      <>
        <RedlineWrapper onClick={() => handleRedline(displayTitle, 'text')}>
          <div className="text-center mx-16" id={id}>
            <span
              className={cn(
                'text-[42px] font-semibold',
                isRedlined && 'line-through decoration-red-500 decoration-1',
              )}
            >
              <DisplayRedlineText
                blockId={id}
                isRedlined={isRedlined}
                redline={redlineData}
                originalText={displayTitle}
              />
            </span>
          </div>
        </RedlineWrapper>
      </>
    );
  },
};

export default HeadingBlock;
