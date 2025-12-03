'use client';

import ProfileAvatarMenu from '@/components/common/profile/profile-avatar';
import DocsTabbedTable, { Doc } from './DocsTabbedTable';
import { useUser } from '@/context/UserContext';
import { Suspense, useState } from 'react';
import { ProcsTabbedTableSkeleton } from './ClientDashboardSkeleton';

export const ClientDashboard = ({ procs }: { procs: Doc[] }) => {
  const { session, loading: userLoading, error: userError } = useUser();
  return (
    <>
      <div className="h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="container mx-auto mt-8 px-4">
          <div className="flex items-center">
            <div className="font-semibold my-4 text-2xl">Documents</div>

            <div className="ml-auto">
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
                  username={session?.user.username ?? 'Guest'}
                  avatarUrl={null}
                />
              )}
            </div>
          </div>
          <div className="container mx-auto flex-1 min-h-0">
            <Suspense fallback={<ProcsTabbedTableSkeleton />}>
              <div className="h-full">
                <DocsTabbedTable
                  docs={procs}
                  currentUser={session?.user ?? null}
                />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};
