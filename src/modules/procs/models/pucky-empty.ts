// puck-empty.ts
import type { PuckPageData } from '@/app/puck/types';

export const EMPTY_PUCK_DATA: PuckPageData = {
  content: [],
  root: {
    // Only props are required per your DefaultRootFieldProps extension
    props: {
      tags: [],
      description: '',
      padding: '16',
    },
  },
};

export function normalizePuckData(data: unknown): PuckPageData {
  // minimal guard: require top-level content & root
  const d = (data ?? {}) as any;
  const content =
    d && typeof d === 'object' && d.content && typeof d.content === 'object'
      ? d.content
      : {};
  const rootProps = d?.root?.props ?? {};
  return {
    content,
    root: {
      props: {
        tags: Array.isArray(rootProps.tags) ? rootProps.tags : [],
        description:
          typeof rootProps.description === 'string'
            ? rootProps.description
            : '',
        padding:
          typeof rootProps.padding === 'string' ? rootProps.padding : 'md',
      },
    },
  };
}
