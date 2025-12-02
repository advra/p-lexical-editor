// app/procs/[[...puckPath]]/ui/ProcPageClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PuckPreview } from './puck-preview';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import { useUser } from '@/context/UserContext';
import { getSocket } from '@/lib/socket';
import { ProcProvider, ProcViewModes } from '@/context/ProcContext';
import { RedlineLayoutWrapper } from '../../redline/RedlineLayoutWrapper';
import { User } from '@/modules/auth/types';

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
  const room = useMemo(() => `proc:${slug}`, [slug]);
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
  // const isOwner = proc.owner === user?.username;
  const isOwner = true;
  const isAdmin = user?.roles?.includes('admin');
  // TODO: eproc-2 Add permissions canEdit and canExecute
  // const hasPermissions = proc.
  const canEdit = !!(isOwner || isAdmin);
  const metadata = {
    title: slug,
    description: '',
    tags: 'test tag',
  };

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

    socket.on('presence:update', onPresence);
    socket.on('redline:created', onRedlineCreated);
    socket.on('redline:updated', onRedlineUpdated);
    socket.on('redline:deleted', onRedlineDeleted);
    socket.emit('presence:request', { room });

    return () => {
      socket.off('presence:update', onPresence);
      socket.off('redline:created', onRedlineCreated);
      socket.off('redline:updated', onRedlineUpdated);
      socket.off('redline:deleted', onRedlineDeleted);
      socket.emit('room:leave', { room });
    };
  }, [room, user]);

  // Calculate user permissions based on proc sharedWith data
  const userPermissions = {
    read: isOwner || isAdmin || true, // Default to true for now
    edit: !!(isOwner || isAdmin),
    execute: !!(isOwner || isAdmin),
  };

  const handleRedlineDelete = async (redlineId: string) => {
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

  const stubbedUser: User = {
    username: 'admin',
    roles: ['super-admin', 'admin'],
  };
  return (
    <RedlineLayoutWrapper
      room={room}
      redlines={redlines}
      onAddComment={undefined}
      onRedlineDelete={handleRedlineDelete}
    >
      <PuckPreview
        ref={rootRef}
        puckPageData={proc.data}
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
  );
}
