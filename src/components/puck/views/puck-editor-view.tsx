'use client';

import PuckLoadingSkeleton from '@/components/puck/ui/PuckLoadingSkeleton';
import React, { useEffect, useState } from 'react';
import { PuckClientEditor } from '../ui/puck-editor/puck-client-editor';
import { useRouter } from 'next/navigation';
import { getProcBySlug } from '@/lib/get-page';

type Props = {
  segments: string[];
};

export default function PuckEditorView({ segments }: Props) {
  const router = useRouter();
  const pathname = '/' + segments.join('/');
  const slug = segments[segments.length - 1];
  console.log('segments:', segments);
  console.log('slug:', slug);
  console.log('pathname:', pathname);

  const [proc, setProc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to track if we should show loading skeleton
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const fetchProc = async () => {
      try {
        setLoading(true);
        const procData = getProcBySlug(slug);

        if (!procData) {
          setError('PROC_NOT_FOUND');
          return;
        }

        setProc(procData);
      } catch (err) {
        console.error('Error fetching proc:', err);
        setError('FETCH_ERROR');
      } finally {
        setLoading(false);
      }
    };

    fetchProc();
  }, [slug]);

  useEffect(() => {
    // Show loading skeleton for at least 500ms to prevent flicker
    if (!loading && proc) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (loading) {
      setShowLoading(true);
    }
  }, [loading, proc]);

  // Handle errors
  useEffect(() => {
    if (error === 'PROC_NOT_FOUND') {
      // Could redirect to 404 page or show not found message
      console.log('Proc not found:', slug);
    }
  }, [error, slug]);

  if (error === 'PROC_NOT_FOUND') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Document Not Found
          </h2>
          <p className="text-gray-600">
            The document you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Failed to load editor
          </h2>
          <p className="text-gray-600">
            Please try refreshing the page or check your connection.
          </p>
        </div>
      </div>
    );
  }

  return showLoading ? (
    <PuckLoadingSkeleton />
  ) : proc ? (
    <PuckClientEditor pathName={pathname} proc={proc} slug={slug} />
  ) : null;
}
