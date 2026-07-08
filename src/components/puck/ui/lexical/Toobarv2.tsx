import { $patchStyleText } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { useCallback, useState } from 'react';

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'XL', value: '24px' },
  { label: '2XL', value: '32px' },
  { label: '3XL', value: '40px' },
];

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Black', value: '#000000' },
  { label: 'Gray', value: '#6B7280' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Yellow', value: '#EAB308' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#A855F7' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'White', value: '#FFFFFF' },
];

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

function Select({
  value,
  onChange,
  options,
  label,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  label: string;
}>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={label}
      aria-label={label}
      className="cursor-pointer px-1 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export const LexicalToolbarV2 = () => {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState('14px');
  const [textColor, setTextColor] = useState('');

  const handleFontSizeChange = useCallback(
    (size: string) => {
      setFontSize(size);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'font-size': size });
        }
      });
    },
    [editor],
  );

  const handleTextColorChange = useCallback(
    (color: string) => {
      setTextColor(color);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (color) {
            $patchStyleText(selection, { color });
          } else {
            $patchStyleText(selection, { color: null });
          }
        }
      });
    },
    [editor],
  );

  return (
    <div className="lexical-toolbar flex flex-wrap gap-1 border-b border-gray-200 p-2 bg-gray-50 justify-center items-center">
      {/* Font Size */}
      <Select
        value={fontSize}
        onChange={handleFontSizeChange}
        options={FONT_SIZES}
        label="Font Size"
      />

      {/* Text Color */}
      <div className="relative flex items-center">
        <input
          type="color"
          value={textColor || '#000000'}
          onChange={(e) => handleTextColorChange(e.target.value)}
          title="Text Color"
          aria-label="Text Color"
          className="cursor-pointer w-6 h-6 p-0 border border-gray-300 rounded"
        />
        {textColor && (
          <button
            type="button"
            onClick={() => handleTextColorChange('')}
            title="Reset color"
            aria-label="Reset color"
            className="ml-0.5 text-xs text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <span className="w-px bg-gray-300 mx-1" />

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
