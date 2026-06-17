'use client';

import React, { useMemo, useState } from 'react';
// load plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $getRoot,
  EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
} from 'lexical';

// load proper node types
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import PuckTextIcon from './PuckTextIcon';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

type Props = {
  field: any;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  id?: string;
  name: string;
  children?: React.ReactNode;
};

/**
 * Plugin that sets the initial HTML content into the Lexical editor.
 * This runs once when the editor is first created.
 */
const InitialHtmlContentPlugin = ({ html }: { html: string }) => {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (!html) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
};

/**
 * A Lexical-based rich text editor that replaces Puck's default TipTap richtext field.
 *
 * This component is used as a field type override for the "richtext" field type in Puck.
 * It provides a WYSIWYG editing experience using Lexical (by Meta) instead of TipTap.
 *
 * The editor stores content as HTML strings, which is compatible with Puck's data model.
 */
export function LexicalRichtextField({
  field,
  value,
  onChange,
  readOnly,
  id,
  name,
  children,
}: Readonly<Props>) {
  const initialConfig = useMemo(
    () => ({
      namespace: 'PuckLexical',
      editable: !readOnly,
      onError: (error: Error) => {
        console.error('Lexical error:', error);
      },
      nodes: [ListNode, ListItemNode, HeadingNode],
    }),
    [readOnly],
  );

  const handleChange = (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => {
    editor.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange(htmlString);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <PuckTextIcon />
        <span className="text-sm font-semibold capitalize">{name}</span>
      </div>
      <div className="lexical-richtext-field border border-gray-200 rounded-md overflow-hidden">
        <LexicalComposer initialConfig={initialConfig}>
          {/* Set initial HTML content */}
          <InitialHtmlContentPlugin html={value} />
          {/* Toolbar */}
          {!readOnly && <LexicalToolbar />}
          {/* Editor */}
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="lexical-editor min-h-[100px] p-3 focus:outline-none"
                  style={{ outline: 'none' }}
                />
              }
              placeholder={
                <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                  Enter text...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          {/* Plugins */}
          <OnChangePlugin onChange={handleChange} />
          <ListPlugin />
        </LexicalComposer>
      </div>
    </div>
  );
}

/**
 * Toolbar component for the Lexical editor that provides formatting button options
 */
function LexicalToolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="lexical-toolbar flex flex-wrap gap-1 border-b border-gray-200 p-2 bg-gray-50">
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
}

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
      className={`px-2 py-1 text-sm rounded ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
