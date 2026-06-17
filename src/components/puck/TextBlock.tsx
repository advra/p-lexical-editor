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
  // block specific
  text: string;
};

export const TextBlock: ComponentConfig<TextBlockProps & AddRedlineProps> = {
  label: 'Paragraph',
  fields: {
    text: { type: 'richtext' },
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

    const displayText = redlineData?.newText || text;
    const isRedlined = !!redlineData;

    return (
      <RedlineWrapper onClick={() => handleRedline(displayText, 'text')}>
        <div className="whitespace-pre-wrap break-words">
          <DisplayRedlineText
            blockId={id}
            isRedlined={isRedlined}
            redline={redlineData}
            originalText={text}
          />
        </div>
      </RedlineWrapper>
    );
  },
};

export default TextBlock;
