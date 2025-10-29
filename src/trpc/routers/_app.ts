import { usersRouter } from '@/modules/user/server/procedure';
import { procRouter } from '@/modules/procs/server/procedure';
import { redlineRouter } from '@/modules/redlines/server/procedure';
import { procSessionsRouter } from '@/modules/proc-sessions/server/procedures';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  procs: procRouter,
  redlines: redlineRouter,
  procSessions: procSessionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
