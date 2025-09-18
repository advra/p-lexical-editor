/*
  This renders the puck preview component itself
*/

'use client';

import type { Data } from '@measured/puck';
import { Render } from '@measured/puck';
import config from '@/puck.config';

export function PuckPreview({ data }: { data: Data }) {
  return (
    <>
      <div className="min-h-screen px-16 py-24 mt-24 mb-32 mx-32 bg-white border border-gray-100 shadow-md">
        <Render config={config} data={data} />
      </div>
    </>
  );
}
