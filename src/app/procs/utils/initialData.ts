// Build the initial Puck page JSON for a new Proc

export type InitialProcsProps = {
  title: string;
  owner: string;
  projectTag?: string | null;
  description?: string | null;
  /** Tailwind padding class (e.g., 'p-16'). Defaults to 'p-16' */
  paddingClass?: string;
};

// Narrow type for your Puck page data (adjust as your blocks grow)
export type PuckPageData = {
  root: {
    props: {
      title: string;
      owner: string;
      projectTag: string | null;
      description: string;
      padding: string;
    };
  };
  content: Array<{
    type: 'TextBlock' | string;
    props: Record<string, unknown>;
  }>;
  zones: Record<string, unknown>;
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
  projectTag = null,
  description = null,
  paddingClass = 'p-16',
}: InitialProcsProps): PuckPageData {
  return {
    root: {
      props: {
        title,
        owner,
        projectTag,
        description,
        padding: paddingClass,
      },
    },
    content: [
      {
        type: 'TextBlock',
        props: {
          text: 'This is your new page. Click edit to modify the contents.',
          id: genId(`TextBlock-${owner}`),
        },
      },
    ],
    zones: {},
  };
}
