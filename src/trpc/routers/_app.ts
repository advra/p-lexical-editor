import { usersRouter } from '@/modules/user/server/procedure';
import { procRouter } from '@/modules/procs/server/procedure';
import { redlineRouter } from '@/modules/redlines/server/procedure';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  procs: procRouter,
  redlines: redlineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
