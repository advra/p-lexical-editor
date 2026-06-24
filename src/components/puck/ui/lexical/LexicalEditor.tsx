'use client';

import React, { useEffect, useMemo, useState } from 'react';
// load plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import {
  $getRoot,
  EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
} from 'lexical';

// load proper node types

import PuckTextIcon from './PuckTextIcon';
import { InitialHtmlContentPlugin } from './plugins/InitialHtmlContentPlugin';
import CustomOnChangePlugin from './plugins/CustomOnChangePlugin';

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
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <PuckTextIcon />
        <span className="text-sm font-semibold capitalize">{name}</span>
      </div>
      <div className="lexical-richtext-field border border-gray-200 rounded-md overflow-hidden">
        {/* Plugins */}
        <InitialHtmlContentPlugin html={value} />
        <CustomOnChangePlugin value={value} onChange={onChange} />
        <ListPlugin />
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
      </div>
    </div>
  );
}

/**
 * Toolbar component for the Lexical editor that provides formatting button options
 */
export const LexicalToolbar = () => {
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
