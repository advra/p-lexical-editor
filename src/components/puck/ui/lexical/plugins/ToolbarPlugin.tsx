'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';

type ToolbarState = {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

/**
 * Toolbar plugin for the Lexical rich text editor.
 *
 * Provides formatting buttons (bold, italic, underline, etc.),
 * alignment controls, undo/redo, and list insertion.
 *
 * Must be used inside a LexicalComposer.
 */
export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    canUndo: false,
    canRedo: false,
  });

  // Update toolbar state based on current selection
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setToolbarState((prev) => ({
        ...prev,
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isUnderline: selection.hasFormat('underline'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isCode: selection.hasFormat('code'),
      }));
    }
  }, []);

  // Listen for selection changes
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  // Listen for undo/redo capability changes
  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setToolbarState((prev) => ({ ...prev, canUndo: payload }));
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setToolbarState((prev) => ({ ...prev, canRedo: payload }));
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return (
    <div className="lexical-toolbar flex flex-wrap items-center gap-0.5 border-b border-gray-200 p-1.5 bg-gray-50">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!toolbarState.canUndo}
        label="Undo"
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!toolbarState.canRedo}
        label="Redo"
        title="Redo (Ctrl+Y)"
      >
        <RedoIcon />
      </ToolbarButton>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        isActive={toolbarState.isBold}
        label="Bold"
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        isActive={toolbarState.isItalic}
        label="Italic"
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        isActive={toolbarState.isUnderline}
        label="Underline"
        title="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        isActive={toolbarState.isStrikethrough}
        label="Strikethrough"
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        isActive={toolbarState.isCode}
        label="Code"
        title="Inline code"
      >
        <code>{'<>'}</code>
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        label="Align Left"
        title="Align left"
      >
        <AlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        label="Align Center"
        title="Align center"
      >
        <AlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        label="Align Right"
        title="Align right"
      >
        <AlignRightIcon />
      </ToolbarButton>

      <Divider />

      {/* List buttons */}
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand('INSERT_UNORDERED_LIST' as any, undefined);
        }}
        label="Bullet List"
        title="Bullet list"
      >
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          editor.dispatchCommand('INSERT_ORDERED_LIST' as any, undefined);
        }}
        label="Ordered List"
        title="Ordered list"
      >
        <OrderedListIcon />
      </ToolbarButton>
    </div>
  );
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  label,
  title,
  children,
}: Readonly<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  title?: string;
  children: React.ReactNode;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      className={`px-1.5 py-1 text-sm rounded transition-colors ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <span className="w-px h-5 bg-gray-300 mx-0.5" />;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function UndoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}
