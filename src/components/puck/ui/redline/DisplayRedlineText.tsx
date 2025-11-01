import { cn } from '@/lib/utils/cn';
import { RedlineProps } from './RedlineComponent';
import { useRedline } from '@/context/RedlineContext';
import { useEffect } from 'react';

type RedlineRenderTextInput = {
  blockId?: string;
  isRedlined: boolean;
  redline: RedlineProps;
  fallbackText: string;
  onRedlineClick?: (redline: RedlineProps) => void;
};

export const DisplayRedlineText = ({
  blockId,
  isRedlined,
  redline,
  fallbackText,
  onRedlineClick,
}: RedlineRenderTextInput) => {
  const { selectedRedlineId, setSelectedRedlineId, setSelectedBlockId } =
    useRedline();
  // const newText = redline?.newText || fallbackText;

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
    <div className="whitespace-pre-wrap break-words">
      {isRedlined && redline ? (
        <span
          className="bg-red-100 px-1 rounded  cursor-pointer hover:bg-red-200 transition-colors"
          onClick={handleClick}
        >
          {fallbackText}
        </span>
      ) : (
        fallbackText
      )}
    </div>
  );
};
