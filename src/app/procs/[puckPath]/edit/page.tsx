/**
 * Direct route for editing procs without middleware rewrite
 * This provides faster loading by avoiding middleware processing
 */

import '@puckeditor/core/no-external.css';
import PuckEditorView from '@/components/puck/views/puck-editor-view';
import { getPage } from '@/lib/get-page';
import { ProcProvider } from '@/context/ProcContext';
import { RedlineProvider } from '@/context/RedlineContext';
import { SessionProvider } from '@/context/SessionContext';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import { notFound } from 'next/navigation';
import { getSessionFromCookie } from '@/lib/utils/auth';
import { PermissionServiceServer } from '@/services/permission-service-server';
import PermissionDeniedError from '@/components/common/errors/PermissionDeniedError';

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ puckPath: string }>;
}>) {
  const { puckPath } = await params;
  const slug = puckPath;
  if (!slug) return notFound();

  const proc: ProcPublic | ProcPublicWithAcl = await getPage(slug);
  if (!proc) return notFound();

  // Check if user has edit permissions
  const session = await getSessionFromCookie();
  const username = session?.user?.username;

  if (!username) {
    // User is not authenticated
    return (
      <PermissionDeniedError
        title="Authentication Required"
        message="You must be logged in to edit procedures."
        procTitle={proc.title}
      />
    );
  }

  // Check edit permissions using PermissionServiceServer
  const permissionService = new PermissionServiceServer();
  const canEdit = await permissionService.canUserPerformAction(
    username,
    proc._id,
    'canEditProc',
  );
  console.log('server: canEdit', canEdit);

  if (!canEdit) {
    // User doesn't have edit permission
    return (
      <PermissionDeniedError
        title="Edit Permission Required"
        message="You do not have permission to edit this procedure."
        procTitle={proc.title}
      />
    );
  }

  return (
    <RedlineProvider>
      <ProcProvider proc={proc} viewMode={'edit'}>
        <SessionProvider procId={proc._id}>
          <PuckEditorView slug={puckPath} initialData={proc} />
        </SessionProvider>
      </ProcProvider>
    </RedlineProvider>
  );
}

export const dynamic = 'force-dynamic';
