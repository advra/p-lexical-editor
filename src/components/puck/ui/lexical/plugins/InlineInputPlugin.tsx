/*
    Used to listen to inline changes and stream back to lexical
    This plugin will live inside the `LexicalComposer` and listen for the `INLINE_INPUT_COMMAND`. 
    When it receives HTML from the inline editor, it will parse it and set it as the editor's 
    content.
*/
// src/components/puck/ui/lexical/plugins/InlineInputPlugin.tsx
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { useEffect } from 'react';

export const INLINE_INPUT_COMMAND = createCommand<string>(
  'INLINE_INPUT_COMMAND',
);

export const InlineInputPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INLINE_INPUT_COMMAND,
      (html) => {
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();
          root.clear();
          root.append(...nodes);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
};
