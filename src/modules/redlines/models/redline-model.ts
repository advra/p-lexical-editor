import mongoose, { Schema, Model } from 'mongoose';
import { z } from 'zod';

export interface Redline {
  // Reference to the proc
  procId: string;
  // the block id modified (managed by puck editor)
  blockId: string;
  // Document Change Number
  dcn: string;
  // Text before change
  originalText: string;
  // Text after change
  newText: string;
  // User's description of the change
  description: string;
  // Who made the change
  userId: string;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export type RedlineDoc = mongoose.Document & Redline;

const RedlineSchema = new Schema<RedlineDoc>(
  {
    procId: {
      type: String,
      required: true,
      index: true,
    },
    blockId: {
      type: String,
      required: true,
      index: true,
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
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'applied', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
RedlineSchema.index({ procId: 1, createdAt: -1 });
RedlineSchema.index({ procId: 1, blockId: 1 });
RedlineSchema.index({ procId: 1, status: 1 });

// Zod schema for validation
export const redlineSchema = z.object({
  _id: z.string().optional(),
  procId: z.string().min(1),
  blockId: z.string().min(1),
  dcn: z.string().min(1),
  originalText: z.string(),
  newText: z.string(),
  description: z.string(),
  userId: z.string().min(1),
  status: z.enum(['pending', 'applied', 'rejected']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type RedlinePublic = z.infer<typeof redlineSchema>;

export const RedlineModel: Model<Redline> =
  (mongoose.models.Redline as Model<Redline>) ||
  mongoose.model<Redline>('Redline', RedlineSchema);

// Helper function to convert to public format
export function toPublic(doc: RedlineDoc | any): RedlinePublic {
  const docObj = doc.toObject ? doc.toObject() : doc;

  return {
    _id: docObj._id?.toString() || docObj._id,
    procId: docObj.procId,
    blockId: docObj.blockId,
    dcn: docObj.dcn,
    originalText: docObj.originalText,
    newText: docObj.newText,
    description: docObj.description,
    userId: docObj.userId,
    status: docObj.status,
    createdAt: docObj.createdAt,
    updatedAt: docObj.updatedAt,
  };
}
