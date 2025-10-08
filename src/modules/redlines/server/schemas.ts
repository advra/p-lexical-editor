import { z } from 'zod';

// Input schemas for redline operations
export const redlineCreateInput = z.object({
  procId: z.string().min(1),
  blockId: z.string().min(1),
  dcn: z.string().min(1),
  originalText: z.string(),
  newText: z.string(),
});

export const redlineUpdateInput = z.object({
  id: z.string().min(1),
  patch: z.object({
    status: z.enum(['pending', 'applied', 'rejected']).optional(),
  }),
});

export const redlineGetByProcInput = z.object({
  procId: z.string().min(1),
  status: z.enum(['pending', 'applied', 'rejected']).optional(),
});

export const redlineGetByBlockInput = z.object({
  procId: z.string().min(1),
  blockId: z.string().min(1),
});

export const redlineDeleteInput = z.object({
  id: z.string().min(1),
});
