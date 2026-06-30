'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { EditorState } from 'lexical';
import { useCallback } from 'react';

/**
 * Plugin that emits HTML string whenever the editor content changes.
 * Uses Lexical's OnChangePlugin internally.
 */
export function HtmlChangePlugin({
  onChange,
}: {
  onChange: (html: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    },
    [editor, onChange],
  );

  return <OnChangePlugin onChange={handleChange} />;
}
