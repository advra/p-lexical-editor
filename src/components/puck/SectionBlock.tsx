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
    id, // Add the block ID prop
  }: SectionBlockProps &
    AddRedlineProps & {
      id?: string;
      isRedlined?: boolean;
      redlineContent?: string;
      redlineDcn?: string;
      redlineDescription?: string;
      originalContent?: string;
      author?: string;
      createdAt?: string;
    }) => {
    const handleMenuClose = () => {};
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);
    return (
      <RedlineWrapper onClick={() => handleRedline(title)}>
        <div
          className="text-center mx-16"
          id={id} // Add the block ID as HTML ID for scrolling
        >
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
