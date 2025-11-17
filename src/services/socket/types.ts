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

export interface RecordUpdateData {
  sessionId: string;
  recordId: string;
  state: 'pending' | 'complete';
  updatedBy: string;
}

export interface RecordUpdateChangeData {
  room: string;
  sessionId: string;
  recordId: string;
  state: 'pending' | 'complete';
  updatedBy: string;
}

export interface SessionSocketEvents {
  'session:status-updated': (data: SessionStatusData) => void;
  'session:status-changed': (data: SessionStatusChangeData) => void;
  'session:record-updated': (data: RecordUpdateData) => void;
  'session:record-changed': (data: RecordUpdateChangeData) => void;
}
