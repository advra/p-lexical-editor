import { cn } from '@/lib/utils/cn';
import { RedlineProps } from './RedlineComponent';

type RedlineRenderTextInput = {
  isRedlined: boolean;
  redline: RedlineProps;
  fallbackText: string;
  onRedlineClick?: (redline: RedlineProps) => void;
};

export const DisplayRedlineText = ({
  isRedlined,
  redline,
  fallbackText,
  onRedlineClick,
}: RedlineRenderTextInput) => {
  const newText = redline?.newText || fallbackText;
  const originalText = redline?.originalText || fallbackText;

  const handleClick = () => {
    if (isRedlined && redline && onRedlineClick) {
      onRedlineClick(redline);
    }
  };

  return (
    <div className="whitespace-pre-wrap break-words">
      {isRedlined && redline ? (
        <span
          className="bg-yellow-100 px-1 rounded border border-yellow-200 cursor-pointer hover:bg-yellow-200 transition-colors"
          onClick={handleClick}
          title="Click to view comments"
        >
          {newText}
        </span>
      ) : (
        newText
      )}
    </div>
  );
};
