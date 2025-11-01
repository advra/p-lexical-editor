import mongoose, { Schema, Model } from 'mongoose';
import { z } from 'zod';

export interface Comment {
  _id: string;
  comment: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Redline {
  _id: string;
  procId: string;
  blockId: string;
  dcn: string;
  // redlineId: string;
  target: string;
  originalText: string;
  newText: string;
  userId: string;
  status: 'pending' | 'applied' | 'rejected';
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type RedlineDoc = mongoose.Document & Redline;

const CommentSchema = new Schema<Comment>(
  {
    comment: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

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
      index: true,
    },
    // redlineId: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   index: true,
    // },
    target: {
      type: String,
      required: true,
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
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'applied', 'rejected'],
      default: 'pending',
      index: true,
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// Compound indexes for efficient queries
RedlineSchema.index({ procId: 1, blockId: 1 });
RedlineSchema.index({ procId: 1, dcn: 1 });
// RedlineSchema.index({ procId: 1, redlineId: 1 });
RedlineSchema.index({ procId: 1, status: 1 });

// Zod schemas for validation
export const commentSchema = z.object({
  _id: z.string().optional(),
  comment: z.string().min(1),
  userId: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const redlineSchema = z.object({
  _id: z.string().optional(),
  procId: z.string().min(1),
  blockId: z.string().min(1),
  dcn: z.string().min(1),
  // redlineId: z.string().min(1),
  target: z.string().min(1),
  originalText: z.string(),
  newText: z.string(),
  userId: z.string().min(1),
  status: z.enum(['pending', 'applied', 'rejected']),
  comments: z.array(commentSchema),
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
    // redlineId: docObj.redlineId,
    target: docObj.target,
    originalText: docObj.originalText,
    newText: docObj.newText,
    userId: docObj.userId,
    status: docObj.status,
    comments: docObj.comments || [],
    createdAt: docObj.createdAt,
    updatedAt: docObj.updatedAt,
  };
}
