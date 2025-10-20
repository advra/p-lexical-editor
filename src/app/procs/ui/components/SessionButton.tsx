'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'sonner';
import { ProcPermissions, useProc } from '@/context/ProcContext';
import { CircularProgress, Tooltip } from '@mui/material';
import { checkActiveSession } from '@/services/proc-session-service';
import { User } from '@/modules/auth/types';

type Props = {
  user: User | undefined;
};

export const SessionButtons = ({ user }: Props) => {
  const { procId, permissions, owner } = useProc();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareLink, setShowShareLink] = useState(false);
  const [isSessionOwner, setIsSessionOwner] = useState(false);

  const canExecute = useMemo(() => {
    const username = user?.username;
    if (!username) return false;
    if (username === owner) return true;
    return !!permissions[username]?.execute;
  }, [user?.username, owner, permissions]);

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

  useEffect(() => {
    const checkSession = async () => {
      if (!canExecute || !procId) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if URL has sessionId parameter
        const sessionId = searchParams.get('sessionId');

        if (sessionId) {
          // If sessionId is in URL, fetch and set that session
          const response = await fetch(
            `/api/proc-sessions?procId=${procId}&sessionId=${sessionId}`,
          );
          const result = await response.json();

          if (result.sessions && result.sessions.length > 0) {
            const session = result.sessions[0];
            setActiveSession(session);
            setShowShareLink(true);
            // Check if current user is the session owner
            setIsSessionOwner(session.createdBy === user?.username);
          } else {
            setActiveSession(null);
            setIsSessionOwner(false);
            // Remove invalid sessionId from URL
            updateUrlWithSession(null);
          }
        } else {
          // If no sessionId in URL, check if user has active session
          const userSession = await checkActiveSession(procId, user?.username);
          if (userSession) {
            setActiveSession(userSession);
            setShowShareLink(true);
            setIsSessionOwner(true);
            // Update URL with user's session
            updateUrlWithSession(userSession._id);
          } else {
            setActiveSession(null);
            setIsSessionOwner(false);
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
        setActiveSession(null);
        setIsSessionOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [procId, user, canExecute]);

  const startSession = async () => {
    if (!procId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/proc-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procId, user }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const result = await response.json();
      setActiveSession(result.session);
      setShowShareLink(true);
      setIsSessionOwner(true);
      // Update URL with new session ID
      updateUrlWithSession(result.session._id);
      toast.success('Session started! Share the link with others to join.');
      console.log('Session started ', result);
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const startButtonToolTip = canExecute
    ? 'Start Session'
    : 'You do not have Execute permissions to Start a Test Execution Session';
  const stopButtonToolTip = isSessionOwner
    ? 'Stop Session'
    : 'You can only stop sessions that you started';

  const stopSession = async () => {
    if (!activeSession?._id || !isSessionOwner) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/proc-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession._id,
          status: 'completed',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Stop session error details:', errorData);
        throw new Error(
          `Failed to stop session: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      console.log('Stop session success:', result);

      setActiveSession(null);
      setShowShareLink(false);
      setIsSessionOwner(false);
      // Remove sessionId from URL
      updateUrlWithSession(null);
      toast.success('Session completed!');
    } catch (error) {
      console.error('Failed to stop session:', error);
      toast.error('Failed to stop session - check console for details');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!activeSession?._id || !procId) return;

    const shareLink = `${window.location.origin}/procs/${procId}/execute/?sessionId=${activeSession._id}`;
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
    if (!activeSession?._id || !procId) return '';
    return `${window.location.origin}/procs/${procId}/execute/?sessionId=${activeSession._id}`;
  };

  let renderedButton;
  if (isLoading) {
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
            <span className="text-xs text-blue-700">Share:</span>
            <input
              type="text"
              value={getShareLink()}
              readOnly
              className="text-xs bg-white border border-blue-300 rounded px-2 py-1 w-64"
              onClick={(e) => e.currentTarget.select()}
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
            onClick={stopSession}
            disabled={isLoading || !canStopSession}
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
      <Tooltip title={startButtonToolTip}>
        <button
          onClick={startSession}
          disabled={isLoading || !canExecute}
          className="rounded-sm aspect-square h-[30px] border-green-500 hover:border-green-400 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={startButtonToolTip}
        >
          <PlayCircleFilledIcon className="m-0.5 text-green-600 hover:text-green-500" />
        </button>
      </Tooltip>
    );
  }

  return renderedButton;
};
