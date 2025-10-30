'use client';

import { LocalStoreProvider } from '@/context/LocalStoreContext';
import React, { useState } from 'react';
import ProcPageClient from './components/ProcPageClient';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

type Props = {
  slug: string;
};

function ProcEditorView({ slug }: Props) {
  const trpc = useTRPC();
  const {
    data: proc,
    isLoading,
    isError,
  } = useQuery(trpc.procs.getOne.queryOptions({ by: 'slug', slug }));

  if (isError) {
    return <>Failed to load Proc</>;
  }

  return (
    <LocalStoreProvider initialProc={proc}>
      <ProcPageClient proc={proc} slug={slug} path={`/procs/${slug}`} />
    </LocalStoreProvider>
  );
}

export default ProcEditorView;
