import { usersRouter } from '@/modules/user/server/procedure';
import { createTRPCRouter } from '../init';
// import { procsRouter } from '@/modules/procs/server/procedure';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  // procs: procsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
