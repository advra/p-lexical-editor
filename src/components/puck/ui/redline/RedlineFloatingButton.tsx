'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@mui/material';

type Props = {
  onClick: () => void;
  redlineEnabled: boolean;
};

export const RedlineFloatingButton = ({ onClick, redlineEnabled }: Props) => {
  return (
    <Tooltip
      title={redlineEnabled ? 'Disable suggestions' : 'Disable suggestions'}
      placement="right"
    >
      <button
        onClick={redlineEnabled ? onClick : onClick}
        className={cn(
          'scale-100 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
          redlineEnabled
            ? 'bg-white text-white hover:bg-gray-700 hover:cursor-pointer hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-0 '
            : 'bg-gray-200 text-white hover:cursor-pointer hover:scale-100 hover:shadow-none',
        )}
        aria-label={
          redlineEnabled ? 'Enable suggestions' : 'Disable suggestions'
        }
      >
        <span
          className={cn('w-6 h-6', redlineEnabled ? 'bg-red-500' : 'bg-black')}
          style={{
            WebkitMaskImage: "url('/pencil-marked.svg')",
            maskImage: "url('/pencil-marked.svg')",
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            display: 'inline-block',
          }}
          aria-hidden
        />
      </button>
    </Tooltip>
  );
};
