// app/procs/[[...puckPath]]/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import ProcPageClient from '../ui/components/ProcPageClient';

export default async function Page({
  params,
}: {
  params: { puckPath?: string | string[] };
}) {
  const slug = await params.puckPath;
  console.log('PARTS', slug);
  if (!slug) return notFound();

  const data = await getPage(slug);
  if (!data) return notFound();

  return <ProcPageClient data={data} slug={slug} path={`/procs/${slug}`} />;
}
