'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@mui/material';

type NavigationFloatingButtonProps = {
  onClick: () => void;
  isOpen?: boolean;
};

export const NavigationFloatingButton = ({
  onClick,
  isOpen = false,
}: NavigationFloatingButtonProps) => {
  return (
    <Tooltip title="Open Page Navigation" placement="right">
      <button
        onClick={onClick}
        className={cn(
          'scale-100',
          'w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg',
          'flex items-center justify-center transition-all duration-300',
          'hover:cursor-pointer hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isOpen && 'opacity-0 pointer-events-none',
        )}
        aria-label="Open navigation menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </Tooltip>
  );
};
