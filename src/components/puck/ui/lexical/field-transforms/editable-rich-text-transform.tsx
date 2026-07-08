// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

// TODO From input notify puck of changes
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  BaseField,
  Field,
  FieldTransformFnParams,
  registerOverlayPortal,
  setDeep,
  usePuck,
} from '@puckeditor/core';
import {
  $addUpdateTag,
  $getRoot,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalEditorRef } from '../plugins/LexicalEditorRefContext';

type Props = {
  transformProps: FieldTransformFnParams<
    | ({
        type: string;
      } & BaseField)
    | Field<any, {}>
  >;
};

// export const INLINE_INPUT_COMMAND = createCommand('INLINE_INPUT_COMMAND');

export const EditableRichTextTransform = ({ transformProps }: Props) => {
  const { value, isReadOnly, propName, propPath, componentId } = transformProps;
  const { dispatch, appState, getItemById, getSelectorForId } = usePuck();
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useLexicalEditorRef();
  const isInlineFocused = useRef(false);

  useEffect(() => {
    if (ref.current) {
      registerOverlayPortal(ref.current);
    }
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    return editorRef.current.registerCommand(
      CLICK_COMMAND,
      (payload) => {
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editorRef.current]);

  // Sync external value changes to the DOM only when the inline editor is NOT focused
  // This prevents overwriting user edits while typing in the inline div
  useEffect(() => {
    if (ref.current && !isInlineFocused.current) {
      ref.current.innerHTML = value ?? '';
    }
  }, [value]);

  // sync changes back to puck
  const handleClickInlinePreview = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isReadOnly) return;

      e.stopPropagation();
      if (ref.current) {
        ref.current.focus();
      }
    },
    [isReadOnly, propName, dispatch],
  );

  const handleFocus = useCallback(() => {
    isInlineFocused.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isInlineFocused.current = false;
  }, []);

  const handleInput = useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      if (isReadOnly) return;
      const html = e.currentTarget.outerHTML;

      // Push the HTML into the Lexical editor via the shared editor ref
      const currEditor = editorRef.current;
      if (currEditor) {
        currEditor.update(() => {
          // Prevent the browser from stealing focus
          $addUpdateTag(SKIP_DOM_SELECTION_TAG);

          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(currEditor, dom);
          const root = $getRoot();
          root.clear();
          root.append(...nodes);
        });
      }
    },
    [isReadOnly, editorRef],
  );

  return (
    <div className="relative">
      <div
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        ref={ref}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClickInlinePreview}
        className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1 mr-5"
      />
      <div className="absolute top-0 -right-1">
        <DragIndicatorIcon className="text-gray-500" />
      </div>
    </div>
  );
};

export default EditableRichTextTransform;
