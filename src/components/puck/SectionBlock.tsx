/*
  Basic Title component
*/

import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import { redlineOptions, RedlineProps } from './ui/redline/RedlineComponent';
import { RedlineInfo } from './ui/redline/RedlineInfo';

export type SectionBlockProps = { title: string };

export const SectionBlock: ComponentConfig<SectionBlockProps & RedlineProps> = {
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
  }: SectionBlockProps & RedlineProps) => {
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
            description={redlineDescription}
            author={author}
            createdAt={createdAt}
          />
        )}
      </RedlineWrapper>
    );
  },
};

export default SectionBlock;
