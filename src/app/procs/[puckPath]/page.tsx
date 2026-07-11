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

// Ensure fresh data is always fetched from the server (e.g., after discarding edits)
export const dynamic = 'force-dynamic';
