/**
 * This file implements a *magic* catch-all route that renders the Puck editor.
 *
 * This route exposes /puck/[...puckPath], but is disabled by middleware.ts. The middleware
 * then rewrites all URL requests ending in `/edit` to this route, allowing you to visit any
 * page in your application and add /edit to the end to spin up a Puck editor.
 *
 * This approach enables public pages to be statically rendered whilst the /puck route can
 * remain dynamic.
 *
 * NB this route is public, and you will need to add authentication
 */

import '@measured/puck/puck.css';
import { PuckClientEditor } from './puck-client-editor';
import { getPage } from '../../../lib/get-page';
import { Data } from '@measured/puck';
import { ProcProvider } from '@/context/ProcContext';

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join('/')}`;
  const slug = puckPath[puckPath.length - 1];
  const proc = await getPage(slug);
  // const data = proc.data as Data;

  return (
    <>
      <PuckClientEditor path={path} proc={proc} />
    </>
  );
}

export const dynamic = 'force-dynamic';
