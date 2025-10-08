/*
  Proc Class Model which represents the documents in MongoDB
*/
import type { HydratedDocument } from 'mongoose';
import mongoose, { Model, Schema } from 'mongoose';
import { PuckPageData } from '@/app/puck/types';
import { slugify } from '../utils/title-generator';
import { EMPTY_PUCK_DATA, normalizePuckData } from './pucky-empty';
import { procPublicSchema, sharedWithZ } from '../server/schemas';
import z from 'zod';

type ProcMongo = Proc;
type ProcAnyDoc =
  | ProcMongo
  | HydratedDocument<ProcMongo>
  | LeanDocument<ProcMongo>
  | Record<string, any>;

const toISO = (v: unknown): string | null => {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(v as any);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

// True representation of what lives in the database
export type ProcInternal = ProcDoc;

// Infer types from zod types
// Return to Clients without giving too much data on Access Control Fields stripping sharedWith
export type ProcPublic = z.infer<typeof procPublicSchema>;
// The full schema if authorized
export type ProcPublicWithAcl = z.infer<typeof procPublicWithAcl>;

interface Modifications {
  /**
   * Author identifier (username/userId) who last modified the proc.
   * @example "jane.doe"
   */
  updatedBy: string;
  /**
   * Last modification timestamp (managed by Mongoose `{ timestamps: true }`).
   */
  updatedAt: Date;
  /**
   * fraction or delta changes of pageData
   */
  data: PuckPageData;
}

export const PERMISSIONS = ['read', 'edit'] as const;
export type Permission = (typeof PERMISSIONS)[number];
export type Shared = Readonly<{
  userId: string;
  permission: Permission;
}>;

/**
 * A Procedure (Proc) represents an editable, publishable page built with using Puck Editor.
 * It separates contains **system/audit** fields (top-level) from **human-visible** page info (`metadata`)
 * and the actual page content (`data`).
 */
interface Proc {
  /**
   * MongoDB document identifier (ObjectId string).
   * @example "68d19f...29b66"
   */
  // _id: string;
  /**
   * Globally-unique, URL-safe slug for routing.
   * Lowercase, dash-separated; validated/normalized on write.
   * @example "pre-flight-checklist"
   */
  slug: string;
  /**
   * Author identifier (username/userId) who created the proc.
   * @example "admin"
   */
  owner: string;
  /**
   * Lifecycle state of the proc.
   * - "draft": editable working copy, not publicly visible
   * - "published": considered the live version
   * - "archived": kept for history; not actively edited or shown
   */
  status: 'draft' | 'published' | 'archived';
  /**
   * Timestamp when this proc was last published.
   * `null` or `undefined` if never published.
   */
  publishedAt?: Date | null;
  /**
   * Version counter for the proc.
   * Increments when publishing or at defined checkpoints.
   */
  version: number;
  /**
   * Human-readable title shown in lists, headers, and search.
   * @example "Pre-Flight Checklist"
   */
  title: string;
  /**
   * Optional summary used for previews and SEO.
   */
  description?: string;
  /**
   * Optional free-form tags for search/filter facets.
   * @example ["aviation", "c172", "training"]
   */
  tags?: string[];
  /**
   * Usernames/userIds with whom the proc is shared (read or edit;
   * your ACL layer decides the level).
   */
  sharedWith?: Shared[];
  /**
   * The Puck-renderable page content (component tree + props).
   * Treat as the “source of truth” for what renders.
   */
  data: PuckPageData;
  /**
   * Creation timestamp (managed by Mongoose `{ timestamps: true }`).
   */
  createdAt: Date;
  /**
   * Last modification timestamp (managed by Mongoose `{ timestamps: true }`).
   */
  updatedAt: Date;
}

type ProcDoc = mongoose.Document & Proc;

// sub-schema for the array items
const SharedWithSchema = new Schema<Shared>(
  {
    userId: { type: String, required: true, index: true },
    permission: { type: String, enum: PERMISSIONS, required: true },
  },
  { _id: false },
);

/* --------------------------- schema definition --------------------------- */
const ProcSchema = new Schema<ProcDoc>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    owner: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published', // TODO: Always published. Eventually enable Draft and Archived
      index: true,
    },
    publishedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    tags: { type: [String], default: [] },
    sharedWith: { type: [SharedWithSchema], default: [] },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);
/* 
  ------------------------------- indexes -------------------------------- 
  Additionally indexes to optimize for common list/sort queries in additional to the unique slug
*/
// ProcSchema.index({ slug: 1 }, { unique: true });
ProcSchema.index({ owner: 1, updatedAt: -1 });
ProcSchema.index({ status: 1, updatedAt: -1 });
ProcSchema.index({ tags: 1 }); // multikey
// Optional text search for quick find:
ProcSchema.index({ title: 'text', description: 'text' });
// If you add draft/published split, handy:
ProcSchema.index(
  { status: 1, publishedAt: -1 },
  {
    partialFilterExpression: { status: 'published' },
  },
);

/* ----------------------------- normalizers ------------------------------ */

// Hook: normalize only
ProcSchema.pre('validate', function (next) {
  // if slug was provided/changed, normalize it
  if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }

  // if slug is empty but we have title, derive a basic slug (no DB lookups)
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

/* ------------------------------- exports -------------------------------- */
export const ProcModel: Model<Proc> =
  (mongoose.models.Proc as Model<Proc>) ||
  mongoose.model<Proc>('Proc', ProcSchema);

/* ------------------------- projection / mappers -------------------------- */
/** Use in list/find queries when caller should NOT see ACL fields */
export const PROC_PUBLIC_PROJECTION = { sharedWith: 0 } as const;

export const procPublicWithAcl = procPublicSchema.extend({
  sharedWith: sharedWithZ,
});

function normalizeCommon(doc: ProcAnyDoc) {
  return {
    ...doc,
    _id: String(doc._id),
    createdAt: toISO(doc.createdAt)!,
    updatedAt: toISO(doc.updatedAt)!,
    publishedAt: toISO(doc.publishedAt),
    status: doc.status ?? 'draft',
    version: doc.version ?? 1,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    data: doc.data ?? { root: { props: {} } },
  };
}

// /** Safe conversion if you fetched the full document (server-side only) */
export function toPublic(
  doc: ProcAnyDoc,
  opts?: { includeACL?: boolean },
): ProcPublic | ProcPublicWithAcl {
  const base = normalizeCommon(doc);

  /** Public projector: safe across hydrated or lean docs */
  if (opts?.includeACL) {
    return procPublicWithAcl.parse({
      ...base,
      sharedWith: Array.isArray(doc.sharedWith) ? doc.sharedWith : [],
    });
  }

  // hide ACL
  const { sharedWith, ...noAcl } = base as any;
  return procPublicSchema.parse(noAcl);
}
