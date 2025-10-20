/*
  Use this to add redline modal features to any child this wraps around
*/

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type Props = React.ComponentProps<'div'> & {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  redlineHoverEnabled?: boolean;
};

export const RedlineWrapper = forwardRef<HTMLDivElement, Props>(
  (
    { className, children, onClick, redlineHoverEnabled = false, ...rest },
    ref,
  ) => {
    // Apply hover styles when redlineHoverEnabled is true
    const hoverStyles = redlineHoverEnabled
      ? 'cursor-pointer hover:outline-red-500 hover:[outline-style:dashed]'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-4 min-w-4 outline outline-1 outline-transparent outline-offset-2 transition-shadow',
          hoverStyles,
          className,
        )}
        onClick={redlineHoverEnabled ? onClick : undefined}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
RedlineWrapper.displayName = 'RedlineWrapper';
