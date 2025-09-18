/*
  Basic Title component
*/

import React from 'react';
import type { ComponentConfig } from '@measured/puck';

export type SectionBlockProps = { title: string };

export const SectionBlock: ComponentConfig<SectionBlockProps> = {
  label: 'Section',
  fields: {
    title: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    title: 'Heading',
  },
  render: ({ title }: SectionBlockProps) => (
    <div className="mt-8 text-center mx-16">
      <span className="text-[32px]">{title}</span>
    </div>
  ),
};

export default SectionBlock;
