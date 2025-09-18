import { usersRouter } from '@/modules/user/server/procedure';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
