// Build the initial Puck page JSON for a new Proc

import { Metadata, PuckPageData } from '@/app/puck/types';
import { now } from 'mongoose';

export type InitialProcsProps = {
  title: string;
  owner: string;
  projectTag?: string[];
  description?: string | null;
  /** Tailwind padding class (e.g., 'p-16'). Defaults to 'p-16' */
  paddingClass?: string;
  metadata?: Metadata;
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
  title,
  owner,
  projectTag,
  description,
  paddingClass = 'p-16',
}: InitialProcsProps): PuckPageData {
  return {
    root: {
      props: {
        title,
        tags: projectTag ?? [],
        description: description ?? '',
        padding: paddingClass,
      },
    },
    content: [
      {
        type: 'TextBlock',
        props: {
          text: `This is your new page. Click the Edit Button at the top right to modify this page's contents.`,
          id: genId(`TextBlock-${owner}`),
        },
      },
    ],
    zones: {},
    metadata: {
      title,
      createdAt: new Date().toISOString(),
      createdBy: owner,
      updatedAt: '',
      updatedBy: '',
      version: 0,
    },
  };
}
