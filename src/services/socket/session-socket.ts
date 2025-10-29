import { getSocket } from '@/lib/socket';
import type { SessionStatusData, SessionStatusChangeData } from './types';

export class SessionSocketService {
  private socket = getSocket();

  /**
   * Join a session room to receive real-time updates
   */
  joinSessionRoom(procId: string, username?: string): void {
    if (!this.socket || !procId) return;
    
    this.socket.emit('room:join', { 
      room: procId, 
      name: username || 'Anonymous User' 
    });
  }

  /**
   * Leave a session room
   */
  leaveSessionRoom(procId: string): void {
    if (!this.socket || !procId) return;
    
    this.socket.emit('room:leave', { room: procId });
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
    if (!this.socket) return;
    
    this.socket.emit('session:status-changed', data);
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
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
