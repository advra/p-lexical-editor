/*
  This renders the puck preview component itself
*/

'use client';

import type { Data } from '@measured/puck';
import { Render } from '@measured/puck';
import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';

export function PuckPreview({ data }: { data: Data }) {
  return (
    <div className="mt-12 px-16 mx-32">
      <div className="flex flex-col m-2 align-middle text-right">
        <span className="text-sm text-gray-400">
          Created By: {data.metadata.createdBy}
        </span>
        <span className="text-sm text-gray-400">
          Last Updated: {formatTimestamp(data.metadata.updatedAt)}
        </span>
      </div>
      <div className="min-h-screen pb-8 mb-32 bg-white border border-gray-100 shadow-md">
        <Render config={config} data={data} />
      </div>
    </div>
  );
}
