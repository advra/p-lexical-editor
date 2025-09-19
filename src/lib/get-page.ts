import { Data } from '@measured/puck';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';

// Replace with call to your database
export const getPage = async (slug: string) => {
  const caller = appRouter.createCaller(await createTRPCContext());
  const proc = await caller.procs.getOne({ by: 'slug', slug });
  return (proc.data as Data) ?? null;
};
