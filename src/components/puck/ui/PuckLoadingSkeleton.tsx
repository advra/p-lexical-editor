'use client';

import { Skeleton } from '@mui/material';

export const PuckLoadingSkeleton = () => {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Header Skeleton */}
      <div className="flex gap-2 1 h-[48px] w-full items-center border-b-1 border-b-gray-300 shadow-xs bg-white">
        <div className="w-[320px] p-2">
          <Skeleton variant="rounded" width={120} height={32} />
        </div>
        <div className="mx-auto p-2">
          <Skeleton variant="rounded" width={400} height={32} />
        </div>
        <div className="w-[320px] flex gap-2 p-2">
          <Skeleton variant="rounded" width={64} height={32} />
          <Skeleton variant="rounded" width={80} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex h-full">
        {/* Sidebar Skeleton */}
        <div className="w-[320px] border-r overflow-y-scroll border-gray-200 bg-white p-4">
          <div className="space-y-4">
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
          </div>
        </div>

        {/* Editor Area Skeleton */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Title Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton
                variant="text"
                width="60%"
                height={48}
                className="mx-auto"
              />
              <Skeleton variant="rounded" width="100%" height={2} />
            </div>

            {/* Content Blocks Skeleton */}
            <div className="space-y-4">
              <Skeleton variant="rounded" width="100%" height={120} />
              <Skeleton variant="rounded" width="100%" height={80} />
              <Skeleton variant="rounded" width="100%" height={200} />
              <Skeleton variant="rounded" width="100%" height={150} />
            </div>
          </div>
        </div>

        {/* Properties Panel Skeleton */}
        <div className="w-[320px] border-l border-gray-200 bg-white p-4">
          <div className="space-y-4">
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={40} />
            <Skeleton variant="rounded" width="100%" height={80} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuckLoadingSkeleton;
