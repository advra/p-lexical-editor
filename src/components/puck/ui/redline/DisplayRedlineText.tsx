import { cn } from '@/lib/utils/cn';
import { RedlineProps } from './RedlineComponent';

type RedlineRenderTextInput = {
  isRedlined: boolean;
  redline: RedlineProps;
  fallbackText: string;
};

export const DisplayRedlineText = ({
  isRedlined,
  redline,
  fallbackText,
}: RedlineRenderTextInput) => {
  const newText = redline?.newText || fallbackText;
  const originalText = redline?.originalText || fallbackText;
  return (
    <div
      className={cn(
        'whitespace-pre-wrap break-words',
        isRedlined && redline && 'line-through decoration-red-500 decoration-1',
      )}
    >
      {isRedlined ? originalText : newText}
    </div>
  );
};
