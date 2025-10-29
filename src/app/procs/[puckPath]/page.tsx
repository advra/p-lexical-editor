// app/procs/[[...puckPath]]/page.tsx  (SERVER)

/*
  The preview version enables a LocalStoreProvider to allow users to make 
  local changes on their end
*/
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import ProcPageClient from '../../../components/puck/ui/puck-editor/components/ProcPageClient';
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

  // todo: eproc-2 determine if logged in user can see ProcPublicWithAcl

  return (
    <LocalStoreProvider initialProc={proc}>
      <ProcPageClient proc={proc} slug={slug} path={`/procs/${slug}`} />
    </LocalStoreProvider>
  );
}
