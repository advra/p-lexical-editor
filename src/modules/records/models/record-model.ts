/*
  Record Model for tracking task completion status
*/
import type { HydratedDocument } from 'mongoose';
import mongoose, { Model, Schema } from 'mongoose';

export type RecordState = 'pending' | 'complete' | 'redlined';

export interface Record {
  /**
   * MongoDB document identifier (ObjectId string)
   */
  _id: string;

  /**
   * Unique identifier for the record (usually matches block ID)
   */
  recordId: string;

  /**
   * Reference to the proc this record belongs to
   */
  procId: string;

  /**
   * Current state of the record
   */
  state: RecordState;

  /**
   * User who last updated the record
   */
  lastUpdatedBy: string;

  /**
   * Document Change Number (DCN) for tracking changes
   */
  dcn?: string;

  /**
   * Redline content if the task was redlined
   */
  redlineContent?: string;

  /**
   * Whether this record has been redlined
   */
  isRedlined: boolean;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last modification timestamp
   */
  updatedAt: Date;
}

type RecordDoc = mongoose.Document & Record;

/* --------------------------- schema definition --------------------------- */
const RecordSchema = new Schema<RecordDoc>(
  {
    recordId: {
      type: String,
      required: true,
      index: true,
    },
    procId: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: ['pending', 'complete', 'redlined'],
      default: 'pending',
      index: true,
    },
    lastUpdatedBy: {
      type: String,
      required: true,
    },
    dcn: {
      type: String,
    },
    redlineContent: {
      type: String,
    },
    isRedlined: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ------------------------------- indexes -------------------------------- */
RecordSchema.index({ recordId: 1, procId: 1 }, { unique: true });
RecordSchema.index({ procId: 1, state: 1 });
RecordSchema.index({ lastUpdatedBy: 1 });

/* ------------------------------- exports -------------------------------- */
export const RecordModel: Model<Record> =
  (mongoose.models.Record as Model<Record>) ||
  mongoose.model<Record>('Record', RecordSchema);

/* ------------------------- projection / mappers -------------------------- */
export function toPublic(doc: RecordDoc | Record) {
  return {
    _id: String(doc._id),
    recordId: doc.recordId,
    procId: doc.procId,
    state: doc.state,
    lastUpdatedBy: doc.lastUpdatedBy,
    dcn: doc.dcn,
    redlineContent: doc.redlineContent,
    isRedlined: doc.isRedlined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
