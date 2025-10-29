import z from "zod";

// procedure input schemas
export const getSessionInput = z.object({
  procId: z.string(),
  sessionId: z.string().optional(),
});

export const createSessionInput = z.object({
  procId: z.string(),
});

export const stopSessionInput = z.object({
  sessionId: z.string(),
});

export const updateSessionInput = z.object({
  sessionId: z.string(),
  recordId: z.string().optional(),
  state: z.string().optional(),
  blockType: z.string().optional(),
  data: z.record(z.any()).optional(),
  status: z.string().optional(),
});

export const deleteSessionInput = z.object({
  sessionId: z.string(),
});
