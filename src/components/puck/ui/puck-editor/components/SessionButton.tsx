'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'sonner';
import { ProcPermissions, useProc } from '@/context/ProcContext';
import { CircularProgress, Tooltip } from '@mui/material';
import { checkActiveSession } from '@/services/proc-session-service';
import { User } from '@/modules/auth/types';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';

type Props = {
  user: User | undefined;
  canExecute: boolean;
};

export const SessionButtons = ({ user, canExecute }: Props) => {
  const pathname = usePathname();
  const trpc = useTRPC();
  const { procId } = useProc();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareLink, setShowShareLink] = useState(false);
  const [isSessionOwner, setIsSessionOwner] = useState(false);

  const SLUG_PREFIX = '/procs/' as const;
  const hasProcSlug = pathname.startsWith(SLUG_PREFIX);
  // Extract just the proc slug without any additional paths like /execute/
  const procSlug = hasProcSlug
    ? pathname.slice(SLUG_PREFIX.length).split('/')[0]
    : '';

  const startButtonToolTip = canExecute
    ? 'Start Session'
    : 'You do not have Execute permissions to Start a Test Execution Session';
  const stopButtonToolTip = isSessionOwner
    ? 'Stop Session'
    : 'You can only stop sessions that you started';

  // Update URL with sessionId parameter
  const updateUrlWithSession = (sessionId: string | null) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    if (sessionId) {
      currentParams.set('sessionId', sessionId);
    } else {
      currentParams.delete('sessionId');
    }

    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const {
    mutate: createSession,
    isPending: isCreatingSession,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
  } = useMutation(
    trpc.procSessions.createSession.mutationOptions({
      onSuccess: (data) => {
        setActiveSession(data.session);
        setShowShareLink(true);
        setIsSessionOwner(true);
        updateUrlWithSession(data.session._id);
        toast.success('Session started! Share the link with others to join.');
      },
      onError: (e: any) => {
        console.error('Failed to start session:', e);
        toast.error('Failed to start session');
      },
    }),
  );

  const {
    mutate: stopSession,
    isPending: isUpdatingSession,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useMutation(
    trpc.procSessions.stopSession.mutationOptions({
      onSuccess: (data) => {
        setActiveSession(null);
        setShowShareLink(false);
        setIsSessionOwner(false);
        updateUrlWithSession(null);
        toast.success('Session completed!');
      },
      onError: (e: any) => {
        console.error('Failed to stop session:', e);
        toast.error('Failed to stop session - check console for details');
      },
    }),
  );

  // Query for sessions from URL parameter
  const sessionId = searchParams.get('sessionId');
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    ...trpc.procSessions.getSessions.queryOptions({
      procId: procId || '',
      sessionId: sessionId || undefined,
    }),
    enabled: !!(sessionId && procId),
  });

  useEffect(() => {
    const checkSession = async () => {
      if (!canExecute || !procId) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if we have session data from URL query
        if (
          sessionData &&
          sessionData.sessions &&
          sessionData.sessions.length > 0
        ) {
          const session = sessionData.sessions[0];
          // Only set as active session if it's active status (lowercase from backend)
          if (session.status === 'active') {
            setActiveSession(session);
            setShowShareLink(true);
            setIsSessionOwner(session.createdBy === user?.username);
          } else {
            // Session exists but is not active (completed or canceled)
            setActiveSession(null);
            setIsSessionOwner(false);
            setShowShareLink(false);
            // Remove invalid sessionId from URL
            updateUrlWithSession(null);
          }
        } else if (sessionId) {
          // Session ID in URL but no session found in database
          setActiveSession(null);
          setIsSessionOwner(false);
          setShowShareLink(false);
          // Remove invalid sessionId from URL
          updateUrlWithSession(null);
        } else {
          // If no sessionId in URL, check if user has active session
          // But DO NOT create a new session automatically
          const userSession = await checkActiveSession(procId, user?.username);
          if (userSession) {
            setActiveSession(userSession);
            updateUrlWithSession(userSession._id);
            setShowShareLink(true);
            setIsSessionOwner(true);
            // Don't update URL automatically - only update when user explicitly starts a session
          } else {
            // No active session found - don't create one automatically
            setActiveSession(null);
            setIsSessionOwner(false);
            setShowShareLink(false);
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
        setActiveSession(null);
        setIsSessionOwner(false);
        setShowShareLink(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [procId, user, canExecute, sessionData, sessionId]);

  const handleStartSession = async () => {
    if (!procId) return;
    createSession({ procId });
  };

  const handleStopSession = async () => {
    if (!activeSession?._id || !isSessionOwner) return;
    stopSession({
      sessionId: activeSession._id,
    });
  };

  const copyShareLink = () => {
    if (!activeSession?._id || !procId) return;

    const shareLink = `${window.location.origin}/procs/${procSlug}/execute/?sessionId=${activeSession._id}`;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success('Share link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy share link');
      });
  };

  const getShareLink = () => {
    if (!activeSession?._id || !procSlug) return '';
    return `${window.location.origin}/procs/${procSlug}/execute/?sessionId=${activeSession._id}`;
  };

  let renderedButton;
  if (isLoading || isCreatingSession || isUpdatingSession) {
    renderedButton = (
      <div className="h-[30px] w-[30px] grid place-items-center">
        <CircularProgress size={20} sx={{ display: 'block' }} />
      </div>
    );
  } else if (activeSession) {
    // User is in a session
    const canStopSession = isSessionOwner && canExecute;

    renderedButton = (
      <div className="flex items-center gap-2">
        {/* Share Link Display - Show for session owners */}
        {showShareLink && isSessionOwner && (
          <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
            <span className="hidden lg:block text-xs text-blue-700">
              Share:
            </span>
            <input
              type="text"
              value={getShareLink()}
              readOnly
              className="hidden lg:block text-xs bg-white border border-blue-300 rounded px-2 py-1 w-64"
              onClick={(e) => {
                e.currentTarget.select();
                copyShareLink();
              }}
            />
            <Tooltip title="Copy share link">
              <button
                onClick={copyShareLink}
                className="text-blue-600 hover:text-blue-800"
              >
                <ShareIcon fontSize="small" />
              </button>
            </Tooltip>
          </div>
        )}
        {/* Stop Session Button - Only enabled for session owners */}
        <Tooltip title={stopButtonToolTip}>
          <button
            onClick={handleStopSession}
            disabled={isUpdatingSession || !canStopSession}
            className="rounded-sm aspect-square h-[30px] border-red-500 hover:border-red-400 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopCircleIcon className="m-0.5 text-red-600 hover:text-red-500" />
          </button>
        </Tooltip>
      </div>
    );
  } else {
    // No active session - show start button
    renderedButton = (
      <button
        onClick={handleStartSession}
        disabled={isCreatingSession || !canExecute}
        className="rounded-sm aspect-square h-[30px] border-green-500 hover:border-green-400 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={startButtonToolTip}
      >
        <Tooltip title={startButtonToolTip}>
          <PlayCircleFilledIcon className="m-0.5 text-green-600 hover:text-green-500" />
        </Tooltip>
      </button>
    );
  }

  return renderedButton;
};
