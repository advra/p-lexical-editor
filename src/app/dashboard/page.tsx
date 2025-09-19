// app/dashboard/page.tsx
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import TocView from './components/view/toc-view';

export default async function Page() {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const { procs, total, nextCursor } = await caller.procs.listAll({
      limit: 50,
    });
    return <TocView procs={procs} total={total} nextCursor={nextCursor} />;
  } catch (err) {
    console.error('Error loading procs:', err);
    return <TocView procs={[]} total={0} nextCursor={undefined} />;
  }
}
