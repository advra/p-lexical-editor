/*
  ProcSession Model for tracking execution sessions and task completions
*/
import type { HydratedDocument } from 'mongoose';
import mongoose, { Model, Schema } from 'mongoose';

export type SessionRecord = {
  /**
   * Unique identifier for the record (usually matches block ID)
   */
  recordId: string;

  /**
   * Type of block for flexible data handling
   */
  blockType: string;

  /**
   * Current state of the record in this session
   */
  state: 'pending' | 'complete';

  /**
   * User who updated the record in this session
   */
  updatedBy: string;

  /**
   * When this record was updated in the session
   */
  updatedAt: Date;

  /**
   * Flexible data storage for block-specific information
   */
  data?: Record<string, any>;
};

export interface ProcSession {
  /**
   * MongoDB document identifier (ObjectId string)
   */
  _id: string;

  /**
   * Reference to the proc this session belongs to
   */
  procId: string;

  /**
   * Name or identifier for this session (optional)
   */
  name?: string;

  /**
   * User who created/started the session
   */
  createdBy: string;

  /**
   * Current status of the session
   */
  status: 'active' | 'completed' | 'cancelled';

  /**
   * Records of task completions in this session
   */
  records: SessionRecord[];

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last modification timestamp
   */
  updatedAt: Date;
}

type ProcSessionDoc = mongoose.Document & ProcSession;

/* --------------------------- schema definition --------------------------- */
const SessionRecordSchema = new Schema({
  recordId: {
    type: String,
    required: true,
  },
  blockType: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    enum: ['pending', 'complete'],
    default: 'pending',
  },
  updatedBy: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Schema.Types.Mixed,
  },
});

const ProcSessionSchema = new Schema<ProcSessionDoc>(
  {
    procId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    records: [SessionRecordSchema],
  },
  { timestamps: true },
);

/* ------------------------------- indexes -------------------------------- */
ProcSessionSchema.index({ procId: 1, status: 1 });
ProcSessionSchema.index({ createdBy: 1 });
ProcSessionSchema.index({ 'records.recordId': 1 });

/* ------------------------------- exports -------------------------------- */
export const ProcSessionModel: Model<ProcSession> =
  (mongoose.models.ProcSession as Model<ProcSession>) ||
  mongoose.model<ProcSession>('ProcSession', ProcSessionSchema);

/* ------------------------- projection / mappers -------------------------- */
export function toPublic(doc: ProcSessionDoc | ProcSession) {
  return {
    _id: String(doc._id),
    procId: doc.procId,
    name: doc.name,
    createdBy: doc.createdBy,
    status: doc.status,
    records: doc.records.map((record) => ({
      recordId: record.recordId,
      blockType: record.blockType,
      state: record.state,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt.toISOString(),
      data: record.data,
    })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
