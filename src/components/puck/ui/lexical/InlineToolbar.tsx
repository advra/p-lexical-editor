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
import AddIcon from '@mui/icons-material/Add';
import { cn } from '@/lib/utils/cn';
import { FONT_SIZES, DEFAULT_FONT_FAMILIES, TEXT_COLORS } from './Toolbar';
import { getComputedFontSizePx } from './utils';
import { usePuck } from '@puckeditor/core';
import InsertComponentToolbarPopupMenu from './menu/InsertComponentToolbarPopupMenu';

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
 *
 * @param savedRange - Optional saved Range to use instead of the current selection.
 *   This is needed because clicking a toolbar button steals focus from the inline
 *   editor, which clears the text selection. The saved range is captured on mousedown
 *   before focus is lost.
 */
function applyInlineStyle(
  command: 'foreColor' | 'backColor' | 'hiliteColor' | 'fontSize' | 'fontName',
  value: string,
  savedRange?: Range | null,
) {
  if (command === 'fontName') {
    document.execCommand(command, false, value);
    return;
  } else if (
    command === 'foreColor' ||
    command === 'backColor' ||
    command === 'hiliteColor'
  ) {
    // Enable CSS styling via execCommand
    // required for foreColor, backColor and hiliteColor
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
  }

  // For font-size, execCommand('fontSize') only accepts integers 1-7.
  // Use DOM Range APIs to apply arbitrary CSS font-size values while
  // preserving existing formatting (bold, italic, underline, etc.).
  if (command === 'fontSize') {
    // Use the saved range if provided (captured on mousedown before focus was stolen),
    // otherwise fall back to the current selection.
    let range: Range | null = null;
    let isCollapsed = true;

    if (savedRange) {
      range = savedRange.cloneRange();
      isCollapsed = savedRange.collapsed;
    } else {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      range = sel.getRangeAt(0);
      isCollapsed = sel.isCollapsed;
    }

    if (isCollapsed) {
      // Collapsed cursor: insert a zero-width space with the style
      const span = document.createElement('span');
      span.style.fontSize = value;
      span.textContent = '\u200B';
      range.insertNode(span);

      // Place cursor inside the span (after the zero-width space text node)
      // so that walking up from the cursor finds the styled span.
      // This is important for subsequent increase/decrease operations
      // which read the current font size from the DOM selection.
      const zwspNode = span.firstChild;
      if (zwspNode) {
        range.setStartAfter(zwspNode);
        range.collapse(true);
      } else {
        range.setStartAfter(span);
        range.collapse(true);
      }
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      // Extract the selected content (preserving its DOM structure)
      const fragment = range.extractContents();

      // Strip any existing font-size styles from all elements in the fragment
      // so the new font-size fully overrides previous ones.
      // This handles cases like "Hello" where each letter has a different size
      // and the user wants to apply a single size to the entire selection.
      const walker = document.createTreeWalker(
        fragment,
        NodeFilter.SHOW_ELEMENT,
        null,
      );
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const el = node as HTMLElement;
        el.style.fontSize = '';
        // Also remove empty style attributes
        if (el.getAttribute('style') === '') {
          el.removeAttribute('style');
        }
      }

      // Wrap the extracted fragment in a span with the new font-size
      const span = document.createElement('span');
      span.style.fontSize = value;
      span.appendChild(fragment);

      // Insert the span at the original range position
      range.insertNode(span);

      // Re-select the contents of the span so the user can continue editing
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
  }
}

/**
 * Read the current font size directly from the DOM selection.
 * This is used by the increase/decrease buttons to avoid relying on
 * potentially stale React state.
 */
function getCurrentFontSizeFromDOM(): string {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return '';

  const node = sel.focusNode;
  if (!node) return '';

  // Walk up from the focus node to find the nearest element with inline styles
  let targetEl: HTMLElement | null = null;
  let current: Node | null = node;
  const container =
    document.activeElement instanceof HTMLElement &&
    document.activeElement.isContentEditable
      ? document.activeElement
      : null;

  while (current && current !== container) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      if (
        el.hasAttribute('style') ||
        el.tagName === 'FONT' ||
        el.hasAttribute('face') ||
        el.hasAttribute('color')
      ) {
        targetEl = el;
        break;
      }
    }
    current = current.parentNode;
  }

  if (targetEl) {
    const computed = getComputedStyle(targetEl);
    const computedPx = Number.parseFloat(computed.fontSize);
    const matched = FONT_SIZES.find((opt) => {
      const optPx = getComputedFontSizePx(opt.value);
      return Math.abs(optPx - computedPx) < 0.5;
    });
    return matched ? matched.value : computed.fontSize;
  }

  // Fall back to computed style on the parent element
  const el: HTMLElement | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;
  if (el) {
    const computed = getComputedStyle(el);
    const computedPx = Number.parseFloat(computed.fontSize);
    const matched = FONT_SIZES.find((opt) => {
      const optPx = getComputedFontSizePx(opt.value);
      return Math.abs(optPx - computedPx) < 0.5;
    });
    return matched ? matched.value : computed.fontSize;
  }

  return '';
}

