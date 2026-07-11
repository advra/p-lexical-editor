import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';

export const FONT_SIZES = [
  { label: '8', value: '8pt' },
  { label: '10', value: '10pt' },
  { label: '12', value: '12pt' },
  { label: '14', value: '14pt' },
  { label: '16', value: '16pt' },
  { label: '18', value: '18pt' },
  { label: '20', value: '20pt' },
  { label: '24', value: '24pt' },
  { label: '28', value: '28pt' },
  { label: '32', value: '32pt' },
  { label: '36', value: '36pt' },
  { label: '48', value: '48pt' },
  { label: '60', value: '60pt' },
  // { label: 'Small Text', value: '0.875rem' },
  // { label: 'Paragraph', value: '1rem' },
  // { label: 'Lead Paragraph', value: '1.2rem' },
  // { label: 'Section Header', value: '1.25rem' },
  // { label: 'Subtitle', value: '2rem' },
  // { label: 'Main Title', value: '2.5rem' },
];
export const DEFAULT_FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Verdana', value: 'Verdana' },
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

/**
 * Toolbar component for the Lexical editor that provides formatting button options
 */
export const LexicalToolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState('12pt');
  const [blockFormat, setBlockFormat] = useState<string>('left');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalics, setIsItalics] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [isStrikethrough, setIsStrikethrough] = useState<boolean>(false);

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

  const handleFontFamilyChange = useCallback(
    (font: string) => {
      setFontFamily(font);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'font-family': font });
        }
      });
    },
    [editor],
  );

  // Read the selected node info
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          // Walk up to find the block-level element (paragraph, heading, etc.)
          let node = anchorNode;
          while (node && !$isElementNode(node)) {
            node = node.getParentOrThrow();
          }
          if (node) {
            const format = node.getFormatType(); // returns 'left' | 'center' | 'right' | 'justify' | 'start'
            setBlockFormat(format);
          }

          // font formatting bold, italics, underline, strike
          setIsBold(selection.hasFormat('bold'));
          setIsItalics(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
          setIsStrikethrough(selection.hasFormat('strikethrough'));
          // font family and size
          const family = $getSelectionStyleValueForProperty(
            selection,
            'font-family',
            DEFAULT_FONT_FAMILIES[0].value,
          );
          const size = $getSelectionStyleValueForProperty(
            selection,
            'font-size',
            '12pt',
          );
          setFontFamily(family);
          setFontSize(size);
        }
      });
    });
    return () => unregister();
  }, [editor]);

  return (
    <div className="lexical-toolbar flex flex-wrap gap-1 border-b border-gray-200 p-2 bg-gray-50 items-center">
      {/* Font Family */}
      <select
        value={fontFamily}
        onChange={(e) => handleFontFamilyChange(e.target.value)}
        title="Font Family"
        aria-label="Font Family"
        className="cursor-pointer px-1 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {DEFAULT_FONT_FAMILIES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Font Size */}
      <select
        value={fontSize}
        onChange={(e) => handleFontSizeChange(e.target.value)}
        title="Font Size"
        aria-label="Font Size"
        className="cursor-pointer pl-1 pr-2 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {FONT_SIZES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* increase font size */}
      <ToolbarButton
        onClick={() => {
          const currentIndex = FONT_SIZES.findIndex(
            (s) => s.value === fontSize,
          );
          const nextIndex = Math.min(currentIndex + 1, FONT_SIZES.length - 1);
          const nextFont = FONT_SIZES[nextIndex];
          if (nextFont) {
            handleFontSizeChange(nextFont.value);
          }
        }}
        label="Increase Font Size (Ctrl+Shift+>)"
      >
        <TextIncreaseIcon fontSize="small" />
      </ToolbarButton>
      {/* decrease font size */}
      <ToolbarButton
        onClick={() => {
          const currentIndex = FONT_SIZES.findIndex(
            (s) => s.value === fontSize,
          );
          const nextIndex = Math.max(currentIndex - 1, 0);
          const nextFont = FONT_SIZES[nextIndex];
          if (nextFont) {
            handleFontSizeChange(nextFont.value);
          }
        }}
        label="Decrease Font Size (Ctrl+Shift+>)"
      >
        <TextDecreaseIcon fontSize="small" />
      </ToolbarButton>

      <span id="separator" className="w-px h-5 bg-slate-300" />

      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          setIsBold(true);
        }}
        isActive={isBold}
        label="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          setIsItalics(true);
        }}
        isActive={isItalics}
        label="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          setIsUnderline(true);
        }}
        isActive={isUnderline}
        label="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          setIsStrikethrough(true);
        }}
        isActive={isStrikethrough}
        label="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <span id="separator" className="w-px h-5 bg-slate-300" />
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
          setBlockFormat('left');
        }}
        isActive={blockFormat === 'left'}
        label="Align Left"
      >
        <FormatAlignLeftIcon fontSize="inherit" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
          setBlockFormat('center');
        }}
        isActive={blockFormat === 'center'}
        label="Align Center"
      >
        <FormatAlignCenterIcon fontSize="inherit" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
          setBlockFormat('right');
        }}
        isActive={blockFormat === 'justify'}
        label="Justify Align"
      >
        <FormatAlignJustifyIcon fontSize="inherit" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
          setBlockFormat('right');
        }}
        isActive={blockFormat === 'right'}
        label="Align Right"
      >
        <FormatAlignRightIcon fontSize="inherit" />
      </ToolbarButton>
    </div>
  );
};

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
