import { usersRouter } from '@/modules/user/server/procedure';
import { procRouter } from '@/modules/procs/server/procedure';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  procs: procRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
