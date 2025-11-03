import React, { useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';

import { formatTimestamp } from '@/lib/utils/dateformat';
import MoreButton from './MoreButton';
import { Redline } from '@/modules/redlines/models/redline-model';
import SkeletonThreadCard from './SkeletonThreadCard';
import Button from '@/components/common/buttons/Button';

type Props = {
  redlineData: Redline | null;
  isLoading: boolean;
  isAuthor: boolean;
  onClose: () => void;
  onDeleteRedline?: (redlineId: string) => void;
  onEditRedline: () => void;
};

function RedlineThreadCard({
  redlineData,
  isLoading,
  isAuthor,
  onClose,
  onDeleteRedline,
  onEditRedline,
}: Props) {
  if (isLoading) {
    return <SkeletonThreadCard onClose={onClose} />;
  }

  if (!redlineData) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Redline data not available</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800">Redline Discussion</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <span className="px-4 pt-2 ml-auto text-sm text-gray-500">
        {formatTimestamp(redlineData.createdAt.toString())}
      </span>
      <div className="flex flex-col gap-2 m-2 p-4 rounded-md border border-gray-200">
        <div className="flex text-sm ">
          <span className="flex gap-1">
            <HistoryIcon
              fontSize="small"
              color="info"
              className="align-middle"
            />
            <span className="font-semibold text-black">DCN:</span>{' '}
            {redlineData.dcn}
          </span>
        </div>
        <div className="text-sm ">
          <span className="font-semibold ">Author: </span>
          <span>{redlineData.userId}</span>
        </div>
        <div>{redlineData.newText}</div>
        <div className="ml-auto">
          <MoreButton
            deleteRedlineCallback={() =>
              onDeleteRedline?.(redlineData.redlineId)
            }
            isRedlineOwner={isAuthor}
            editRedlineCallback={onEditRedline}
          />
        </div>
        <Button className="border border-gray-200">Mark Resolved</Button>
      </div>
    </>
  );
}

export default RedlineThreadCard;
