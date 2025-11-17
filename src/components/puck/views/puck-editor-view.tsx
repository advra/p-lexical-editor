'use client';

import PuckLoadingSkeleton from '@/components/puck/ui/PuckLoadingSkeleton';
import React, { useEffect, useState } from 'react';
import { PuckClientEditor } from '../ui/puck-editor/puck-client-editor';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { TRPCClientError } from '@trpc/client';
import { useRouter } from 'next/navigation';

type Props = {
  segments: string[];
};

export default function PuckEditorView({ segments }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const pathname = '/' + segments.join('/');
  const slug = segments[segments.length - 1];
  console.log('segments:', segments);
  console.log('slug:', slug);
  console.log('pathname:', pathname);

  const { data, isLoading, isError, error } = useQuery(
    trpc.procs.getBySlug.queryOptions({ slug }),
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

  // handle specific errors
  useEffect(() => {
    if (error && error instanceof TRPCClientError) {
      const errorData = error.data;

      if (errorData?.code === 'UNAUTHORIZED') {
        // Redirect to login for unauthorized users
        router.push('/login');
        return;
      }

      if (errorData?.code === 'FORBIDDEN') {
        // Handle forbidden access (user authenticated but no permissions)
        // Could redirect to dashboard or show specific forbidden message
        console.log('User does not have access to this document');
      }
    }
  }, [error, router]);

  if (
    isError &&
    error instanceof TRPCClientError &&
    error.data?.code !== 'UNAUTHORIZED'
  ) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {error.data?.code === 'FORBIDDEN'
              ? 'Access Denied'
              : 'Failed to load editor'}
          </h2>
          <p className="text-gray-600">
            {error.data?.code === 'FORBIDDEN'
              ? 'You do not have permission to access this document.'
              : 'Please try refreshing the page or check your connection.'}
          </p>
        </div>
      </div>
    );
  }

  return showLoading ? (
    <PuckLoadingSkeleton />
  ) : data ? (
    <PuckClientEditor pathName={pathname} proc={data} slug={slug} />
  ) : null;
}
