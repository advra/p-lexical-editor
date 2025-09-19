'use client';

import ProfileAvatarMenu from '@/components/common/profile/profile-avatar';
import ProcsTabbedTable, { Proc } from './ProcsTabbedTable';
import useUser from '@/hooks/use-user';
import { useEffect, useState } from 'react';
import { getSessionFromCookie } from '@/lib/utils/auth';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export const ClientDashboard = () => {
  const { user, loading: userLoading, error: userError } = useUser();
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.procs.listAll.queryOptions({ limit: 50 }),
  );

  const [procsLoading, setProcsLoading] = useState(false);
  const [procsError, setProcsError] = useState<string | null>(null);

  const username = user?.username ?? 'Guest';

  return (
    <>
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto mt-8 gap-4 px-4">
          <div className="flex items-center">
            <div className="font-semibold my-4 text-2xl">Procedures</div>

            <div className="ml-auto mr-4">
              {/* Show a tiny skeleton while loading (optional) */}
              {userLoading ? (
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
                  avatarUrl={null}
                />
              )}
            </div>
          </div>

          {/* If you want to block the table until we know who the user is */}
          {userError && (
            <div className="text-red-600 text-sm">Failed to load user.</div>
          )}

          {isLoading && (
            <div className="text-gray-600 text-sm">Loading procedures...</div>
          )}

          {procsError && (
            <div className="text-red-600 text-sm">
              Failed to load procedures: {procsError}
            </div>
          )}

          {!isLoading && !procsError ? (
            // <ProcsTabbedTable procs={data} currentUsername={username} />
            <>LOADED: {JSON.stringify(data, null, 2)}</>
          ) : (
            <>
              <div className="w-full animate-pulse bg-gray-500 h-full"></div>
            </>
          )}
        </div>
      </main>
    </>
  );
};
