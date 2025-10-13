// app/procs/[[...puckPath]]/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import ProcPageClient from '../ui/components/ProcPageClient';
import { StoreProvider } from '@/context/StoreContext';
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
    <>
      <StoreProvider initialProc={proc}>
        <ProcPageClient proc={proc} slug={slug} path={`/procs/${slug}`} />;
      </StoreProvider>
    </>
  );
}
