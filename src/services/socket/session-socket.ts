import { getSocket } from '@/lib/socket';
import type { SessionStatusData, SessionStatusChangeData, RecordUpdateChangeData } from './types';

export class SessionSocketService {
  private socket = getSocket();

  /**
   * Join a session room to receive real-time updates
   */
  joinSessionRoom(sessionId: string, username?: string): void {
    if (!this.socket || !sessionId) {
      console.log('[sessionSocketService] Cannot join room - socket or sessionId missing');
      return;
    }
    
    console.log('[sessionSocketService] Joining room:', sessionId, 'for user:', username);
    this.socket.emit('room:join', { 
      room: sessionId, 
      name: username || 'Anonymous User' 
    });
  }

  /**
   * Leave a session room
   */
  leaveSessionRoom(sessionId: string): void {
    if (!this.socket || !sessionId) return;
    
    this.socket.emit('room:leave', { room: sessionId });
  }

  /**
   * Listen for session status updates
   * Returns a cleanup function to remove the listener
   */
  onSessionStatusUpdate(callback: (data: SessionStatusData) => void): () => void {
    if (!this.socket) return () => {};

    this.socket.on('session:status-updated', callback);
    
    return () => {
      this.socket?.off('session:status-updated', callback);
    };
  }

  /**
   * Emit session status change (for backend procedures)
   */
  emitSessionStatusChanged(data: SessionStatusChangeData): void {
    if (!this.socket) {
      console.log('[sessionSocketService] Socket not available, cannot emit event');
      return;
    }
    
    console.log('[sessionSocketService] Emitting session:status-changed:', data);
    this.socket.emit('session:status-changed', data);
  }

  /**
   * Emit record update (for backend procedures)
   */
  emitRecordUpdated(data: RecordUpdateChangeData): void {
    if (!this.socket) {
      console.log('[sessionSocketService] Socket not available, cannot emit event');
      return;
    }
    
    console.log('[sessionSocketService] Emitting session:record-changed:', data);
    this.socket.emit('session:record-changed', data);
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log('[sessionSocketService] Socket connected:', connected, 'socket exists:', !!this.socket);
    return connected;
  }

  /**
   * Get socket connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }
}

// Singleton instance
export const sessionSocketService = new SessionSocketService();
