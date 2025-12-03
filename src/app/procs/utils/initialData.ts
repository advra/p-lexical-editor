// Build the initial Puck page JSON for a new Proc

import { PuckPageData } from '@/app/puck/types';

export type InitialProcsProps = {
  owner: string;
  title: string;
  description?: string | null;
  tags?: string[];
  /** Tailwind padding class (e.g., 'p-16'). Defaults to 'p-16' */
  paddingClass?: string;
};

function genId(prefix: string) {
  // Works in browser/node; falls back if crypto.randomUUID isn't available
  const rid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${rid}`;
}

export function initialProcsData({
  owner,
  title,
  description,
  tags,
  paddingClass = 'p-16',
}: InitialProcsProps): PuckPageData {
  return {
    root: {
      props: {
        title,
        description: description ?? '',
        tags: tags ?? [],
        padding: paddingClass,
      },
    },
    content: [
      {
        type: 'TextBlock',
        props: {
          text: `Hi ${owner}! This is your new page. Click the Edit Button at the top right to modify this page's contents.`,
          id: genId(`TextBlock-${owner}`),
        },
      },
    ],
    zones: {},
  };
}
