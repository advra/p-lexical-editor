import z from 'zod';

// very light slug guard; you can tighten this if you like
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    'Invalid slug (letters, numbers, dashes)',
  );

export const procBaseSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1)).optional().default([]),
  sharedWith: z.array(z.string().min(1)).optional().default([]), // usernames
  data: z.unknown(), // Puck JSON
  published: z.boolean().optional().default(false),
});

export const procPublicSchema = procBaseSchema.extend({
  _id: z.string(),
  owner: z.string(), // username
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable().optional(),
});

export const procCreateInput = procBaseSchema.omit({ published: true }).extend({
  // owner from ctx; do not accept from client
  // slug optional: derive if missing
  slug: slugSchema.optional(),
  published: z.boolean().optional(), // allow publishing on create, default false
});

export const procUpdateInput = z.object({
  id: z.string().min(1),
  patch: z.object({
    title: z.string().min(1).max(200).optional(),
    slug: slugSchema.optional(),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string().min(1)).optional(),
    sharedWith: z.array(z.string().min(1)).optional(),
    data: z.unknown().optional(),
    published: z.boolean().optional(),
  }),
});

export const procGetOneInput = z.union([
  z.object({ id: z.string().min(1) }),
  z.object({ owner: z.string().min(1), slug: slugSchema }),
]);

export const procListMineInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(), // simple cursor by updatedAt ISO or _id if you prefer
});
