// ui/components/puck-preview.tsx
'use client';

import { Render } from '@measured/puck';
import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';
import type { PuckPageData } from '@/app/puck/types';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { RedlineRender } from '@/components/puck/ui/redline/RedlineRender';

export const PuckPreview = forwardRef<
  HTMLDivElement,
  {
    data: PuckPageData;
    preview?: boolean; // screen vs print-preview
    page?: 'letter' | 'a4';
    owner: string;
    updatedAt: string;
    procId: string;
    room: string;
    onRedlineCreated?: (redline: any) => void;
  }
>(function PuckPreview(
  {
    data,
    preview = false,
    page = 'letter',
    owner,
    updatedAt,
    procId,
    room,
    onRedlineCreated,
  },
  ref,
) {
  const size =
    page === 'a4'
      ? 'w-[210mm] min-h-[297mm] p-[12mm]'
      : 'w-[8.5in] min-h-[11in] p-[0.5in]';

  const handleRedlineSave = (
    dcn: string,
    description: string,
    originalText: string,
  ) => {
    console.log('Redline saved:', { dcn, description, originalText });
    // Here you would typically save the redline data to your backend
    // For now, we'll just log it
  };

  return (
    // Show the printable version or actual proc page
    <div
      ref={ref}
      id="printable"
      className={clsx(
        'bg-white',
        preview
          ? clsx(
              size,
              'mx-auto',
              'print:w-auto print:min-h-0 print:p-0 print:shadow-none print:my-0',
            )
          : 'mt-24 px-4 mx-auto max-w-6xl my-6 shadow',
      )}
    >
      <div className="flex flex-col text-right">
        <span className="text-sm text-gray-400">Created By: {owner}</span>
        <span className="text-sm text-gray-400">
          Last Updated: {formatTimestamp(updatedAt)}
        </span>
      </div>

      {/* inner wrapper is constant */}
      <div className="min-h-screen">
        <RedlineRender
          config={config}
          data={data}
          procId={procId}
          room={room}
          onRedlineSave={handleRedlineSave}
        />
      </div>
    </div>
  );
});
