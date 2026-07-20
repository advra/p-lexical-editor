'use client';

import { $patchStyleText } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
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
import { FONT_SIZES, DEFAULT_FONT_FAMILIES, TEXT_COLORS } from './Toolbar';
import { getComputedFontSizePx } from './utils';

/**
 * InlineToolbar - A toolbar for Puck's ActionBar that operates on the
 * currently active editor context.
 *
 * - If the user is focused in an inline contentEditable div (the
 *   EditableInlineRichTextTransform), it uses native DOM APIs
 *   (document.execCommand, Range.surroundContents) to format the text.
 * - Otherwise, it falls back to Lexical commands via useLexicalComposerContext().
 *
 * Changes made to the inline contentEditable div automatically sync to the
 * Lexical editor via the existing onInput handler in EditableInlineRichTextTransform.
 */
type Props = {
  // used to override default styles
  dropdownClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  dividerClassName?: string;
};

/** Check if the currently focused element is an inline contentEditable div */
function isInlineEditorActive(): boolean {
  const el = document.activeElement;
  if (
    el instanceof HTMLElement &&
    el.isContentEditable &&
    el.classList.contains('lexical-inline-preview')
  ) {
    return true;
  }

  // Fallback: check if selection is inside an inline editor
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    let node = sel.anchorNode;
    while (node) {
      if (
        node instanceof HTMLElement &&
        node.isContentEditable &&
        node.classList.contains('lexical-inline-preview')
      ) {
        return true;
      }
      node = node.parentNode;
    }
  }

  return false;
}

