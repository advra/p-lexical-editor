// app/procs/[[...puckPath]]/ui/ProcPageClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PuckPreview } from './puck-preview';
import { Header } from './Header';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import { useStore } from '@/context/LocalStoreContext';
import useUser from '@/hooks/use-user';
import { getSocket } from '@/lib/socket';
import { ProcProvider, ProcViewModes } from '@/context/ProcContext';
import { RedlineProvider } from '@/context/RedlineContext';
import { RedlineLayoutWrapper } from '../../redline/RedlineLayoutWrapper';

function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  if (!imgs.length) return Promise.resolve();
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true });
          }),
    ),
  );
}

type Props = {
  proc: ProcPublic | ProcPublicWithAcl;
  slug: string;
  path: string;
  executionMode?: boolean;
};

const MAX_NAMES = 3;

export default function ProcPageClient({
  proc,
  slug,
  path,
  executionMode = false,
}: Props) {
  const { updateStore } = useStore();
  const room = useMemo(() => `proc:${proc._id}`, [proc._id]);
  const [presence, setPresence] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [preview, setPreview] = useState(false);
  const [redlines, setRedlines] = useState<any[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { session, loading } = useUser();
  const user = session?.user;

  const viewMode = !executionMode;

  // Check if user has edit permissions
  const isOwner = proc.owner === user?.username;
  const isAdmin = user?.roles?.includes('admin');
  // TODO: eproc-2 Add permissions canEdit and canExecute
  // const hasPermissions = proc.
  const canEdit = !!(isOwner || isAdmin);
  const metadata = {
    title: proc.title,
    description: proc.description ?? '',
    tags: proc.tags,
  };

  // Determine view mode based on path and execution mode
  let procViewMode: ProcViewModes;
  if (executionMode) {
    procViewMode = 'execute';
  } else if (path.includes('/edit')) {
    procViewMode = 'edit';
  } else if (path.includes('/procs/')) {
    procViewMode = 'view';
  } else {
    procViewMode = 'none';
  }

  async function handlePreviewPrint() {
    setPreview(true);

    // ensure layout applied and assets ready
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );

    if (document.fonts?.ready) await document.fonts.ready;
    if (rootRef.current) await waitForImages(rootRef.current);

    const prev = document.title;
    document.title = `Eproc - Procedure: ${(proc.title ?? slug) as string}`;
    window.print();
    setTimeout(() => {
      document.title = prev;
      // go back to normal
      setPreview(false);
    }, 0);
  }

  const presenceDisplay = useMemo(() => {
    // filter + dedupe names
    const names = Array.from(
      new Set(
        presence
          .map((p) => (p?.name ?? '').trim())
          .filter((n) => n && n !== 'Anonymous')
          .map((n) => (user?.username && n === user?.username ? 'You' : n)),
      ),
    );

    if (names.length === 0) return '—';

    const shown = names.slice(0, MAX_NAMES);
    const rest = names.length - shown.length;

    // Join first 1–3 with commas
    const shownJoined = shown.join(', ');

    if (rest <= 0) return shownJoined;

    const plural = rest === 1 ? 'other' : 'others';
    return `${shownJoined} and ${rest} ${plural}`;
  }, [presence]);

  useEffect(() => {
    // Wait until we know the username
    if (loading) return;

    const socket = getSocket();
    if (!socket) return;
    console.log('ProcPageClient: GOT SOCKET', socket.id, 'for room:', room);

    const name = user?.username || 'Anonymous';
    socket.emit('room:join', { room, name });
    console.log('ProcPageClient: Emitted room:join for user:', name);

    const onPresence = (list: Array<{ id: string; name: string }>) =>
      setPresence(list);
    const onPatch = (payload: { blockId: string; patch: any }) => {
      updateStore({ blockId: payload.blockId, ...payload.patch });
    };

    // Handle redline events
    const onRedlineCreated = (payload: { redline: any }) => {
      setRedlines((prev) => [...prev, payload.redline]);
      console.log('Redline created:', payload.redline);
    };

    const onRedlineUpdated = (payload: { redlineId: string; patch: any }) => {
      setRedlines((prev) =>
        prev.map((r) =>
          r.redlineId === payload.redlineId ? { ...r, ...payload.patch } : r,
        ),
      );
    };

    const onRedlineDeleted = (payload: { redlineId: string }) => {
      console.log('ProcPageClient: Received redline:deleted event', payload);
      console.log(
        'ProcPageClient: Current redlines before deletion:',
        redlines,
      );
      setRedlines((prev) => {
        const newRedlines = prev.filter((r) => {
          const shouldKeep = r.redlineId !== payload.redlineId;
          console.log(
            `ProcPageClient: Checking redline ${r.redlineId} vs ${payload.redlineId}: ${shouldKeep ? 'KEEP' : 'REMOVE'}`,
          );
          return shouldKeep;
        });
        console.log('ProcPageClient: Redlines after deletion:', newRedlines);
        return newRedlines;
      });
    };

    // Handle session record updates
    const onSessionRecordUpdated = (payload: {
      sessionId: string;
      recordId: string;
      state: string;
    }) => {
      console.log('Session record updated:', payload);
      // Trigger a refresh of the page to show updated task status
      window.location.reload();
    };

    socket.on('presence:update', onPresence);
    socket.on('record:patch', onPatch);
    socket.on('redline:created', onRedlineCreated);
    socket.on('redline:updated', onRedlineUpdated);
    socket.on('redline:deleted', onRedlineDeleted);
    socket.on('session:record-updated', onSessionRecordUpdated);

    socket.emit('presence:request', { room });

    return () => {
      socket.off('presence:update', onPresence);
      socket.off('record:patch', onPatch);
      socket.off('redline:created', onRedlineCreated);
      socket.off('redline:updated', onRedlineUpdated);
      socket.off('redline:deleted', onRedlineDeleted);
      socket.off('session:record-updated', onSessionRecordUpdated);
      socket.emit('room:leave', { room });
    };
  }, [room, updateStore, user]);

  // Calculate user permissions based on proc sharedWith data
  const userPermissions = {
    read: isOwner || isAdmin || true, // Default to true for now
    edit: !!(isOwner || isAdmin),
    execute: !!(isOwner || isAdmin),
  };

  console.log('userPermissions', userPermissions);

  const handleAddComment = (redlineId: string, comment: string) => {
    console.log('Adding comment to redline:', redlineId, comment);
    // TODO: Implement actual comment addition logic via API
  };

  const handleRedlineDelete = async (redlineId: string) => {
    console.log('handleRedlineDelete called with redlineId:', redlineId);
    console.log('Current redlines before deletion:', redlines);

    try {
      const response = await fetch('/api/redlines', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procId: proc._id,
          redlineId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete redline');
      }

      // Broadcast via socket to ALL users including current user
      const socket = getSocket();
      if (socket) {
        console.log('room deleted redline is', room, redlineId);
        socket.emit('redline:delete', { room, redlineId });
      }

      // Let the socket event handle the state update for consistency
      // This ensures all users (including the one who deleted) get the same update
    } catch (error) {
      console.error('Failed to delete redline:', error);
    }
  };

  return (
    <RedlineProvider>
      <ProcProvider
        viewMode={procViewMode}
        owner={proc.owner}
        permissions={userPermissions}
        currentUser={user}
        procId={proc._id}
      >
        <Header
          viewMode={viewMode}
          executionMode={executionMode}
          handlePreviewPrint={handlePreviewPrint}
          path={path}
          title={proc.title}
          description={proc.description}
          tags={proc.tags}
          metadata={metadata}
          presenceDisplay={presenceDisplay}
          permissions={userPermissions}
          loading={loading}
          user={user}
        />
        <div>
          <RedlineLayoutWrapper
            redlines={redlines}
            onAddComment={handleAddComment}
            onRedlineDelete={handleRedlineDelete}
          >
            <PuckPreview
              ref={rootRef}
              data={proc.data}
              owner={proc.owner}
              updatedAt={(proc.updatedAt ?? proc.createdAt) as string}
              preview={preview}
              page="letter"
              procId={proc._id}
              room={room}
              title={proc.title}
              onRedlineCreated={(redline) => {
                console.log('Redline created from preview:', redline);
              }}
            />
          </RedlineLayoutWrapper>
        </div>
      </ProcProvider>
    </RedlineProvider>
  );
}
