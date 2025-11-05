import { cn } from '@/lib/utils/cn';
import { RedlineProps } from './RedlineComponent';
import { useRedline } from '@/context/RedlineContext';
import { useEffect } from 'react';

type RedlineRenderTextInput = {
  blockId?: string;
  isRedlined: boolean;
  redline: RedlineProps;
  originalText: string;
  onRedlineClick?: (redline: RedlineProps) => void;
};

export const DisplayRedlineText = ({
  blockId,
  isRedlined,
  redline,
  originalText,
  onRedlineClick,
}: RedlineRenderTextInput) => {
  const { selectedRedlineId, setSelectedRedlineId, setSelectedBlockId } =
    useRedline();
  const newText = redline?.newText || originalText;
  let REDLINE_LABEL_ID =
    blockId && redline && redline.dcn && redline.userId
      ? `redline-${blockId}-${redline.dcn}-${redline.userId}`
      : 'redline-undefined';

  const handleClick = () => {
    if (isRedlined) {
      if (redline && onRedlineClick) {
        // open redline dialog
        console.log('OPEN REDLINE');
        onRedlineClick(redline);
      } else {
        // set id here to open the comment
        if (redline && blockId) {
          console.log('selectedRedlineId to open Comments', selectedRedlineId);
          setSelectedRedlineId(redline.dcn);
          setSelectedBlockId(blockId);
        }
      }
    }
  };

  return (
    <div className="whitespace-pre-wrap break-words" id={REDLINE_LABEL_ID}>
      {isRedlined && redline ? (
        <div className="flex gap-2">
          <span
            id={blockId}
            className="bg-red-100 px-1 rounded  cursor-pointer hover:bg-red-200 transition-colors line-through text-red-500"
            onClick={handleClick}
          >
            {originalText}
          </span>
          <span>{newText}</span>
        </div>
      ) : (
        originalText
      )}
    </div>
  );
};
