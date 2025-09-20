/*
  This dynamically renders the puck editor in the path: ex: /procs/34uerj
*/

'use client';

import type { Data } from '@measured/puck';
import { Puck, usePuck } from '@measured/puck';
import config from '../../../puck.config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { slugSchema } from '@/modules/procs/server/schemas';
import { DiscardChangesButton } from '@/components/puck/ui/DiscardChangesButton';
import { BackToDashboardButton } from '@/app/procs/[...puckPath]/ui/components/BackToDashboardButton';
import { PublishChangesButton } from '@/components/puck/ui/PublishChangesButton';

export function PuckClientEditor({
  path,
  data,
}: {
  path: string;
  data: Partial<Data>;
}) {
  const router = useRouter();
  const slug = path.split('/').filter(Boolean).pop()!;

  const handlePublish = async (data: Partial<Data>) => {
    try {
      const res = await fetch(`/api/puck/proc/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
        }),
      });
      toast.success('Changes saved!');
      router.push(path);
    } catch {
      toast.error('Error saving, please try again...');
    }
  };

  return (
    <>
      <Puck
        config={config}
        data={data}
        // onPublish={handlePublish}
        overrides={{
          // Render a custom element for each item in the component list
          // drawerItem: ({ name }) => (
          //   <div style={{ backgroundColor: 'hotpink' }}>{name}</div>
          // ),
          header: ({ actions, children }) => {
            const puck = usePuck();
            console.log('PUCK DATA:', puck.appState);
            return (
              <>
                <div className="flex h-12 w-full items-center justify-between p-2">
                  <BackToDashboardButton />
                  <div className="flex items-center">
                    <DiscardChangesButton slug={slug} />
                    <PublishChangesButton
                      onPublish={() => handlePublish(puck.appState.data)}
                    />
                  </div>
                </div>
              </>
            );
          },
        }}
      >
        <Puck.Preview />
      </Puck>
    </>
  );
}
