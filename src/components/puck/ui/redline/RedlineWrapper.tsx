/*
  Use this to add redline modal features to any child this wraps around
*/

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type Props = React.ComponentProps<'div'> & {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export const RedlineWrapper = forwardRef<HTMLDivElement, Props>(
  ({ className, children, onClick, ...rest }, ref) => {
    // Check if we're in edit mode by looking at the URL pathname
    const isProcEditOrExecute = (p: string) =>
      /^\/procs?\/[^/]+\/(edit|execute)\/?$/.test(p);
    const isEditOrExecuteMode =
      typeof window !== 'undefined' &&
      isProcEditOrExecute(window.location.pathname);

    // Only apply hover styles when NOT in edit mode
    const hoverStyles = isEditOrExecuteMode
      ? ''
      : 'hover:outline-red-500 hover:[outline-style:dashed]';

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-4 min-w-4 cursor-pointer outline outline-1 outline-transparent outline-offset-2 transition-shadow',
          hoverStyles,
          className,
        )}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
RedlineWrapper.displayName = 'RedlineWrapper';
