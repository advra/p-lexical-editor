/*
  Use this to add redline modal features to any child this wraps around
*/

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import useUser from '@/hooks/use-user';
import { useProc } from '@/context/ProcContext';

type Props = React.ComponentProps<'div'> & {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export const RedlineWrapper = forwardRef<HTMLDivElement, Props>(
  ({ className, children, onClick, ...rest }, ref) => {
    const [shouldShowHoverStyles, setShouldShowHoverStyles] = useState(false);
    const { owner, currentUser } = useProc();
    let userIsAuthor = false;

    // Only apply hover styles when NOT in edit or execute mode
    const hoverStyles = shouldShowHoverStyles
      ? 'cursor-pointer hover:outline-red-500 hover:[outline-style:dashed]'
      : '';

    useEffect(() => {
      // Check if we're in edit or execute mode by looking at the URL pathname
      const isEditOrExecuteMode = (p: string) =>
        /^\/procs?\/[^/]+\/(edit|execute)\/?$/.test(p);
      // Use currentUser from ProcContext which is properly synchronized
      userIsAuthor = owner === currentUser?.username;
      const showHover =
        !userIsAuthor && !isEditOrExecuteMode(window.location.pathname);
      setShouldShowHoverStyles(showHover);
    }, [owner, currentUser]);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!userIsAuthor) return;
        onClick?.(e);
      },
      [userIsAuthor, onClick],
    );

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-4 min-w-4 outline outline-1 outline-transparent outline-offset-2 transition-shadow',
          hoverStyles,
          className,
        )}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
RedlineWrapper.displayName = 'RedlineWrapper';
