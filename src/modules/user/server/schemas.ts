// src/modules/user/server/schemas.ts
import z from 'zod';

export const roleSchema = z.enum(['admin', 'viewer', 'operator']);

export const userBaseSchema = z.object({
  username: z.string().min(3).max(50),
  avatar: z.string().url().optional(),
  roles: z.array(roleSchema).default(['viewer']),
});

export const userPublicSchema = userBaseSchema.extend({
  _id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userGetOneInput = z.object({
  username: z.string().min(1),
});

export const userCreateSchema = userBaseSchema.extend({
  password: z.string().min(6),
});

export const userSignInInput = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});
