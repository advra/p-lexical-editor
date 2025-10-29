import { useState, useEffect, useCallback } from 'react';
import { sessionSocketService } from '../session-socket';
import type { SessionStatusData } from '../types';

interface UseSessionSocketReturn {
  isConnected: boolean;
  sessionStatus: SessionStatusData | null;
  lastUpdate: SessionStatusData | null;
  joinRoom: (procId: string, username?: string) => void;
  leaveRoom: (procId: string) => void;
}

/**
 * Hook for managing session socket connections and status updates
 */
export function useSessionSocket(procId?: string, username?: string): UseSessionSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatusData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<SessionStatusData | null>(null);

  // Join room when procId changes
  const joinRoom = useCallback((roomProcId: string, roomUsername?: string) => {
    sessionSocketService.joinSessionRoom(roomProcId, roomUsername);
  }, []);

  // Leave room
  const leaveRoom = useCallback((roomProcId: string) => {
    sessionSocketService.leaveSessionRoom(roomProcId);
  }, []);

  useEffect(() => {
    // Update connection status
    setIsConnected(sessionSocketService.isConnected());

    // Listen for session status updates
    const cleanupListener = sessionSocketService.onSessionStatusUpdate((data) => {
      setSessionStatus(data);
      setLastUpdate(data);
    });

    // Cleanup on unmount
    return () => {
      cleanupListener();
      if (procId) {
        sessionSocketService.leaveSessionRoom(procId);
      }
    };
  }, [procId]);

  // Auto-join room when procId is provided
  useEffect(() => {
    if (procId) {
      joinRoom(procId, username);
    }

    return () => {
      if (procId) {
        leaveRoom(procId);
      }
    };
  }, [procId, username, joinRoom, leaveRoom]);

  return {
    isConnected,
    sessionStatus,
    lastUpdate,
    joinRoom,
    leaveRoom,
  };
}
