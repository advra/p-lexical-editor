// app/procs/[[...puckPath]]/ui/ProcPageClient.tsx
'use client';

import { useRef, useState } from 'react';
import { PaperPage } from './PaperPage';
import { BackToDashboardButton } from './BackToDashboardButton';
import { ExportPDFButton } from './ExportPDFButton';
import { EditButton } from './EditButton';
import { PuckPreview } from './puck-preview';

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
  data,
  slug,
  path,
}: {
  data: any;
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
    document.title = `Eproc - ${(data?.metadata?.title ?? slug) as string}`;
    window.print();
    setTimeout(() => {
      document.title = prev;
      // go back to normal
      setPreview(false);
    }, 0);
  }

  return (
    <>
      <div className="no-print">
        <PaperPage>
          <div className="px-4 mx-auto max-w-screen">
            <div className="flex items-center h-12">
              <BackToDashboardButton />
              <div className="ml-auto flex gap-2">
                <ExportPDFButton handlePreviewPrint={handlePreviewPrint} />
                <EditButton path={path} />
              </div>
            </div>
          </div>
        </PaperPage>
      </div>

      <PuckPreview ref={rootRef} data={data} preview={preview} page="letter" />
    </>
  );
}
