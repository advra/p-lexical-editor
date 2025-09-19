import z from 'zod';

/** Accept Date or string; output a strict ISO string */
const isoDateString = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString() : v),
  z.string().datetime(), // RFC3339/ISO8601
);

// very light slug guard; tighten if needed
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    'Invalid slug (letters, numbers, dashes)',
  );

/** Coerce many date shapes → ISO string or undefined */
const flexISO = z.preprocess((v) => {
  if (v == null || v === '') return undefined;
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}, z.string().optional());

/** Trim empty → undefined */
const nonEmptyOpt = z.preprocess((v) => {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}, z.string().optional());

/** Version: allow 0, strings, etc.; default to 1 if missing */
const versionCoerce = z.preprocess((v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}, z.number().int().min(0).default(1));

/** Metadata used by your Puck data */
export const metadataSchema = z.object({
  title: z.string().min(1).max(200),
  createdAt: flexISO, // was strict; now coerce/optional
  createdBy: nonEmptyOpt, // was required; make optional if legacy docs missed it
  updatedAt: flexISO, // accept '', null, Date, non-ISO → ISO
  updatedBy: nonEmptyOpt, // empty string becomes undefined
  version: versionCoerce, // accept 0; default to 1 if absent
});

/**
 * Your Puck page data:
 * - keep the unknown Puck structure via `.passthrough()`
 * - but require the `metadata` shape you defined
 */
export const puckPageDataSchema = z
  .object({ metadata: metadataSchema })
  .passthrough();

/** If you store a slim record with just metadata */
export const recordDataSchema = z.object({
  metadata: metadataSchema,
});

/** Base proc fields stored at the collection level */
export const procBaseSchema = z.object({
  slug: z.string().min(1),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1)).optional().default([]),
  sharedWith: z.array(z.string().min(1)).optional().default([]),
  data: puckPageDataSchema,
  published: z.boolean().optional().default(false),
});

const flexTopISO = flexISO; // reuse for top-level timestamps

/** What you return publicly (normalize dates to ISO strings) */
export const procPublicSchema = procBaseSchema.extend({
  _id: z.string(),
  owner: z.string().min(1),
  createdAt: flexTopISO, // was strict
  updatedAt: flexTopISO, // was strict
  publishedAt: flexTopISO, // nullable/optional handled by optional()
});

/** Create input from clients (owner comes from ctx) */
export const procCreateInput = procBaseSchema.omit({ published: true }).extend({
  slug: slugSchema, // or make optional if you autogenerate
  published: z.boolean().optional(), // allow publishing on create
});

/** Update input: partial patch */
export const procUpdateInput = z.object({
  id: z.string().min(1),
  patch: z.object({
    slug: slugSchema.optional(),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string().min(1)).optional(),
    sharedWith: z.array(z.string().min(1)).optional(),
    data: puckPageDataSchema.optional(),
    published: z.boolean().optional(),
  }),
});

/** Fetch-one variants */
export const procGetOneInput = z.union([
  z.object({ by: z.literal('id'), id: z.string().min(1) }),
  z.object({
    by: z.literal('ownerSlug'),
    owner: z.string().min(1),
    slug: slugSchema,
  }),
  z.object({ by: z.literal('slug'), slug: slugSchema }),
]);

/** Listing inputs */
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
