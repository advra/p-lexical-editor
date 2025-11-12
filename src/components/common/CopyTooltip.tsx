'use client';

import { useEffect, useState } from 'react';

interface Props {
  show: boolean;
  position: { x: number; y: number };
  message: string;
  duration?: number;
}

export function CustomCursorTooltip({ show, position, message }: Props) {
  if (!show) return null;

  return (
    <div
      className="fixed z-50 bg-white text-black px-3 py-2 rounded-md text-sm font-medium shadow-lg pointer-events-none transition-all duration-200 border border-gray-200"
      style={{
        top: position.y + 20,
        left: position.x,
        transform: 'translateX(-50%)',
      }}
    >
      {message}

      {/* Mask the tooltip's top border so the arrow base blends */}
      <span
        className="absolute -top-px left-1/2 -translate-x-1/2
               w-6 h-[2px] bg-white"
        aria-hidden
      />

      {/* Outer triangle (border/shadow) */}
      <span
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0
               border-l-[10px] border-r-[10px] border-b-[10px]
               border-l-transparent border-r-transparent border-b-gray-200"
        aria-hidden
      />

      {/* Inner triangle (fill) */}
      <span
        className="absolute -top-[11px] left-1/2 -translate-x-1/2 w-0 h-0
               border-l-[9px] border-r-[9px] border-b-[9px]
               border-l-transparent border-r-transparent border-b-white z-10"
        aria-hidden
      />
    </div>
  );
}
