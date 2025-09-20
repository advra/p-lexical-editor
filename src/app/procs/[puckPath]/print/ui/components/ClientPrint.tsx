'use client';

import { useEffect, useRef } from 'react';
import { Render } from '@measured/puck';
import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';
import type { PuckPageData } from '@/app/puck/types';

function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true }); // don't block on errors
          }),
    ),
  );
}

export function ClientPrint({ data }: { data: PuckPageData }) {
  const printedRef = useRef(false);

  useEffect(() => {
    if (!data || printedRef.current) return;
    printedRef.current = true;

    (async () => {
      // ensure DOM is painted
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      // wait for web fonts (if supported)
      // @ts-ignore
      if (document.fonts?.ready) await document.fonts.ready;

      // wait for images within the printable area
      const root = document.getElementById('printable') ?? document.body;
      await waitForImages(root);

      window.print();
    })();
  }, [data]);

  return (
    <>
      <span className="print:hidden block w-full text-center my-3 text-gray-500">
        You are viewing a Print Preview: Right Click &gt; Print &gt; Save the
        PDF
      </span>
      <div
        id="printable"
        className="
        bg-white
        w-[8.5in] min-h-[11in]        /* on-screen true Letter size */
        p-[0.5in]                     /* match the @page margin for a 1:1 preview */
        mx-auto my-6                  /* center on screen */
        shadow                        /* paper look */
        print:w-auto print:min-h-0    /* printing uses the whole page area */
        print:p-0                     /* remove padding; @page margin handles it */
        print:shadow-none print:my-0
      "
      >
        <div className="flex flex-col align-middle text-right">
          <span className="text-sm text-gray-400">
            Created By: {data.metadata.createdBy}
          </span>
          <span className="text-sm text-gray-400">
            Last Updated: {formatTimestamp(data.metadata.updatedAt)}
          </span>
        </div>
        <div>
          <Render config={config} data={data} />
        </div>
      </div>
    </>
  );
}
