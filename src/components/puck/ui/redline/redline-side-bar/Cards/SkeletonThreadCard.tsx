import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  onClose: () => void;
};

function SkeletonThreadCard({ onClose }: Props) {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-32 mb-2"></div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Timestamp skeleton */}
      <div className="px-4 pt-2 ml-auto">
        <div className="h-3 bg-gray-200 rounded w-52 animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col m-2 p-4 rounded-md border border-gray-200">
        {/* DCN skeleton */}
        <div className="flex text-sm mb-2">
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
        </div>

        {/* Author skeleton */}
        <div className="text-sm mb-2">
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>

        {/* Text content skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>

        {/* More button skeleton */}
        <div className="ml-auto">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    </>
  );
}

export default SkeletonThreadCard;
