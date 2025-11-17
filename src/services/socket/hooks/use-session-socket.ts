import { useState, useEffect, useCallback } from 'react';
import { sessionSocketService } from '../session-socket';
import type { SessionStatusData } from '../types';
import { User } from '@/modules/auth/types';

interface UseSessionSocketReturn {
  isConnected: boolean;
  sessionStatus: SessionStatusData | null;
  lastUpdate: SessionStatusData | null;
  joinRoom: (sessionId: string, username?: string) => void;
  leaveRoom: (sessionId: string) => void;
  stopSession: (
    roomSessionId: string,
    user?: User | null,
  ) => void;
}

/**
 * Hook for managing session socket connections and status updates
 */
export function useSessionSocket(
  username: string | null,
  sessionId?: string,
): UseSessionSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatusData | null>(
    null,
  );
  const [lastUpdate, setLastUpdate] = useState<SessionStatusData | null>(null);

  // Join room when sessionId changes
  const joinRoom = useCallback(
    (roomSessionId: string, roomUsername?: string) => {
      sessionSocketService.joinSessionRoom(roomSessionId, roomUsername);
    },
    [],
  );

  // Leave room
  const leaveRoom = useCallback((roomSessionId: string) => {
    sessionSocketService.leaveSessionRoom(roomSessionId);
  }, []);

  // when stopped
  const stopSession = useCallback(
    (roomSessionId: string, user?: User | null) => {
      // TODO: get user and their permissions
      const canExecute = true;
      if (user && canExecute) {
        console.log('[useSessionSocket] Emitting session:status-changed:', {
          room: roomSessionId,
          sessionId: roomSessionId,
          status: 'completed',
          changedBy: user.username,
        });

        sessionSocketService.emitSessionStatusChanged({
          sessionId: roomSessionId,
          status: 'completed',
          room: roomSessionId, // Use sessionId as room for targeted notifications
          changedBy: user.username,
        });
      }
    },
    [],
  );

  useEffect(() => {
    // Update connection status
    const connected = sessionSocketService.isConnected();
    console.log('[useSessionSocket] Socket connection status:', connected);
    setIsConnected(connected);

    // Listen for session status updates
    const cleanupListener = sessionSocketService.onSessionStatusUpdate(
      (data) => {
        console.log(
          '[useSessionSocket] Received session:status-updated:',
          data,
        );
        setSessionStatus(data);
        setLastUpdate(data);
      },
    );

    // Cleanup on unmount
    return () => {
      console.log('[useSessionSocket] Cleaning up socket listeners');
      cleanupListener();
      if (sessionId) {
        sessionSocketService.leaveSessionRoom(sessionId);
      }
    };
  }, [sessionId]);

  // Auto-join room when sessionId is provided
  useEffect(() => {
    if (sessionId) {
      console.log(
        '[useSessionSocket] Auto-joining room:',
        sessionId,
        'for user:',
        username,
      );
      joinRoom(sessionId, username);
    }

    return () => {
      if (sessionId) {
        console.log('[useSessionSocket] Leaving room:', sessionId);
        leaveRoom(sessionId);
      }
    };
  }, [sessionId, username, joinRoom, leaveRoom]);

  return {
    isConnected,
    sessionStatus,
    lastUpdate,
    joinRoom,
    leaveRoom,
    stopSession,
  };
}