/** Apply alignment to the parent block of the native selection */
function applyInlineAlignment(align: string, container: HTMLElement) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;

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
  const [showInsertMenu, setShowInsertMenu] = useState<boolean>(false);
  const insertMenuRef = useRef<HTMLDivElement>(null);
  const insertButtonRef = useRef<HTMLButtonElement>(null);

  const inlineEditorRef = useRef<HTMLElement | null>(null);
  // Save the selection range on mousedown (before the button steals focus)
  // so we can restore it when applying styles to highlighted text.
  const savedRangeRef = useRef<Range | null>(null);

  // Puck insert component API
  const puck = usePuck();
  const puckConfig = puck.config;
  const puckComponents = puckConfig.components || {};
  const puckComponentKeys = Object.keys(puckComponents);

  const ROOT_ZONE = 'root:default-zone';

  const handleInsertComponent = useCallback(
    (componentType: string, position: 'above' | 'below') => {
      const { appState, dispatch } = puck;
      const currentSelector = appState.ui.itemSelector;

      if (!currentSelector) {
        // No item selected, insert at the end of the root zone
        const content = appState.data.content || [];
        const destinationIndex = position === 'below' ? content.length : 0;
        dispatch({
          type: 'insert',
          componentType,
          destinationZone: ROOT_ZONE,
          destinationIndex,
          recordHistory: true,
        });
      } else {
        const destinationIndex =
          position === 'above'
            ? currentSelector.index
            : currentSelector.index + 1;
        dispatch({
          type: 'insert',
          componentType,
          destinationZone: currentSelector.zone || ROOT_ZONE,
          destinationIndex,
          recordHistory: true,
        });
      }
      setShowInsertMenu(false);
    },
    [puck],
  );

  // Capture the inline editor on mousedown, before focus is stolen by the button
  const handleToolbarMouseDown = useCallback(() => {
    const el = document.activeElement;
    if (
      el instanceof HTMLElement &&
      el.isContentEditable &&
      el.classList.contains('lexical-inline-preview')
    ) {
      inlineEditorRef.current = el;
      // Save the current selection range before focus is stolen by the button
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
      return;
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
          inlineEditorRef.current = node;
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
          return;
        }
        node = node.parentNode;
      }
    }
    inlineEditorRef.current = null;
    savedRangeRef.current = null;
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
    applyInlineStyle('foreColor', color, savedRangeRef.current);
    savedRangeRef.current = null;
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
    applyInlineStyle('fontSize', size, savedRangeRef.current);
    savedRangeRef.current = null;
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
    applyInlineStyle('fontName', font, savedRangeRef.current);
    savedRangeRef.current = null;
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
      // Update the selected color state so the "A" button indicator shows the right color
      setSelectedTextColor(color);
      // Check inlineEditorRef.current first — it was captured on mousedown
      // before the button stole focus from the inline editor.
      // Fall back to isInlineEditorActive() as a secondary check.
      if (inlineEditorRef.current || isInlineEditorActive()) {
        handleInlineColorChange(color);
        setShowColorPicker(false);
        return;
      }
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
      // Check inlineEditorRef.current first (captured on mousedown before focus was stolen)
      if (inlineEditorRef.current || isInlineEditorActive()) {
        handleInlineFontSizeChange(size);
        setFontSize(size);
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
      // Check inlineEditorRef.current first (captured on mousedown before focus was stolen)
      if (inlineEditorRef.current || isInlineEditorActive()) {
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

      // Skip state updates while a style is being applied (e.g., font size change
      // from increase/decrease buttons). The inline editor's DOM is in flux and
      // reading it now would give stale values that override the intended state.
      const inlineEditor = inlineEditorRef.current;
      if (inlineEditor?.dataset.applyingStyle === 'true') return;

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
        // or a <font> tag (created by execCommand('fontName') / execCommand('foreColor'))
        let targetEl: HTMLElement | null = null;
        let current: Node | null = node;
        const container = inlineEditorRef.current;

        while (current && current !== container) {
          if (current.nodeType === Node.ELEMENT_NODE) {
            const el = current as HTMLElement;
            // Check for inline style (span) or font tag attributes (font)
            if (
              el.hasAttribute('style') ||
              el.tagName === 'FONT' ||
              el.hasAttribute('face') ||
              el.hasAttribute('color')
            ) {
              targetEl = el;
              break;
            }
          }
          current = current.parentNode;
        }

        if (targetEl) {
          // Read inline styles directly from the styled span or font tag

          // detect font family (from inline style or font[face] attribute)
          const fontFamilyFromStyle = targetEl.style.fontFamily;
          const fontFamilyFromAttr = targetEl.getAttribute('face');
          setFontFamily(
            fontFamilyFromStyle ||
              fontFamilyFromAttr ||
              DEFAULT_FONT_FAMILIES[0].value,
          );
          // detect font size
          const computed = getComputedStyle(targetEl);
          const computedPx = Number.parseFloat(computed.fontSize);
          const matched = FONT_SIZES.find((opt) => {
            const optPx = getComputedFontSizePx(opt.value);
            return Math.abs(optPx - computedPx) < 0.5; // within 0.5px tolerance
          });
          setFontSize(matched ? matched.value : computed.fontSize);
          // detect font color (from inline style or font[color] attribute)
          const colorFromStyle = targetEl.style.color;
          const colorFromAttr = targetEl.getAttribute('color');
          setSelectedTextColor(colorFromStyle || colorFromAttr || '#000000');
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

  // Prevent Ctrl+ shortcuts (B, I, U, etc.) from propagating to Puck's
  // document-level keyboard handlers when the toolbar has focus
  const handleToolbarKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl) {
      switch (e.key.toLowerCase()) {
        case 'b':
        case 'i':
        case 'u':
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    }
  }, []);

  return (
    <div
      className="lexical-toolbar flex flex-wrap gap-1 items-center"
      onMouseDown={handleToolbarMouseDown}
      onKeyDown={handleToolbarKeyDown}
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
          // Read the current font size directly from the DOM selection
          // to avoid issues with stale React state
          const currentSize = getCurrentFontSizeFromDOM();
          const currentIndex = FONT_SIZES.findIndex(
            (s) => s.value === currentSize,
          );
          const nextIndex = Math.min(
            currentIndex >= 0 ? currentIndex + 1 : 0,
            FONT_SIZES.length - 1,
          );
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
          // Read the current font size directly from the DOM selection
          // to avoid issues with stale React state
          const currentSize = getCurrentFontSizeFromDOM();
          const currentIndex = FONT_SIZES.findIndex(
            (s) => s.value === currentSize,
          );
          const nextIndex = Math.max(
            currentIndex >= 0 ? currentIndex - 1 : 0,
            0,
          );
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
                  onClick={() => {
                    // Apply the color immediately and close the picker
                    handleColorChange(color.value);
                  }}
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
          handleInlineAlignment('right');
          setBlockFormat('right');
        }}
        isActive={blockFormat === 'right'}
        label="Align Right"
      >
        <FormatAlignRightIcon fontSize="inherit" />
      </ToolbarButton>

      <span
        id="separator"
        className={cn(dividerClassName, 'w-px h-7 bg-slate-300')}
      />

      {/* Insert Block */}
      <div className="relative flex items-center" ref={insertMenuRef}>
        <button
          type="button"
          ref={insertButtonRef}
          onClick={() => setShowInsertMenu(!showInsertMenu)}
          title="Insert Block"
          aria-label="Insert Block"
          className={cn(
            buttonClassName,
            'cursor-pointer px-2 py-1 text-sm rounded text-gray-700 hover:bg-gray-100 flex items-center gap-1',
          )}
        >
          <AddIcon fontSize="small" />
          <span className="text-xs">Insert</span>
          {/* <KeyboardArrowDownIcon fontSize="small" /> */}
        </button>
        {showInsertMenu && (
          <InsertComponentToolbarPopupMenu
            handleInsertComponent={handleInsertComponent}
            triggerRef={insertButtonRef}
            onClose={() => setShowInsertMenu(false)}
          />
        )}
      </div>
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
