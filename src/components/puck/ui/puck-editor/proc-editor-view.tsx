'use client';

import React from 'react';
import ProcPageClient from './components/ProcPageClient';
import { useQuery } from '@tanstack/react-query';

type Props = {
  slug: string;
};

function ProcEditorView({ slug }: Props) {
  const {
    data: proc,
    isLoading,
    isError,
  } = useQuery(trpc.procs.getOne.queryOptions({ by: 'slug', slug }));

  if (isError) {
    return <>Failed to load Proc</>;
  }

  return <ProcPageClient proc={proc} slug={slug} path={`/procs/${slug}`} />;
}

export default ProcEditorView;
