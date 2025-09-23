import mongoose, { Schema } from 'mongoose';

export interface Proc {
  title: string;
  slug: string; // URL-friendly slug
  description?: string;
  owner: string; // username of the owner
  sharedWith: string[]; // usernames
  data: unknown; // Puck JSON payload
  published: boolean;
  publishedAt?: Date | null;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ProcDoc = mongoose.Document & Proc;

const ProcSchema = new Schema<ProcDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String },
    owner: { type: String, required: true, index: true }, // username
    sharedWith: { type: [String], default: [] },
    data: { type: Schema.Types.Mixed, required: true }, // Puck JSON
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Unique per owner, so two users can both have "/checklist" if desired
ProcSchema.index(
  { owner: 1, slug: 1 },
  { unique: true, name: 'uniq_owner_slug' },
);

// Optional: fast lookup by slug globally (non-unique), and by updatedAt for lists
ProcSchema.index({ slug: 1 });
ProcSchema.index({ updatedAt: -1 });

export const ProcModel =
  (mongoose.models.Proc as mongoose.Model<ProcDoc>) ||
  mongoose.model<ProcDoc>('Proc', ProcSchema);
