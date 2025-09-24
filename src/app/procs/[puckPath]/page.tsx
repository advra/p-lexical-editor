// app/procs/[[...puckPath]]/page.tsx  (SERVER)
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/get-page';
import ProcPageClient from '../ui/components/ProcPageClient';

export default async function Page({
  params,
}: {
  params: { puckPath?: string };
}) {
  const slug = await params.puckPath;
  console.log('PARTS', slug);
  if (!slug) return notFound();

  const proc = await getPage(slug);
  if (!proc) return notFound();

  return <ProcPageClient proc={proc} slug={slug} path={`/procs/${slug}`} />;
}
