import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

type Props = {
  setHtmlOutput: (html: string) => void;
};

// Create a custom plugin to capture the state and convert to HTML
export const HtmlCapturePlugin = ({ setHtmlOutput }: Props) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editor.update(() => {
        const html = $generateHtmlFromNodes(editor, null);
        setHtmlOutput(html);
      });
    });
  }, [editor, setHtmlOutput]);

  return null;
};
