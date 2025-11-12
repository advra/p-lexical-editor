'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'sonner';
import { useProc } from '@/context/ProcContext';
import { CircularProgress, Tooltip } from '@mui/material';
import { User } from '@/modules/auth/types';
import { useSession } from '@/context/SessionContext';
import { CustomCursorTooltip } from '@/components/common/CopyTooltip';

type Props = {
  user: User | undefined;
  canExecute: boolean;
};

export const SessionButtons = ({ user, canExecute }: Props) => {
  const pathname = usePathname();
  const { procId } = useProc();
  const {
    activeSession,
    isSessionOwner,
    isLoading,
    createSession,
    stopSession,
    isCreatingSession,
    isStoppingSession,
  } = useSession();

  const [showShareLink, setShowShareLink] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState({
    show: false,
    position: { x: 0, y: 0 },
  });

  // Reset tooltip state after duration
  useEffect(() => {
    if (copyTooltip.show) {
      const timer = setTimeout(() => {
        setCopyTooltip((prev) => ({ ...prev, show: false }));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [copyTooltip.show]);

  // Initialize showShareLink based on session ownership
  useEffect(() => {
    if (activeSession) {
      setShowShareLink(true);
    } else {
      setShowShareLink(false);
    }
  }, [activeSession, isSessionOwner]);

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

  const handleStartSession = async () => {
    if (!procId) return;
    createSession();
  };

  const handleStopSession = async () => {
    if (!activeSession?._id || !isSessionOwner) return;
    stopSession();
  };

  const copyShareLink = async (event: React.MouseEvent) => {
    if (!activeSession?._id || !procId) return;

    const { clientX, clientY } = event;
    const shareLink = `${window.location.origin}/procs/${procSlug}/execute/?sessionId=${activeSession._id}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      // Show custom tooltip at cursor position
      setCopyTooltip({
        show: true,
        position: { x: clientX, y: clientY },
      });
      console.log('YES');
    } catch {
      toast.error('Failed to copy share link');
    }
  };

  const getShareLink = () => {
    if (!activeSession?._id || !procSlug) return '';
    return `${window.location.origin}/procs/${procSlug}/execute?sessionId=${activeSession._id}`;
  };

  let renderedButton;
  if (isLoading || isCreatingSession || isStoppingSession) {
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
        {showShareLink && (
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
                copyShareLink(e);
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
            disabled={isStoppingSession || !canStopSession}
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

  return (
    <>
      {renderedButton}
      <CustomCursorTooltip
        show={copyTooltip.show}
        position={copyTooltip.position}
        message="URL Copied!"
      />
    </>
  );
};
