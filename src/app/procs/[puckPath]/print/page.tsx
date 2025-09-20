/*
  Helper to open print but this doesnt work with current implementation

  TODO: When user visits page.tsx we render ClientPrint then run this AutoPrint to auto generate and save the file. 
*/

import { getPage } from '@/lib/get-page';
import { notFound } from 'next/navigation';
import { ClientPrint } from './ui/components/ClientPrint';

export default async function Page({
  params,
}: {
  params: { puckPath?: string };
}) {
  const slug = await params.puckPath;
  if (!slug) return notFound();

  const data = await getPage(slug);
  if (!data) return notFound();

  return (
    <>
      <ClientPrint data={data} />
    </>
  );
}
