import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useEffect } from 'react';

/**
 * Plugin that sets the initial HTML content into the Lexical editor.
 * This runs once when the editor is first created.
 */
export const InitialHtmlContentPlugin = ({ html }: { html?: string }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
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
