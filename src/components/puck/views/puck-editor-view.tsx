'use client';

import PuckLoadingSkeleton from '@/components/puck/ui/PuckLoadingSkeleton';
import React, { useEffect, useState } from 'react';
import { PuckClientEditor } from '../ui/puck-editor/puck-client-editor';
import { ProcPublic } from '@/modules/procs/models/proc-model';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

type Props = {
  segments: string[];
};

export default function PuckEditorView({ segments }: Props) {
  const trpc = useTRPC();
  const pathname = '/' + segments.join('/');
  const slug = segments[segments.length - 1];
  // const slug = segments.split('/').filter(Boolean).pop()!;
  console.log('segments:', segments);
  console.log('slug:', slug);
  console.log('pathname:', pathname);

  const { data, isLoading, isError } = useQuery(
    trpc.procs.getOne.queryOptions({ by: 'slug', slug }),
  );

  // State to track if we should show loading skeleton
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading skeleton for at least 500ms to prevent flicker
    if (!isLoading && data) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isLoading) {
      setShowLoading(true);
    }
  }, [isLoading, data]);

  // Show error state if query fails
  // if (isError) {
  //   return (
  //     <div className="h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold text-red-600 mb-2">
  //           Failed to load editor
  //         </h2>
  //         <p className="text-gray-600">
  //           Please try refreshing the page or check your connection.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return showLoading ? (
    <PuckLoadingSkeleton />
  ) : data ? (
    <PuckClientEditor pathName={pathname} proc={data} slug={slug} />
  ) : null;
}
