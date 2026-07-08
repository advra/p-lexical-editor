'use client';

import React from 'react';
// load plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import DebugTreeViewPlugin from './plugins/DebugTreeViewPlugin';

// load proper node types

import PuckTextIcon from './PuckTextIcon';
import { InitialHtmlContentPlugin } from './plugins/InitialHtmlContentPlugin';
import CustomOnChangePlugin from './plugins/CustomOnChangePlugin';
import {
  LexicalEditorRefProvider,
  useLexicalEditorRef,
} from './plugins/LexicalEditorRefContext';
import { LexicalToolbar } from './Toolbar';
import { InlineInputPlugin } from './plugins/InlineInputPlugin';

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
  const editorRef = useLexicalEditorRef();

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <PuckTextIcon />
        <span className="text-sm font-semibold capitalize">{name}</span>
      </div>
      <div className="editor-container border border-gray-200 rounded-md overflow-hidden">
        {/* Plugins */}
        <InitialHtmlContentPlugin html={value} />
        <CustomOnChangePlugin value={value} onChange={onChange} />
        <ListPlugin />
        <EditorRefPlugin editorRef={editorRef} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <InlineInputPlugin />
        {/* Toolbar */}
        {!readOnly && <LexicalToolbar />}
        {/* Editor */}
        <div className="editor-container relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input min-h-[100px] p-3 focus:outline-none"
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
      <DebugTreeViewPlugin />
    </div>
  );
}
