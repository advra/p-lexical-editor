// app/procs/[[...puckPath]]/execute/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import ProcPageExecuteClient from '../../../../components/puck/ui/puck-editor/components/ProcPageExecuteClient';
import { RedlineProvider } from '@/context/RedlineContext';
import { ExecuteStoreProvider } from '@/context/ExecuteStoreContext';

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
    <ExecuteStoreProvider initialProc={proc}>
      <RedlineProvider>
        <ProcPageExecuteClient
          executionMode={true}
          proc={proc}
          slug={slug}
          path={`/procs/${slug}`}
        />
      </RedlineProvider>
    </ExecuteStoreProvider>
  );
}
