// app/procs/[[...puckPath]]/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import ProcPageClient from '../ui/components/ProcPageClient';

export default async function Page({
  params,
}: {
  params: { puckPath?: string | string[] };
}) {
  const parts = Array.isArray(params.puckPath)
    ? params.puckPath
    : params.puckPath
      ? [params.puckPath]
      : [];
  const slug = parts.at(-1);
  if (!slug) return notFound();

  const data = await getPage(slug);
  if (!data) return notFound();

  const path = `/procs/${parts.join('/')}`;

  return <ProcPageClient data={data} slug={slug} path={path} />;
}
