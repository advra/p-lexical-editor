'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSessionSocket } from '@/services/socket';
import { User } from '@/modules/auth/types';
import { getSocket } from '@/lib/socket';
import { useUser } from './UserContext';
import { useProcPermissions } from './ProcContext';

export interface Session {
  _id: string;
  procId: string;
  createdBy: string;
  status: 'active' | 'completed' | 'canceled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  name?: string;
  records?: Array<{
    recordId: string;
    blockType: string;
    state: 'pending' | 'complete';
    updatedBy: string;
    updatedAt: string;
    data?: Record<string, any>;
  }>;
}

interface SessionContextType {
  activeSession: Session | null;
  isSessionOwner: boolean;
  isLoading: boolean;
  createSession: () => void;
  stopSession: () => void;
  isCreatingSession: boolean;
  isStoppingSession: boolean;
  // Helper to get completion state for a specific record
  getRecordCompletion: (recordId: string) => boolean | undefined;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
  procId: string;
}

export function SessionProvider({ children, procId }: SessionProviderProps) {
  const pathname = usePathname();
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { canExecute } = useProcPermissions();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isSessionOwner, setIsSessionOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get('sessionId');

  // Socket hook for real-time session status updates
  const { sessionStatus, stopSession: socketStopSession } = useSessionSocket(
    user?.username ?? null,
    sessionId || activeSession?._id,
  );

  const SLUG_PREFIX = '/procs/' as const;
  const hasProcSlug = pathname.startsWith(SLUG_PREFIX);
  const procSlug = hasProcSlug
    ? pathname.slice(SLUG_PREFIX.length).split('/')[0]
    : '';

  // Update URL with sessionId parameter
  const updateUrlWithSession = useCallback(
    (sessionId: string | null) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      if (sessionId) {
        currentParams.set('sessionId', sessionId);
      } else {
        currentParams.delete('sessionId');
      }

      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router],
  );

  // Session creation mutation
  const { mutate: createSession, isPending: isCreatingSession } = useMutation(
    trpc.procSessions.createSession.mutationOptions({
      onSuccess: (data) => {
        setActiveSession(data.session);
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

  // Session stopping mutation
  const { mutate: stopSession, isPending: isStoppingSession } = useMutation(
    trpc.procSessions.stopSession.mutationOptions({
      onSuccess: (data) => {
        console.log('[SessionProvider] Stop session success:', {
          sessionId: activeSession?._id,
          procId,
          user: user?.username,
        });

        setActiveSession(null);
        setIsSessionOwner(false);
        updateUrlWithSession(null);
        toast.success('Session completed!');

        // notify other users
        if (activeSession?._id) {
          socketStopSession(activeSession._id, user);
        } else {
          console.error(
            '[SessionProvider] Cannot notify other users - activeSession is null',
          );
        }
      },
      onError: (e: any) => {
        console.error('Failed to stop session:', e);
        toast.error('Failed to stop session - check console for details');
      },
    }),
  );

  // Query for session data
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    ...trpc.procSessions.getSessions.queryOptions({
      procId: procId || '',
      sessionId: sessionId || undefined,
    }),
    enabled: !!(sessionId && procId),
  });

  // Handle real-time session status updates from socket
  useEffect(() => {
    if (sessionStatus && sessionStatus.sessionId === activeSession?._id) {
      // Session status changed for our current session
      if (
        sessionStatus.status === 'completed' ||
        sessionStatus.status === 'canceled'
      ) {
        // Session ended by another user
        if (!isSessionOwner) {
          toast.info(`Session completed by ${sessionStatus.changedBy}`);
        }

        // Update UI state for all users
        setActiveSession(null);
        setIsSessionOwner(false);
        updateUrlWithSession(null);
      }
    }
  }, [sessionStatus, activeSession?._id, isSessionOwner, updateUrlWithSession]);

  // Handle real-time record updates from socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeSession?._id) return;

    const handleRecordUpdated = (data: {
      sessionId: string;
      recordId: string;
      state: 'pending' | 'complete';
      updatedBy: string;
    }) => {
      // Only handle updates for our current session
      if (data.sessionId !== activeSession._id) return;

      console.log('[SessionContext] Received record update:', data);

      // Update the session state with the new record state
      setActiveSession((prevSession) => {
        if (!prevSession) return prevSession;

        const updatedRecords = prevSession.records
          ? [...prevSession.records]
          : [];
        const existingRecordIndex = updatedRecords.findIndex(
          (r) => r.recordId === data.recordId,
        );

        const updatedRecord = {
          recordId: data.recordId,
          blockType: 'TaskItem', // Default type, could be enhanced
          state: data.state,
          updatedBy: data.updatedBy,
          updatedAt: new Date().toISOString(),
        };

        if (existingRecordIndex >= 0) {
          // Update existing record
          updatedRecords[existingRecordIndex] = updatedRecord;
        } else {
          // Add new record
          updatedRecords.push(updatedRecord);
        }

        return {
          ...prevSession,
          records: updatedRecords,
        };
      });

      // Show toast for updates from other users
      if (data.updatedBy !== user?.username) {
        const action = data.state === 'complete' ? 'completed' : 'uncompleted';
        toast.info(`Task ${action} by ${data.updatedBy}`);
      }
    };

    // Listen for record updates
    socket.on('session:record-changed', handleRecordUpdated);

    // Cleanup
    return () => {
      socket.off('session:record-changed', handleRecordUpdated);
    };
  }, [activeSession?._id, user?.username]);

  // Initialize session state
  useEffect(() => {
    const initializeSession = async () => {
      if (!procId) {
        setIsLoading(false);
        return;
      }

      if (isSessionLoading) {
        setIsLoading(false);
        return;
      }

      // Check if we have session data from URL query
      if (sessionData?.sessions && sessionData.sessions.length > 0) {
        const session = sessionData.sessions[0];
        // Only set as active session if it's active status
        if (session.status === 'active') {
          setActiveSession(session);
          setIsSessionOwner(session.createdBy === user?.username);
        } else {
          // Session exists but is not active
          setActiveSession(null);
          setIsSessionOwner(false);
          // Remove invalid sessionId from URL
          updateUrlWithSession(null);
        }
      } else if (sessionId) {
        // Session ID in URL but no session found in database
        setActiveSession(null);
        setIsSessionOwner(false);
        // Remove invalid sessionId from URL
        updateUrlWithSession(null);
      } else {
        // No session found
        setActiveSession(null);
        setIsSessionOwner(false);
      }
      setIsLoading(false);
    };

    initializeSession();
  }, [
    procId,
    user,
    sessionData,
    sessionId,
    isSessionLoading,
    updateUrlWithSession,
  ]);

  const handleCreateSession = useCallback(() => {
    if (!procId || !canExecute) return;
    createSession({ procId });
  }, [procId, canExecute, createSession]);

  const handleStopSession = useCallback(() => {
    if (!activeSession?._id || !isSessionOwner) return;
    stopSession({
      sessionId: activeSession._id,
    });
  }, [activeSession, isSessionOwner, stopSession]);

  // Helper function to get completion state for a specific record
  const getRecordCompletion = useCallback(
    (recordId: string): boolean | undefined => {
      if (!activeSession?.records) return undefined;
      const record = activeSession.records.find((r) => r.recordId === recordId);
      return record?.state === 'complete';
    },
    [activeSession?.records],
  );

  const contextValue: SessionContextType = {
    activeSession,
    isSessionOwner,
    isLoading,
    createSession: handleCreateSession,
    stopSession: handleStopSession,
    isCreatingSession,
    isStoppingSession,
    getRecordCompletion,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
