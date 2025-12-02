// app/procs/[[...puckPath]]/page.tsx  (SERVER)

/*
  The preview version enables a LocalStoreProvider to allow users to make 
  local changes on their end
*/
import { notFound } from 'next/navigation';
import { getProcBySlug, ProcDoc } from '@/lib/get-page';
import ProcPageClient from '../../../components/puck/ui/puck-editor/components/ProcPageClient';
import { RedlineProvider } from '@/context/RedlineContext';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const proc: ProcDoc | null = getProcBySlug(puckPath);

  return {
    title: proc?.title || 'Untitled',
  };
}

export default async function Page({
  params,
}: {
  params: { puckPath?: string };
}) {
  const { puckPath } = await params;
  const slug = puckPath;
  if (!slug) return notFound();
  const proc: ProcDoc | null = getProcBySlug(slug);

  if (!proc) {
    return notFound();
  }

  return (
    <RedlineProvider>
      <ProcPageClient proc={proc} slug={slug} path={`/procs/${slug}`} />
    </RedlineProvider>
  );
}

// Force Next.js to produce static pages: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
// Delete this if you need dynamic rendering, such as access to headers or cookies
export const dynamic = 'force-static';
