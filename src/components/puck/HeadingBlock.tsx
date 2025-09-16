/*
  Basic Title component
*/

import React from "react";
import type { ComponentConfig } from "@measured/puck";

export type HeadingBlockProps = { title: string };

export const HeadingBlock: ComponentConfig<HeadingBlockProps> = {
  fields: {
    title: { type: "text" },
  },
  defaultProps: {
    title: "Heading",
  },
  render: ({ title }: HeadingBlockProps) => (
    <div className="mt-8 text-center">
      <h2>{title}</h2>
    </div>
  ),
};

export default HeadingBlock;
