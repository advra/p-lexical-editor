import z, { boolean } from 'zod';
import { MAX_SLUG_LENGTH } from '../utils/title-generator';

// /** Accept Date or string; returns ISO string or undefined */
// const flexISO = z.preprocess((v) => {
//   if (v == null || v === '') return undefined;
//   if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();
//   const d = new Date(String(v));
//   return isNaN(d.getTime()) ? undefined : d.toISOString();
// }, z.string().optional());

// ISO datetime with timezone (Zod v3)
const isoOpt = z.string().datetime({ offset: true }).nullable().optional();

export const slugSchema = z
  .string()
  .min(1)
  .max(MAX_SLUG_LENGTH)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    'Invalid slug (letters, numbers, dashes)',
  );

// Minimal contract: make sure root.props has your 3 fields.
// Use .passthrough() to allow arbitrary extra keys/blocks from Puck.
/* Root props you care about; allow extra keys too */
const rootPropsSchema = z
  .object({
    title: z.string(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    padding: z.string(),
  })
  .loose();

/* Puck data: keep it loose so arbitrary blocks don’t fail */
export const puckPageDataSchema = z
  .object({
    root: z.object({ props: rootPropsSchema }).loose(),
    content: z.array(z.unknown()).optional(),
  })
  .loose();

export type PuckPageDataInput = z.infer<typeof puckPageDataSchema>;

/** ---------- DB (internal) shape ---------- */
export const procDbSchema = z.object({
  _id: z.string(), // you convert ObjectId -> string in your map
  slug: slugSchema,
  owner: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.date().nullable().optional(),
  version: z.number().int().min(0),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1)).default([]),
  sharedWith: z
    .array(
      z.object({
        userId: z.string().min(1),
        permission: z.enum(['read', 'edit', 'execute']),
      }),
    )
    .default([]),
  data: puckPageDataSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProcCreateInput = z.infer<typeof procCreateInput>;

/** ---------- Public return shape ----------
 * Public schem to hide sharedWith from all users
 */
// Public schema (ISO strings)
const iso = z.iso.datetime({ offset: true });
export const procPublicSchema = procDbSchema.omit({ sharedWith: true }).extend({
  createdAt: iso,
  updatedAt: iso,
  publishedAt: iso.nullable().optional(),
});

/** ---------- Inputs ---------- */
// Create: client provides slug? other info like (title/description/tags/sharedWith)? and data
export const procCreateInput = z.object({
  // slug: slugSchema.optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  sharedWith: z.array(z.string()).optional(),
  // initial status: let server set 'draft' or 'published' (optional flag below)
  publishNow: z.boolean().optional(),
  data: puckPageDataSchema,
});

// Update: allow partial patch on slug, published/status, metadata, data
export const procUpdateInput = z.object({
  id: z.string().min(1),
  patch: z.object({
    slug: slugSchema.optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional(),
    sharedWith: z.array(
      z.object({
        userId: z.string().min(1),
        permission: z.enum(['read', 'edit', 'execute']),
      }),
    ).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    data: puckPageDataSchema.optional(),
  }),
});

/** Fetch-one variants */
export const procGetOneInput = z.union([
  z.object({ by: z.literal('id'), id: z.string().min(1) }),
  z.object({ by: z.literal('slug'), slug: slugSchema }),
  z.object({
    by: z.literal('ownerSlug'),
    owner: z.string().min(1),
    slug: slugSchema,
  }),
]);

/** Listings */
export const procListMineInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export const procListSharedInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export const procListAllInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
  query: z.string().optional(),
});

// shared with optionally (if user is owner or in sharedWith)
export const sharedWithZ = z
  .array(
    z.object({
      userId: z.string().min(1),
      permissions: z.object({
        read: z.boolean().optional(),
        edit: z.boolean().optional(),
        execute: z.boolean().optional(),
      }),
    }),
  )
  .default([]);
