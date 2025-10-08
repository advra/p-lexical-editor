import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';

// Replace with call to your database
export const getPage = async (slug: string) => {
  const caller = appRouter.createCaller(await createTRPCContext());
  const proc: ProcPublic | ProcPublicWithAcl = await caller.procs.getOne({
    by: 'slug',
    slug,
  });
  return proc ?? null;
};
