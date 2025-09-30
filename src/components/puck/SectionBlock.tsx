/*
  Basic Title component
*/

import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { redlineOptions, AddRedlineProps } from './ui/redline/RedlineComponent';
import { RedlineInfo } from './ui/redline/RedlineInfo';

export type SectionBlockProps = { title: string };

export const SectionBlock: ComponentConfig<
  SectionBlockProps & AddRedlineProps
> = {
  label: 'Section',
  fields: {
    title: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    title: 'Heading',
  },
  render: ({
    title,
    onRedlineClick,
    isRedlined,
    redlineContent,
    redlineDcn,
    redlineDescription,
    originalContent,
    author,
    createdAt,
  }: SectionBlockProps & AddRedlineProps) => {
    const handleMenuClose = () => {};
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);
    return (
      <RedlineWrapper onClick={() => handleRedline(title)}>
        <div className="text-center mx-16">
          <span className="text-[32px]">{title}</span>
        </div>
        {isRedlined && (
          <RedlineInfo
            dcn={redlineDcn}
            newText={redlineDescription}
            author={author}
            createdAt={createdAt}
          />
        )}
      </RedlineWrapper>
    );
  },
};

export default SectionBlock;
