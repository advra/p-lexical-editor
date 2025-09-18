import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { headers as getHeaders } from 'next/headers';
import dbConnect from '@/lib/db/mongodb';
import { getUserFromCookie } from '@/lib/utils/auth';

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
  const database = await dbConnect();
  return next({ ctx: { db: database } });
});

// procedures that require user login
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  // const headers = await getHeaders();
  const session = await getUserFromCookie();

  if (!session || !session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Must be logged in',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...session,
        user: session.user,
      },
    },
  });
});
