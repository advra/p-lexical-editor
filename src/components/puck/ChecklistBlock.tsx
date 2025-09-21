'use client';

import type { ComponentConfig } from '@measured/puck';

type ListType = 'dash' | 'bullet' | 'numbered' | 'checklist';

export type ChecklistBlockProps = {
  title?: string;
  listType?: ListType;
  items?: { text: string }[]; // array-driven, add/remove items in the editor
};

export const ChecklistBlock: ComponentConfig<ChecklistBlockProps> = {
  label: 'Checklist',
  fields: {
    title: { type: 'text', label: 'Title (optional)' },
    listType: {
      type: 'select',
      options: [
        { label: 'Checklist', value: 'checklist' },
        { label: 'Bullet', value: 'bullet' },
        { label: 'Numbered', value: 'numbered' },
        { label: 'Dash', value: 'dash' },
      ],
    },
    items: {
      type: 'array',
      arrayFields: {
        text: { type: 'text', label: 'Item' },
      },
      defaultItemProps: { text: '' },
      getItemSummary: (item) => item.text || 'Item',
    },
  },
  defaultProps: {
    title: 'Pre-Flight Checklist',
    listType: 'checklist',
    items: [
      { text: 'Vehicle power up' },
      { text: 'Ground systems checkout' },
      { text: 'Flight software load & config' },
      { text: 'Avionics built-in tests Pass' },
    ],
  },
  render: ({ title, listType = 'checklist', items = [] }) => {
    const hasItems = items.length > 0;
    if (!title && !hasItems) return null;

    const isNumbered = listType === 'numbered';
    const isChecklist = listType === 'checklist';
    const isBullet = listType === 'bullet';
    const isDash = listType === 'dash';

    const ListTag = (isNumbered ? 'ol' : 'ul') as 'ol' | 'ul';
    const listStyle = isNumbered
      ? 'list-decimal'
      : isBullet
        ? 'list-disc'
        : 'list-none';

    return (
      <section className="my-8">
        {title && (
          <h3 className="mb-3 text-xl font-semibold tracking-tight">{title}</h3>
        )}

        {hasItems && (
          <ListTag className={`${listStyle} pl-6 space-y-2`}>
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-2">
                {isChecklist && (
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 cursor-default"
                    defaultChecked={false}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                )}
                {isDash && (
                  <span className="select-none" aria-hidden="true">
                    -
                  </span>
                )}
                {isBullet && (
                  <span className="select-none" aria-hidden="true">
                    •
                  </span>
                )}
                {isNumbered && (
                  <span className="select-none" aria-hidden="true">
                    {i + 1}.
                  </span>
                )}
                <span className="leading-6">{it.text}</span>
              </li>
            ))}
          </ListTag>
        )}
      </section>
    );
  },
};
