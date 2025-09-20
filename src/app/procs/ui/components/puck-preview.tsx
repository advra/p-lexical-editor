// ui/components/puck-preview.tsx
'use client';

import { Render } from '@measured/puck';
import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';
import type { PuckPageData } from '@/app/puck/types';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const PuckPreview = forwardRef<
  HTMLDivElement,
  {
    data: PuckPageData;
    preview?: boolean; // screen vs print-preview
    page?: 'letter' | 'a4';
  }
>(function PuckPreview({ data, preview = false, page = 'letter' }, ref) {
  const size =
    page === 'a4'
      ? 'w-[210mm] min-h-[297mm] p-[12mm]'
      : 'w-[8.5in] min-h-[11in] p-[0.5in]';

  return (
    <div
      ref={ref}
      id="printable"
      className={clsx(
        'bg-white',
        // use classes only; do not alter structure
        preview
          ? clsx(
              size,
              'mx-auto my-6 shadow',
              'print:w-auto print:min-h-0 print:p-0 print:shadow-none print:my-0',
            )
          : 'mt-4 px-4 mx-auto max-w-6xl',
      )}
    >
      <div className="flex flex-col text-right">
        <span className="text-sm text-gray-400">
          Created By: {data.metadata.createdBy}
        </span>
        <span className="text-sm text-gray-400">
          Last Updated: {formatTimestamp(data.metadata.updatedAt)}
        </span>
      </div>

      {/* inner wrapper is constant */}
      <div className="min-h-screen pb-8 mb-32 bg-white border border-gray-100 shadow-md">
        <Render config={config} data={data} />
      </div>
    </div>
  );
});
