/*
  Checklist / Procedures component
  - Great for flight checklists or simple to-do lists
  - Enter one item per line in the editor
*/

import React from 'react';
import type { ComponentConfig } from '@measured/puck';

export type ChecklistBlockProps = {
  title?: string;
  items: string; // one per line
  numbered?: boolean; // ordered vs unordered
  showCheckboxes?: boolean;
};

export const ChecklistBlock: ComponentConfig<ChecklistBlockProps> = {
  label: 'Checklist',
  fields: {
    title: { type: 'text' },
    items: {
      type: 'textarea',
      props: {
        rows: 8,
        placeholder:
          'One item per line\nMixture — RICH\nFuel Pump — ON\nFlaps — SET',
      },
    },
    numbered: { type: 'checkbox', label: 'Use numbered list' },
    showCheckboxes: { type: 'checkbox', label: 'Show checkboxes' },
  },
  defaultProps: {
    title: 'Pre-Flight Checklist',
    items: [
      'Documents — CHECK',
      'Fuel Quantity — CHECK',
      'Oil — CHECK',
      'Pitot Cover — REMOVE',
      'Control Lock — REMOVE',
    ].join('\n'),
    numbered: false,
    showCheckboxes: true,
  },
  render: ({ title, items, numbered, showCheckboxes }: ChecklistBlockProps) => {
    const lines = (items || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const ListTag = numbered ? 'ol' : 'ul';

    return (
      <section className="my-8">
        {title && (
          <h3 className="mb-3 text-xl font-semibold tracking-tight">{title}</h3>
        )}

        <ListTag
          className={`${numbered ? 'list-decimal' : 'list-disc'} pl-6 space-y-2`}
        >
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              {showCheckboxes && (
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 cursor-pointer"
                  onChange={() => {}}
                  // purely cosmetic in the rendered page (no state saved)
                />
              )}
              <span className="leading-6">{line}</span>
            </li>
          ))}
        </ListTag>
      </section>
    );
  },
};

export default ChecklistBlock;
