// src/app/dashboard/page.tsx  (server component)
import { TocView } from './components/view/toc-view';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { PuckPageData } from '../puck/types';

export default async function Page() {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const { procs } = await caller.procs.listAll({
      limit: 50,
    });

    // Build links for the sidebar from the actual procs data
    const links = procs.map((proc) => {
      const p = proc.data as PuckPageData;

      return {
        href: `/procs/${proc.slug}`,
        label: p.root?.props?.title ?? 'Untitled',
      };
    });

    return <TocView links={links} />;
  } catch (error) {
    console.error('Error loading procs:', error);
    // Return empty links if there's an error (e.g., database not connected)
    return <TocView links={[]} />;
  }
}
