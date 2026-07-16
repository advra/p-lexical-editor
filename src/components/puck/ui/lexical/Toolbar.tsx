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
import { useCallback, useEffect, useRef, useState } from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cn } from '@/lib/utils/cn';

export const FONT_SIZES = [
  // { label: '8', value: '8pt' },
  // { label: '9', value: '9pt' },
  // { label: '10', value: '10pt' },
  // { label: '11', value: '11pt' },
  // { label: '12', value: '12pt' },
  // { label: '14', value: '14pt' },
  // { label: '16', value: '16pt' },
  // { label: '18', value: '18pt' },
  // { label: '20', value: '20pt' },
  // { label: '22', value: '22pt' },
  // { label: '24', value: '24pt' },
  // { label: '26', value: '26pt' },
  // { label: '28', value: '28pt' },
  // { label: '32', value: '32pt' },
  // { label: '36', value: '36pt' },
  // { label: '48', value: '48pt' },
  // { label: '60', value: '60pt' },
  // { label: 'Small Text', value: '0.875rem' },
  // { label: 'Paragraph', value: '1rem' },
  // { label: 'Lead Paragraph', value: '1.2rem' },
  // { label: 'Section Header', value: '1.25rem' },
  // { label: 'Subtitle', value: '2rem' },
  // { label: 'Main Title', value: '2.5rem' },
  { label: 'Small Text', value: '0.75rem' }, //9pt
  { label: 'Paragraph', value: '0.833rem' }, //10pt
  { label: 'Subtitle', value: '1rem' }, //12
  { label: 'Title', value: '1.167rem' }, //14
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
type props = {
  // used to override default styles
  dropdownClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  dividerClassName?: string;
};
export const LexicalToolbar = ({
  dropdownClassName,
  buttonClassName,
  activeButtonClassName,
  dividerClassName,
}: props) => {
  const [editor] = useLexicalComposerContext();
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT_FAMILIES[1].value);
  const [fontSize, setFontSize] = useState('12pt');
  const [blockFormat, setBlockFormat] = useState<string>('left');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalics, setIsItalics] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [isStrikethrough, setIsStrikethrough] = useState<boolean>(false);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedTextColor(color);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color });
        }
      });
      setShowColorPicker(false);
    },
    [editor],
  );

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

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          // text color
          const color = $getSelectionStyleValueForProperty(
            selection,
            'color',
            '',
          );
        }
      });
    });
    return () => unregister();
  }, [editor]);

  return (
    <div className="lexical-toolbar flex flex-wrap gap-1 items-center">
      {/* Font Family */}
      <select
        value={fontFamily}
        onChange={(e) => handleFontFamilyChange(e.target.value)}
        title="Font Family"
        aria-label="Font Family"
        className={cn(
          dropdownClassName,
          'cursor-pointer px-1 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400',
        )}
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
        className={cn(
          dropdownClassName,
          'cursor-pointer pl-1 pr-2 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400',
        )}
      >
        {FONT_SIZES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* increase font size */}
      <ToolbarButton
        className={buttonClassName}
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
        className={buttonClassName}
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

      <span
        id="separator"
        className={cn(dividerClassName, 'w-px h-7 bg-slate-300')}
      />

      {/* Text Color Picker */}
      <div className="relative flex items-center" ref={colorPickerRef}>
        <button
          type="button"
          onClick={() => handleColorChange(selectedTextColor || '#000000')}
          title="Apply Text Color"
          aria-label="Apply Text Color"
          className="cursor-pointer w-7 h-7 text-sm rounded-l border border-r-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 flex items-center justify-center"
        >
          <span className="relative -top-1/7 left-1/2 text-gray-500">A</span>
          <span
            className="relative top-2/7 w-8 h-[5px]"
            style={{
              backgroundColor: selectedTextColor || 'transparent',
              ...(selectedTextColor === '#FFFFFF'
                ? { borderColor: '#9CA3AF' }
                : {}),
            }}
          />
        </button>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Pick Text Color"
          aria-label="Pick Text Color"
          className="cursor-pointer w-7 h-7 text-sm rounded-r border border-l-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 flex items-center justify-center"
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded shadow-lg p-2 w-44">
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value || 'default'}
                  type="button"
                  onClick={() => handleColorChange(color.value)}
                  title={color.label}
                  aria-label={color.label}
                  className={`cursor-pointer w-8 h-8 rounded border flex items-center justify-center text-xs ${
                    selectedTextColor === color.value
                      ? 'border-blue-500 ring-1 ring-blue-400'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{
                    backgroundColor: color.value || 'white',
                    ...(color.value === '#FFFFFF' || color.value === ''
                      ? { borderColor: '#D1D5DB' }
                      : {}),
                  }}
                >
                  {color.value === '' && (
                    <span className="text-gray-400 text-xs leading-none line-through">
                      A
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <span
        id="separator"
        className={cn(dividerClassName, 'w-px h-7 bg-slate-300')}
      />

      <ToolbarButton
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          setIsStrikethrough(true);
        }}
        isActive={isStrikethrough}
        label="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <span
        id="separator"
        className={cn(dividerClassName, 'w-px h-7 bg-slate-300')}
      />
      <ToolbarButton
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
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
  className,
  activeButtonClassName,
  onClick,
  isActive,
  label,
  children,
}: Readonly<{
  className?: string;
  activeButtonClassName?: string;
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
}>) {
  const activeColorStyle =
    isActive && activeButtonClassName
      ? activeButtonClassName
      : 'bg-blue-100 text-blue-700';
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        className,
        `cursor-pointer px-2 py-1 text-sm rounded ${
          isActive ? activeColorStyle : 'text-gray-700 hover:bg-gray-100'
        }`,
      )}
    >
      {children}
    </button>
  );
}
