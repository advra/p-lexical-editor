// app/procs/[[...puckPath]]/ui/ProcPageClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PuckPreview } from './puck-preview';
import { Header } from './Header';
import { ProcPublic } from '@/modules/procs/models/proc-model';
import { useStore } from '@/context/StoreContext';
import useUser from '@/hooks/use-user';
import { getSocket } from '@/lib/socket';

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
  proc: ProcPublic;
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  // const { store, updateStore } = useStore();
  const { session, loading } = useUser();
  const user = session?.user;

  const viewMode = !executionMode;
  const metadata = {
    title: proc.title,
    description: proc.description ?? '',
    tags: proc.tags,
  };

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
          .filter((n) => n && n !== 'Anonymous'),
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
    console.log('GOT SOCKET', socket);

    const name = user?.username || 'Anonymous';
    socket.emit('room:join', { room, name });

    const onPresence = (list: Array<{ id: string; name: string }>) =>
      setPresence(list);
    const onPatch = (payload: { record_id: string; patch: any }) => {
      updateStore({ record_id: payload.record_id, ...payload.patch });
    };

    socket.on('presence:update', onPresence);
    socket.on('record:patch', onPatch);

    socket.emit('presence:request', { room });

    return () => {
      socket.off('presence:update', onPresence);
      socket.off('record:patch', onPatch);
      socket.emit('room:leave', { room });
    };
  }, [room, updateStore, user]);

  return (
    <>
      <Header
        viewMode={viewMode}
        executionMode={executionMode}
        handlePreviewPrint={handlePreviewPrint}
        path={path}
        title={proc.title}
        description={proc.description}
        tags={proc.tags}
        metadata={metadata}
      />
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-500 p-2">
          Viewing now: {presenceDisplay}
        </div>

        {/* render your Puck view here — TaskItem components will read from the store */}
        {/* <PuckPreview data={proc.data} /> or your custom renderer */}
      </div>
      <div>
        <PuckPreview
          ref={rootRef}
          data={proc.data}
          owner={proc.owner}
          updatedAt={(proc.updatedAt ?? proc.createdAt) as string}
          preview={preview}
          page="letter"
        />
      </div>
    </>
  );
}
