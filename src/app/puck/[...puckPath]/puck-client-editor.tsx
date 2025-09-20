/*
  This dynamically renders the puck editor in the path: ex: /procs/34uerj
*/

'use client';

import type { Data } from '@measured/puck';
import { Puck } from '@measured/puck';
import config from '../../../puck.config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function PuckClientEditor({
  path,
  data,
}: {
  path: string;
  data: Partial<Data>;
}) {
  const router = useRouter();
  return (
    <>
      <Puck
        config={config}
        data={data}
        onPublish={async (data) => {
          const slug = path.split('/').filter(Boolean).pop()!;
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
        }}
      ></Puck>
    </>
  );
}
