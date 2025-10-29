export interface SessionStatusData {
  sessionId: string;
  status: 'active' | 'completed' | 'canceled';
  changedBy: string;
  timestamp: string;
}

export interface SessionStatusChangeData {
  room: string;
  sessionId: string;
  status: 'active' | 'completed' | 'canceled';
  changedBy: string;
}

export interface SessionSocketEvents {
  'session:status-updated': (data: SessionStatusData) => void;
  'session:status-changed': (data: SessionStatusChangeData) => void;
}
