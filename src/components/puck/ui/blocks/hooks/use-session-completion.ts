import { useState, useEffect } from 'react';
import { useProc } from '@/context/ProcContext';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';

export interface SessionCompletionData {
  state: 'pending' | 'complete';
  completedAt?: string;
  unmarkedAt?: string;
}

export interface UseSessionCompletionReturn {
  isCompleted: boolean;
  currentSessionId: string | null;
  markComplete: (blockType?: string, data?: any) => Promise<void>;
  removeComplete: (blockType?: string, data?: any) => Promise<void>;
  isLoading: boolean;
}

export const useSessionCompletion = (blockId: string): UseSessionCompletionReturn => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { procId } = useProc();

  // Get existing session when component mounts - DO NOT create automatically
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for existing active session
        const response = await fetch(
          `/api/proc-sessions?procId=${procId}&status=active`,
        );
        if (response.ok) {
          const result = await response.json();
          const activeSession =
            result.sessions.length > 0 ? result.sessions[0] : null;

          if (activeSession) {
            setCurrentSessionId(activeSession._id);
          }
          // If no active session found, don't create one automatically
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    if (procId) {
      initializeSession();
    }
  }, [procId]);

  const markComplete = async (blockType: string = 'TaskItem', data: any = {}) => {
    if (!currentSessionId) {
      toast.error('No active session found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/proc-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          recordId: blockId,
          blockType,
          state: 'complete',
          data: {
            ...data,
            completedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark task complete');
      }

      const result = await response.json();
      toast.success('Task marked as complete');

      // Emit socket event to notify other clients
      const socket = getSocket();
      if (socket) {
        socket.emit('session:record-updated', {
          room: procId,
          sessionId: currentSessionId,
          recordId: blockId,
          state: 'complete',
        });
      }
    } catch (error) {
      console.error('Failed to mark task complete:', error);
      toast.error('Failed to mark task as complete');
    } finally {
      setIsLoading(false);
    }
  };

  const removeComplete = async (blockType: string = 'TaskItem', data: any = {}) => {
    if (!currentSessionId) {
      toast.error('No active session found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/proc-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          recordId: blockId,
          blockType,
          state: 'pending',
          data: {
            ...data,
            unmarkedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unmark task');
      }

      const result = await response.json();
      toast.success('Removed Complete from task');

      // Emit socket event to notify other clients
      const socket = getSocket();
      if (socket) {
        socket.emit('session:record-updated', {
          room: procId,
          sessionId: currentSessionId,
          recordId: blockId,
          state: 'pending',
        });
      }
    } catch (error) {
      console.error('Failed to remove complete from task:', error);
      toast.error('Failed to remove complete from task');
    } finally {
      setIsLoading(false);
    }
  };

  // For session completion, we rely on the record prop passed from parent
  // This hook focuses on the actions, not the state
  const isCompleted = false; // State comes from record prop

  return {
    isCompleted,
    currentSessionId,
    markComplete,
    removeComplete,
    isLoading,
  };
};
