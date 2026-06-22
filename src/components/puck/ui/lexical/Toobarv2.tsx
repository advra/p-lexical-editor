import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND } from 'lexical';

function ToolbarButton({
  onClick,
  isActive,
  label,
  children,
}: Readonly<{
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`cursor-pointer px-2 py-1 text-sm rounded ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

export const LexicalToolbarV2 = () => {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="lexical-toolbar flex flex-wrap gap-1 border-b border-gray-200 p-2 bg-gray-50 justify-center">
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        label="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        label="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        label="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      {/* <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        label="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton> */}
      <span className="w-px bg-gray-300 mx-1" />
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        label="Align Left"
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        label="Align Center"
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        label="Align Right"
      >
        ≡
      </ToolbarButton>
    </div>
  );
};
