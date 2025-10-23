'use client';

import PuckLoadingSkeleton from '@/components/puck/ui/PuckLoadingSkeleton';
import React, { useEffect, useState } from 'react';
import { PuckClientEditor } from '../ui/puck-editor/puck-client-editor';
import { ProcPublic } from '@/modules/procs/models/proc-model';

type Props = {
  path: string;
  proc: ProcPublic;
};

export default function PuckEditorView({ path, proc }: Props) {
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    if (proc) {
      setisLoading(false);
    }
  }, [proc]);

  return isLoading ? (
    <PuckLoadingSkeleton />
  ) : (
    <PuckClientEditor path={path} proc={proc} />
  );
}
