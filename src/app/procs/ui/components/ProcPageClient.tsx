// app/procs/[[...puckPath]]/ui/ProcPageClient.tsx
'use client';

import { useRef, useState } from 'react';
import { PaperPage } from './PaperPage';
import { BackToDashboardButton } from './BackToDashboardButton';
import { ExportPDFButton } from './ExportPDFButton';
import { EditButton } from './EditButton';
import { PuckPreview } from './puck-preview';
import { Header } from './Header';
import { PuckPageData } from '@/app/puck/types';
import { ProcPublic } from '@/modules/procs/models/proc-model';

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

export default function ProcPageClient({
  proc,
  slug,
  path,
}: {
  proc: ProcPublic;
  slug: string;
  path: string;
}) {
  const [preview, setPreview] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  console.log('PROC TITLE', proc);

  return (
    <>
      <Header
        executionMode={false}
        handlePreviewPrint={handlePreviewPrint}
        path={path}
        title={proc.title}
        description={proc.description}
        tags={proc.tags}
      />
      <div>
        <PuckPreview
          ref={rootRef}
          data={proc.data}
          owner={proc.owner}
          updatedAt={proc.updatedAt ?? proc.createdAt}
          preview={preview}
          page="letter"
        />
      </div>
    </>
  );
}
