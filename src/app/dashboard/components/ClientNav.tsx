// app/dashboard/page.tsx   (Server component)
import fs from 'fs';
import path from 'path';
import ClientDashboardSidebar, {
  ProcMetadata,
} from './ui/ClientDashboardSidebar';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@trpc/tanstack-react-query';

// Define shape of DB as you expect
interface PageData {
  root: { props?: { title?: string } };
  content: any[];
  zones: Record<string, any[]>;
}
type DatabaseSchema = Record<string, PageData>;

export default async function Page() {
  const caller = appRouter.createCaller(await createTRPCContext());
  // Call listAll with whatever you need: limit / cursor / query
  const { procs, nextCursor, total } = await caller.procs.listAll({
    limit: 50,
    // cursor: undefined,
    // query: 'search text',
  });

  // Example: build links for your sidebar
  const links: ProcMetadata[] = procs.map((p) => ({
    // choose your route shape; here we link by id
    href: `/procs/${p._id}`,
    label: p.title,
  }));
}
