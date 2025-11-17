import React from 'react';
import { Session } from '@/modules/auth/types';
import CheckIcon from '@mui/icons-material/Check';
import { LocalCompletionState } from '@/context/LocalStoreContext';
import { formatTimestamp } from '@/lib/utils/dateformat';
import { SharedCompletionState } from '@/context/ExecuteStoreContext';

type Props = {
  blockData: {
    label: string;
    // for example can be the step or title
    id?: string;
  };
  completionData: LocalCompletionState | SharedCompletionState | null;
  session: Session | null;
};

function CompleteTimestamp({ blockData, completionData, session }: Props) {
  console.log('completionData: ', completionData);
  return (
    <>
      {completionData?.completed && session?.user.username && (
        <div className="flex items-center gap-2 text-green-600 bg-green-500/5 border rounded-sm border-green-500/20 p-2">
          <CheckIcon className="text-green-600" sx={{ fontSize: 20 }} />
          <div>
            {blockData.label} {blockData.id && <span>({blockData.id})</span>}{' '}
            marked complete by{' '}
            <span className="font-semibold">{session?.user.username}</span>{' '}
            {formatTimestamp(completionData?.completedAt ?? '')}
          </div>
        </div>
      )}
    </>
  );
}

export default CompleteTimestamp;
