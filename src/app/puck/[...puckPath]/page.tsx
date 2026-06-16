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

import PuckEditorView from '@/components/puck/views/puck-editor-view';
import { ProcProvider } from '@/context/ProcContext';
import { RedlineProvider } from '@/context/RedlineContext';
import '@puckeditor/core/puck.css';

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;

  return (
    <>
      <RedlineProvider>
        <ProcProvider viewMode={'view'} owner={''} procId={''}>
          <PuckEditorView segments={puckPath} />
        </ProcProvider>
      </RedlineProvider>
    </>
  );
}

export const dynamic = 'force-dynamic';
