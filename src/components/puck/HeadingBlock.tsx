/*
  Basic Title component
*/

import type { ComponentConfig } from '@measured/puck';
import { RedlineWrapper } from './ui/RedlineWrapper';

export type HeadingBlockProps = { title: string; description?: string };

export const HeadingBlock: ComponentConfig<HeadingBlockProps> = {
  label: 'Heading',
  fields: {
    title: { type: 'text', contentEditable: true },
  },
  defaultProps: {
    title: 'Heading',
  },
  render: ({ title, description }: HeadingBlockProps) => {
    return (
      <>
        <RedlineWrapper>
          <div className="text-center mx-16">
            <span className="text-[42px] font-semibold">{title}</span>
          </div>
        </RedlineWrapper>
      </>
    );
  },
};

export default HeadingBlock;
