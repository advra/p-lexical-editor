'use client';
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
import { DisplayRedlineText } from './ui/redline/DisplayRedlineText';
import { useState } from 'react';

export type TextBlockProps = {
  // This id is inherited by default puck's internal props
  id?: string;
  text: string;
};

export const TextBlock: ComponentConfig<TextBlockProps & AddRedlineProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    text: 'Sample paragraph text',
  },
  render: ({
    id,
    text,
    redlinesByTarget,
    onRedlineClick,
  }: TextBlockProps & AddRedlineProps) => {
    const redlineData = redlinesByTarget?.['text'] as RedlineProps;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMenuClose = () => setAnchorEl(null);
    const handleRedline = redlineOptions(onRedlineClick, handleMenuClose);

    const displayStep = redlineData?.newText || text;
    const isRedlined = !!redlineData;

    return (
      <div className="whitespace-pre-wrap break-words">
        <RedlineWrapper onClick={() => handleRedline(displayStep, 'text')}>
          <DisplayRedlineText
            blockId={id}
            isRedlined={isRedlined}
            redline={redlineData}
            fallbackText={text}
          />
        </RedlineWrapper>
      </div>
    );
  },
};

export default TextBlock;