/** Trigger input event on the inline editor to sync changes to Lexical */
function triggerInlineSync(editor: HTMLElement) {
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Apply a style to the native selection using execCommand with styleWithCSS.
 * This is the standard browser API for inline styling and handles cursor
 * position, text selection, and nested elements correctly.
 *
 * Note: execCommand('fontSize') only accepts integers 1-7 (HTML font sizes),
 * not CSS values like rem/pt. So for font-size we use insertHTML instead.
 */
function applyInlineStyle(styleProp: string, value: string) {
  // Enable CSS styling via execCommand
  document.execCommand('styleWithCSS', false, 'true');

  // Map our style properties to execCommand commands
  const commandMap: Record<string, string> = {
    fontFamily: 'fontName',
    color: 'foreColor',
  };

  const command = commandMap[styleProp];
  if (command) {
    document.execCommand(command, false, value);
    return;
  }

  // For font-size, execCommand('fontSize') only accepts integers 1-7.
  // Use insertHTML to apply arbitrary CSS font-size values.
  if (styleProp === 'fontSize') {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;

    if (sel.isCollapsed) {
      // Collapsed cursor: insert a zero-width space with the style
      document.execCommand(
        'insertHTML',
        false,
        `<span style="font-size: ${value}">\u200B</span>`,
      );
    } else {
      // Text selected: wrap selection in a styled span
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#fontsize
      document.execCommand('fontSize', false, value);
    }
  }
}

/** Apply alignment to the parent block of the native selection */
function applyInlineAlignment(align: string, container: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const node = sel.anchorNode;
  if (!node) return;

  let el: HTMLElement | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;
  while (el && el !== container && getComputedStyle(el).display !== 'block') {
    el = el.parentElement;
  }
  if (el && el !== container) {
    el.style.textAlign = align;
  } else {
    // Wrap in a div with alignment
    const range = sel.getRangeAt(0);
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = align;
    try {
      range.surroundContents(wrapper);
    } catch {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }
  }
}

export const InlineToolbar = ({
  dropdownClassName,
  buttonClassName,
  activeButtonClassName,
  dividerClassName,
}: Props) => {
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

  const inlineEditorRef = useRef<HTMLElement | null>(null);

  // Capture the inline editor on mousedown, before focus is stolen by the button
  const handleToolbarMouseDown = useCallback(() => {
    const el = document.activeElement;
    if (
      el instanceof HTMLElement &&
      el.isContentEditable &&
      el.classList.contains('lexical-inline-preview')
    ) {
      inlineEditorRef.current = el;
    } else {
      inlineEditorRef.current = null;
    }
  }, []);

  // --- Inline editor helpers (native DOM) ---

  const execInlineCommand = useCallback(
    (command: 'bold' | 'underline' | 'italic' | 'strikethrough') => {
      const inlineEditor = inlineEditorRef.current;
      if (!inlineEditor) return;
      inlineEditor.focus();
      document.execCommand(command);
      triggerInlineSync(inlineEditor);
    },
    [],
  );

  const handleInlineColorChange = useCallback((color: string) => {
    const inlineEditor = inlineEditorRef.current;
    if (!inlineEditor) return;
    if (inlineEditor.dataset.applyingStyle === 'true') return;
    inlineEditor.dataset.applyingStyle = 'true';
    inlineEditor.focus();
    applyInlineStyle('color', color);
    inlineEditor.dataset.skipSync = 'true';
    triggerInlineSync(inlineEditor);
    setTimeout(() => {
      delete inlineEditor.dataset.applyingStyle;
    }, 100);
  }, []);

  const handleInlineFontSizeChange = useCallback((size: string) => {
    // Find the inline editor from the selection if inlineEditorRef is null
    let inlineEditor = inlineEditorRef.current;
    if (!inlineEditor) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node = sel.anchorNode;
        while (node) {
          if (
            node instanceof HTMLElement &&
            node.isContentEditable &&
            node.classList.contains('lexical-inline-preview')
          ) {
            inlineEditor = node;
            inlineEditorRef.current = node;
            break;
          }
          node = node.parentNode;
        }
      }
    }
    if (!inlineEditor) return;
    if (inlineEditor.dataset.applyingStyle === 'true') return;
    inlineEditor.dataset.applyingStyle = 'true';
    inlineEditor.focus();
    applyInlineStyle('fontSize', size);
    inlineEditor.dataset.skipSync = 'true';
    triggerInlineSync(inlineEditor);
    setTimeout(() => {
      delete inlineEditor.dataset.applyingStyle;
    }, 100);
  }, []);

  const handleInlineFontFamilyChange = useCallback((font: string) => {
    const inlineEditor = inlineEditorRef.current;
    if (!inlineEditor) return;
    if (inlineEditor.dataset.applyingStyle === 'true') return;
    inlineEditor.dataset.applyingStyle = 'true';
    inlineEditor.focus();
    applyInlineStyle('fontFamily', font);
    inlineEditor.dataset.skipSync = 'true';
    triggerInlineSync(inlineEditor);
    setTimeout(() => {
      delete inlineEditor.dataset.applyingStyle;
    }, 100);
  }, []);

  const handleInlineAlignment = useCallback((align: string) => {
    const inlineEditor = inlineEditorRef.current;
    if (!inlineEditor) return;
    inlineEditor.focus();
    applyInlineAlignment(align, inlineEditor);
    triggerInlineSync(inlineEditor);
  }, []);

  // --- Lexical editor helpers ---

  const handleColorChange = useCallback(
    (color: string) => {
      // Use isInlineEditorActive() which checks both activeElement AND selection
      // This works even when the dropdown/button has focus because the selection
      // is still inside the inline editor
      if (isInlineEditorActive()) {
        handleInlineColorChange(color);
        setShowColorPicker(false);
        return;
      }
      setSelectedTextColor(color);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color });
        }
      });
      setShowColorPicker(false);
    },
    [editor, handleInlineColorChange],
  );

  const handleFontSizeChange = useCallback(
    (size: string) => {
      // Use isInlineEditorActive() which checks both activeElement AND selection
      // This works even when the dropdown/button has focus because the selection
      // is still inside the inline editor
      if (isInlineEditorActive()) {
        handleInlineFontSizeChange(size);
        return;
      }
      setFontSize(size);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'font-size': size });
        }
      });
    },
    [editor, handleInlineFontSizeChange],
  );

  const handleFontFamilyChange = useCallback(
    (font: string) => {
      // Use isInlineEditorActive() which checks both activeElement AND selection
      // This works even when the dropdown/button has focus because the selection
      // is still inside the inline editor
      if (isInlineEditorActive()) {
        handleInlineFontFamilyChange(font);
        return;
      }
      setFontFamily(font);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'font-family': font });
        }
      });
    },
    [editor, handleInlineFontFamilyChange],
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

  // Track inline editor selection changes for active state updates
  useEffect(() => {
    const updateInlineStates = () => {
      if (!isInlineEditorActive()) return;

      const sel = window.getSelection();
      if (!sel?.rangeCount) return;

      // Also capture the inline editor ref here as a fallback
      if (!inlineEditorRef.current) {
        const activeEl = document.activeElement;
        if (
          activeEl instanceof HTMLElement &&
          activeEl.isContentEditable &&
          activeEl.classList.contains('lexical-inline-preview')
        ) {
          inlineEditorRef.current = activeEl;
        }
      }

      setIsBold(document.queryCommandState('bold'));
      setIsItalics(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrikethrough(document.queryCommandState('strikeThrough'));

      // Use focusNode instead of anchorNode for more intuitive behavior
      const node = sel.focusNode;
      if (node) {
        // Walk up from the focus node to find the nearest element with inline styles
        let targetEl: HTMLElement | null = null;
        let current: Node | null = node;
        const container = inlineEditorRef.current;

        while (current && current !== container) {
          if (current.nodeType === Node.ELEMENT_NODE) {
            const el = current as HTMLElement;
            if (el.hasAttribute('style')) {
              targetEl = el;
              break;
            }
          }
          current = current.parentNode;
        }

        if (targetEl) {
          // Read inline styles directly from the styled span

          // detect font
          setFontFamily(
            targetEl.style.fontFamily || DEFAULT_FONT_FAMILIES[0].value,
          );
          // detect font size
          const computed = getComputedStyle(targetEl);
          const computedPx = Number.parseFloat(computed.fontSize);
          const matched = FONT_SIZES.find((opt) => {
            const optPx = getComputedFontSizePx(opt.value);
            return Math.abs(optPx - computedPx) < 0.5; // within 0.5px tolerance
          });
          setFontSize(matched ? matched.value : computed.fontSize);
          // detect font color
          setSelectedTextColor(targetEl.style.color || '#000000');
        } else {
          // Fall back to computed style on the parent element
          const el: HTMLElement | null =
            node.nodeType === Node.ELEMENT_NODE
              ? (node as HTMLElement)
              : node.parentElement;
          if (el) {
            const computed = getComputedStyle(el);
            setFontFamily(
              computed.fontFamily || DEFAULT_FONT_FAMILIES[0].value,
            );
            setFontSize(computed.fontSize || '12pt');
            setSelectedTextColor(computed.color || '#000000');
          }
        }

        // Block format detection (walk up to find block-level element)
        let block: HTMLElement | null =
          targetEl ||
          (node.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement)
            : node.parentElement);
        while (
          block &&
          container &&
          block !== container &&
          getComputedStyle(block).display !== 'block'
        ) {
          block = block.parentElement;
        }
        if (block && container && block !== container) {
          setBlockFormat(block.style.textAlign || 'left');
        }
      }
    };

    // imediately register
    updateInlineStates();
    document.addEventListener('selectionchange', updateInlineStates);
    document.addEventListener('mouseup', updateInlineStates);
    document.addEventListener('click', updateInlineStates);
    return () => {
      document.removeEventListener('selectionchange', updateInlineStates);
      document.removeEventListener('mouseup', updateInlineStates);
      document.removeEventListener('click', updateInlineStates);
    };
  }, []);

  return (
    <div
      className="lexical-toolbar flex flex-wrap gap-1 items-center"
      onMouseDown={handleToolbarMouseDown}
    >
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
        onClick={() => execInlineCommand('bold')}
        isActive={isBold}
        label="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
        onClick={() => execInlineCommand('italic')}
        isActive={isItalics}
        label="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
        onClick={() => execInlineCommand('underline')}
        isActive={isUnderline}
        label="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        className={buttonClassName}
        activeButtonClassName={activeButtonClassName}
        onClick={() => execInlineCommand('strikethrough')}
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
          handleInlineAlignment('left');
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
          handleInlineAlignment('center');
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
          handleInlineAlignment('justify');
          setBlockFormat('justify');
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
          handleInlineAlignment('right');
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
