import { $generateHtmlFromNodes } from '@lexical/html';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState, LexicalEditor } from 'lexical';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const CustomOnChangePlugin = ({ value, onChange }: Props) => {
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

  return <OnChangePlugin onChange={handleChange} />;
};

export default CustomOnChangePlugin;
