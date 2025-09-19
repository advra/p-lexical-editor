import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { headers as getHeaders, headers } from 'next/headers';
import dbConnect from '@/lib/db/mongodb';
import { getSessionFromCookie } from '@/lib/utils/auth';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
// Extend base procedure here so that we dont have to always initialize within our procedures.ts files
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const session = await getSessionFromCookie();
  const database = await dbConnect();
  return next({ ctx: { db: database, session: session } });
});

// procedures that require user login
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next();
});
