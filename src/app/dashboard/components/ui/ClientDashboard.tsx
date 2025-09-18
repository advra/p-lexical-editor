'use client';

import ProfileAvatarMenu from '@/components/common/profile/profile-avatar';
import ProcsTabbedTable, { Proc } from './ProcsTabbedTable';
import useUser from '@/hooks/use-user';

const sampleProcs: Proc[] = [
  {
    id: '1',
    name: 'Proc A',
    owner: 'alice',
    sharedWith: ['bob', 'carol'],
    updatedAt: '2025-01-10',
  },
  {
    id: '2',
    name: 'Proc B',
    owner: 'bob',
    sharedWith: [],
    updatedAt: '2025-03-02',
  },
  {
    id: '3',
    name: 'Proc C',
    owner: 'me',
    sharedWith: ['alice'],
    updatedAt: '2025-02-20',
  },
];

export const ClientDashboard = () => {
  const { user, loading, error } = useUser();

  const username = user?.username ?? 'Guest';

  return (
    <main className="flex-1 bg-gray-50">
      <div className="container mx-auto mt-8 gap-4 px-4">
        <div className="flex items-center">
          <div className="font-semibold my-4 text-2xl">Procedures</div>

          <div className="ml-auto mr-4">
            {/* Show a tiny skeleton while loading (optional) */}
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
                <div
                  className="rounded-full bg-gray-300 animate-pulse mr-[4px]"
                  style={{ width: 36, height: 36 }}
                />
              </div>
            ) : (
              <ProfileAvatarMenu
                username={user ? user.username : null}
                avatarUrl={user?.avatar ?? null}
              />
            )}
          </div>
        </div>

        {/* If you want to block the table until we know who the user is */}
        {error && (
          <div className="text-red-600 text-sm">Failed to load user.</div>
        )}

        <ProcsTabbedTable procs={sampleProcs} currentUser={username} />
      </div>
    </main>
  );
};
