import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn'; // or your cn helper

type Props = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

export const RedlineWrapper = forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-4 min-w-4 cursor-pointer outline outline-1 outline-transparent hover:outline-red-500 hover:[outline-style:dashed] outline-offset-2 transition-shadow',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
RedlineWrapper.displayName = 'RedlineWrapper';
