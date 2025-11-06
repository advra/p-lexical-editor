/*
  Basic Title component
*/

import React, { useState } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/redline/RedlineWrapper';
import {
  redlineOptions,
  AddRedlineProps,
  RedlineProps,
} from './ui/redline/RedlineComponent';
import { RedlineInfo } from './ui/redline/RedlineInfo';
import { DisplayRedlineText } from './ui/redline/DisplayRedlineText';

export type SectionBlockProps = {
  // This id is inherited by default puck's internal props
  id?: string;
  text: string;
};

const TARGET_ID = 'section';

export const SectionBlock: ComponentConfig<
  SectionBlockProps & AddRedlineProps
> = {
  label: 'Section',
  fields: {
    text: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    text: 'Section',
  },
  render: ({
    id,
    text,
    redlinesByTarget,
    onRedlineClick,
  }: SectionBlockProps & AddRedlineProps) => {
    const redlineData = redlinesByTarget?.[TARGET_ID] as RedlineProps;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMenuClose = () => setAnchorEl(null);
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    const displayText = redlineData?.newText || text;
    const isRedlined = !!redlineData;
    return (
      <div className="text-center mx-16" id={id}>
        <span className="text-[32px]">
          <RedlineWrapper onClick={() => handleRedline(displayText, TARGET_ID)}>
            <DisplayRedlineText
              blockId={id}
              isRedlined={isRedlined}
              redline={redlineData}
              originalText={text}
            />
          </RedlineWrapper>
        </span>
      </div>
    );
  },
};

export default SectionBlock;
