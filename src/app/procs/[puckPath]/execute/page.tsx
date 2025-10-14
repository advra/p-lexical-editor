// app/procs/[[...puckPath]]/execute/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import ProcPageClient from '../../ui/components/ProcPageClient';
import { LocalStoreProvider } from '@/context/LocalStoreContext';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';

export default async function Page({
  params,
}: {
  params: { puckPath?: string };
}) {
  const { puckPath } = await params;
  const slug = puckPath;
  if (!slug) return notFound();

  const proc: ProcPublic | ProcPublicWithAcl = await getPage(slug);
  if (!proc) return notFound();

  return (
    <LocalStoreProvider initialProc={proc}>
      <ProcPageClient
        executionMode={true}
        proc={proc}
        slug={slug}
        path={`/procs/${slug}`}
      />
    </LocalStoreProvider>
  );
}
