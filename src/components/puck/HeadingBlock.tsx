/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';

export type HeadingBlockProps = { title: string; description?: string };

export const HeadingBlock: ComponentConfig<HeadingBlockProps> = {
  label: 'Heading',
  fields: {
    title: { type: 'text', contentEditable: true },
    description: { type: 'textarea', contentEditable: true },
  },
  defaultProps: {
    title: 'Heading',
    description: '',
  },
  render: ({ title, description }: HeadingBlockProps) => (
    <div className="text-center mx-16">
      <span className="text-[42px] font-semibold">{title}</span>
      {description && <p>{description}</p>}
    </div>
  ),
};

export default HeadingBlock;
