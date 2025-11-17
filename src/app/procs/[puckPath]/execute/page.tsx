// app/procs/[[...puckPath]]/execute/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import ProcPageExecuteClient from '../../../../components/puck/ui/puck-editor/components/ProcPageExecuteClient';
import { RedlineProvider } from '@/context/RedlineContext';
import { ProcProvider } from '@/context/ProcContext';
import { SessionProvider } from '@/context/SessionContext';

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
    <RedlineProvider>
      <ProcProvider viewMode={'execute'} owner={proc.owner} procId={proc._id}>
        <SessionProvider procId={proc._id}>
          <ProcPageExecuteClient
            executionMode={true}
            proc={proc}
            slug={slug}
            path={`/procs/${slug}`}
          />
        </SessionProvider>
      </ProcProvider>
    </RedlineProvider>
  );
}
