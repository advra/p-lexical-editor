'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useProc } from '@/context/ProcContext';
import { useSession } from '@/context/SessionContext';
import { useUser } from '@/context/UserContext';
import Button from '@/components/common/buttons/Button';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

interface JoinLiveSessionBannerProps {
  procId: string;
}

export function JoinLiveSessionBanner({ procId }: JoinLiveSessionBannerProps) {
  const trpc = useTRPC();
  const { viewMode } = useProc();
  const { activeSession } = useSession();
  const { session: userSession } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query for active sessions
  const { data: activeSessionsData, isLoading } = useQuery(
    trpc.procSessions.getActiveSessions.queryOptions({
      procId,
    }),
  );

  // Don't show banner if:
  // - User is already in a session
  // - User is in execute mode
  // - There are no active sessions
  // - User is not logged in
  if (
    activeSession ||
    viewMode === 'execute' ||
    !activeSessionsData?.sessions?.length ||
    !userSession?.user?.username
  ) {
    return null;
  }

  const handleJoinSession = async () => {
    try {
      // Get the first active session (most recent)
      const targetSession = activeSessionsData.sessions[0];

      if (!targetSession) {
        toast.error('No active session found');
        return;
      }

      // Create URL with sessionId parameter
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set('sessionId', targetSession._id);

      // Navigate to the same page with sessionId parameter
      const newUrl = `${window.location.pathname}/execute?${currentParams.toString()}`;
      router.push(newUrl);

      toast.success('Joining live session...');
    } catch (error) {
      console.error('Failed to join session:', error);
      toast.error('Failed to join session');
    }
  };

  const sessionCount = activeSessionsData.sessions.length;
  const sessionText =
    sessionCount === 1 ? '1 active session' : `${sessionCount} active sessions`;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-blue-800 font-medium">
              Live Session Available
            </span>
          </div>
          <span className="text-blue-600 text-sm">
            {sessionText} in progress
          </span>
        </div>
        <Button
          onClick={handleJoinSession}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
        >
          Join Live Session
        </Button>
      </div>
    </div>
  );
}
