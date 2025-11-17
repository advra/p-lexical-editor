import React, { useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';

import { formatTimestamp } from '@/lib/utils/dateformat';
import { Redline } from '@/modules/redlines/models/redline-model';
import SkeletonThreadCard from './SkeletonThreadCard';
import MoreButton from './MoreButton';
import Button from '@/components/common/buttons/Button';
import { IconButton, Tooltip } from '@mui/material';

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
          <h3 className="font-semibold text-gray-800">Redline Details</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <span className="px-4 pt-2 ml-auto text-xs text-gray-500">
        {formatTimestamp(redlineData.createdAt.toString())}
      </span>
      <div className="flex flex-col gap-2 m-2 p-4 rounded-md border border-gray-200">
        <div className="flex">
          <span className="flex gap-1">
            <HistoryIcon
              fontSize="medium"
              color="info"
              className="align-middle"
            />
            <span className="font-semibold text-black">DCN:</span>{' '}
            {redlineData.dcn}
          </span>
        </div>
        <div className="">
          <span className="font-semibold ">Author: </span>
          <span>{redlineData.userId}</span>
        </div>
        <div>
          <span className="text-gray-800 font-semibold ">Before:</span>
          <div className="bg-red-100 rounded-sm p-2">
            {redlineData.originalText}
          </div>
        </div>
        <div>
          <span className="text-gray-800 font-semibold ">After:</span>
          <div className="bg-green-100 rounded-sm p-2">
            {redlineData.newText}
          </div>
        </div>
        <div className="ml-auto">
          <Tooltip title="Share Link" className="hover:cursor-pointer">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          {isAuthor && (
            <MoreButton
              deleteRedlineCallback={() =>
                onDeleteRedline?.(redlineData.redlineId)
              }
              isRedlineOwner={isAuthor}
              editRedlineCallback={onEditRedline}
            />
          )}
        </div>
        {/* <Button className="border border-gray-200">Mark Resolved</Button> */}
      </div>
    </>
  );
}

export default RedlineThreadCard;
