/*
  This dynamically renders the puck editor in the path: ex: /procs/34uerj
*/

'use client';

import type { Data } from '@measured/puck';
import { Puck, usePuck } from '@measured/puck';
import config from '../../../../puck.config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DiscardChangesButton } from '@/components/puck/ui/DiscardChangesButton';
import { BackToDashboardButton } from '@/components/puck/ui/puck-editor/components/BackToDashboardButton';
import { PublishChangesButton } from '@/components/puck/ui/PublishChangesButton';
import { ProcProvider } from '@/context/ProcContext';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import useUser from '@/hooks/use-user';

function HeaderBar({ onPublish, slug }) {
  const puck = usePuck();
  return (
    <>
      <div className="flex h-[48px] w-full items-center justify-between p-2 border-b-1 border-b-gray-300 shadow-xs">
        <BackToDashboardButton />
        <div className="flex items-center">
          <DiscardChangesButton slug={slug} />
          <PublishChangesButton
            onPublish={() => onPublish(puck.appState.data)}
          />
        </div>
      </div>
    </>
  );
}

export function PuckClientEditor({
  pathName,
  proc,
  slug,
}: {
  pathName: string;
  proc:
    | ProcPublic
    | (ProcPublicWithAcl & {
        data: Partial<Data>;
      });
  slug: string;
}) {
  const router = useRouter();
  // const slug = path.split('/').filter(Boolean).pop()!;
  const { session, loading } = useUser();
  const user = session?.user;
  // Check if user has edit permissions
  const isOwner = proc.owner === user?.username;
  const isAdmin = user?.roles?.includes('admin');
  const userPermissions = {
    read: isOwner || isAdmin || true, // Default to true for now
    edit: !!(isOwner || isAdmin),
    execute: !!(isOwner || isAdmin),
  };

  const handlePublish = async (data: Partial<Data>) => {
    try {
      const res = await fetch(`/api/puck/proc/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save changes');
      }

      toast.success('Changes saved!');
      // Redirect to view mode instead of staying in edit mode
      const viewPath = pathName.replace('/edit', '');
      router.push(viewPath);
    } catch {
      toast.error('Error saving, please try again...');
    }
  };

  return (
    <>
      <ProcProvider
        viewMode={'edit'}
        owner={proc.owner}
        permissions={userPermissions}
        currentUser={user}
        procId={proc._id}
      >
        <div className="h-screen overflow-auto">
          <Puck
            iframe={{ enabled: false, waitForStyles: false }}
            config={config}
            data={proc.data}
            onPublish={handlePublish}
            overrides={{
              headerActions: ({ children }) => (
                <>
                  <DiscardChangesButton slug={slug} />
                  {children}
                </>
              ),

              // custom fields
              fieldTypes: {
                checkbox: ({ field, name, value, onChange }) => (
                  <label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                    {field.label || name}
                  </label>
                ),
              },
            }}
          ></Puck>
        </div>
      </ProcProvider>
    </>
  );
}
