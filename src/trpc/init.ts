// import { initTRPC, TRPCError } from '@trpc/server';
// import { cache } from 'react';
// import superjson from 'superjson';
// import { headers as getHeaders, headers } from 'next/headers';
// import dbConnect from '@/lib/db/mongodb';
// import { getSession, getSessionFromCookie } from '@/lib/utils/auth';

// // export const createTRPCContext = cache(async () => {
// //   /**
// //    * @see: https://trpc.io/docs/server/context
// //    */
// //   return { userId: 'user_123' };
// // });

// export async function createTRPCContext(opts?: { headers?: Headers }) {
//   // if your getSession can take headers, pass them:
//   // const hdrs = opts?.headers ?? nextHeaders();
//   // const session = await getSessionFromCookie(); // <- make sure this returns { username, roles, ... }
//   // return { session };
//   // const db = await dbConnect();
//   // return { db };
// }

// // Avoid exporting the entire t-object
// // since it's not very descriptive.
// // For instance, the use of a t variable
// // is common in i18n libraries.
// const t = initTRPC.create({
//   /**
//    * @see https://trpc.io/docs/server/data-transformers
//    */
//   transformer: superjson,
// });
// // Base router and procedure helpers
// export const createTRPCRouter = t.router;
// export const createCallerFactory = t.createCallerFactory;
// // Extend base procedure here so that we dont have to always initialize within our procedures.ts files
// export const baseProcedure = t.procedure.use(async ({ next }) => {
//   const database = await dbConnect();
//   return next({ ctx: { db: database } });
// });

// // procedures that require user login
// export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
//   // const headers = await getHeaders();
//   const session = await getSessionFromCookie();

//   return next({
//     ctx: {
//       ...ctx,
//       session: {
//         user: session?.user,
//       },
//     },
//   });
// });

// trpc/init.ts
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import dbConnect from '@/lib/db/mongodb';
import { getUserFromCookie } from '@/lib/utils/auth';

export async function createTRPCContext(opts?: { headers?: Headers }) {
  // if your getSession can take headers, pass them:
  const user = await getUserFromCookie(); // <- make sure this returns { username, roles, ... }
  console.log('SESSSINOISNIOSNOS: ', user);
  const db = await dbConnect();
  return { db, session: { user } };
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  console.log('PROTECTED USER: ', ctx.session);
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next();
});
