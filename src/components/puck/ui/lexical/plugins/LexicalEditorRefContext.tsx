'use client';
import React, { createContext, useContext, useRef } from 'react';
import { LexicalEditor } from 'lexical';

type LexicalEditorRef = React.MutableRefObject<LexicalEditor | null>;

const LexicalEditorRefContext = createContext<LexicalEditorRef | null>(null);

export function LexicalEditorRefProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const editorRef = useRef<LexicalEditor | null>(null);
  return (
    <LexicalEditorRefContext.Provider value={editorRef}>
      {children}
    </LexicalEditorRefContext.Provider>
  );
}

export function useLexicalEditorRef() {
  const ctx = useContext(LexicalEditorRefContext);
  if (!ctx)
    throw new Error(
      'useLexicalEditorRef must be used within LexicalEditorRefProvider',
    );
  return ctx;
}
