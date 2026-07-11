import { useProc } from '@/context/ProcContext';
import { RedlineProps } from './RedlineComponent';
import { useRedline } from '@/context/RedlineContext';

type RedlineRenderTextInput = {
  blockId?: string;
  isRedlined: boolean;
  redline: RedlineProps;
  originalText: string;
  onRedlineClick?: (redline: RedlineProps) => void;
};

/** Extract the actual HTML content from Puck's richtext field value.
 *  Puck stores richtext values as descriptor objects like:
 *    { key: "text", props: { fallback: { props: { content: "<p>HTML</p>" } } } }
 *  But it can also be a plain HTML string.
 */
function extractRichTextContent(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  // Puck descriptor object format
  if (typeof value === 'object') {
    // Try props.fallback.props.content
    const content = value?.props?.fallback?.props?.content;
    if (typeof content === 'string') return content;
    // Try props.content directly
    const directContent = value?.props?.content;
    if (typeof directContent === 'string') return directContent;
  }
  return String(value);
}

export const DisplayRedlineText = ({
  blockId,
  isRedlined,
  redline,
  originalText,
  onRedlineClick,
}: RedlineRenderTextInput) => {
  const isInEditor =
    typeof window !== 'undefined' && window.location.pathname.includes('/edit');
  const { selectedRedlineId, setSelectedRedlineId, setSelectedBlockId } =
    useRedline();
  const resolvedOriginalText = extractRichTextContent(originalText);
  const newText = redline?.newText || resolvedOriginalText;
  let REDLINE_LABEL_ID =
    blockId && redline?.dcn && redline.userId
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

  // inside editor just render the puck component
  if (isInEditor) {
    return originalText;
  }

  // outside editor resolve the html rich text
  return (
    <div className="whitespace-pre-wrap break-words" id={REDLINE_LABEL_ID}>
      {isRedlined && redline ? (
        <div>
          <span
            id={blockId}
            className="bg-red-100 px-1 rounded  cursor-pointer hover:bg-red-200 transition-colors line-through text-red-500"
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: resolvedOriginalText }}
          />
          <span dangerouslySetInnerHTML={{ __html: newText }} />
        </div>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: resolvedOriginalText }} />
      )}
    </div>
  );
};
