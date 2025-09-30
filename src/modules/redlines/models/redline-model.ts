import mongoose, { Schema, Model } from 'mongoose';
import { z } from 'zod';

export interface RedlineItem {
  // Unique identifier for this redline item
  redlineId: string;
  // the block id modified (managed by puck editor)
  blockId: string;
  // the specific text target within the block (e.g., 'step', 'content')
  target: string;
  // Document Change Number
  dcn: string;
  // Text before change
  originalText: string;
  // Text after change
  newText: string;
  // Who made the change
  userId: string;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockRedlines {
  // Block ID
  blockId: string;
  // Redlines for this block, organized by target
  redlines: Map<string, RedlineItem>;
}

export interface ProcRedlines {
  // Reference to the proc
  procId: string;
  // Redlines organized by block ID for O(1) access
  blocks: Map<string, BlockRedlines>;
  createdAt: Date;
  updatedAt: Date;
}

export type ProcRedlinesDoc = mongoose.Document & ProcRedlines;

const RedlineItemSchema = new Schema<RedlineItem>(
  {
    redlineId: {
      type: String,
      required: true,
    },
    blockId: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    dcn: {
      type: String,
      required: true,
      trim: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    newText: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'applied', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

const BlockRedlinesSchema = new Schema<BlockRedlines>(
  {
    blockId: {
      type: String,
      required: true,
    },
    redlines: {
      type: Map,
      of: RedlineItemSchema,
      default: new Map(),
    },
  },
  { _id: false },
);

const ProcRedlinesSchema = new Schema<ProcRedlinesDoc>(
  {
    procId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    blocks: {
      type: Map,
      of: BlockRedlinesSchema,
      default: new Map(),
    },
  },
  { timestamps: true },
);

// Index for efficient queries
ProcRedlinesSchema.index({ 'redlines.blockId': 1 });
ProcRedlinesSchema.index({ 'redlines.userId': 1 });
ProcRedlinesSchema.index({ 'redlines.status': 1 });

// Zod schemas for validation
export const redlineItemSchema = z.object({
  redlineId: z.string().min(1),
  blockId: z.string().min(1),
  target: z.string().min(1),
  dcn: z.string().min(1),
  originalText: z.string(),
  newText: z.string(),
  userId: z.string().min(1),
  status: z.enum(['pending', 'applied', 'rejected']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const procRedlinesSchema = z.object({
  _id: z.string().optional(),
  procId: z.string().min(1),
  redlines: z.array(redlineItemSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ProcRedlinesPublic = z.infer<typeof procRedlinesSchema>;

export const ProcRedlinesModel: Model<ProcRedlines> =
  (mongoose.models.ProcRedlines as Model<ProcRedlines>) ||
  mongoose.model<ProcRedlines>('ProcRedlines', ProcRedlinesSchema);

// Helper function to convert to public format
export function toPublic(doc: ProcRedlinesDoc | any): ProcRedlinesPublic {
  const docObj = doc.toObject ? doc.toObject() : doc;

  return {
    _id: docObj._id?.toString() || docObj._id,
    procId: docObj.procId,
    redlines: docObj.redlines || [],
    createdAt: docObj.createdAt,
    updatedAt: docObj.updatedAt,
  };
}
