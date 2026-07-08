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
  $createParagraphNode,
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $getRoot,
  $getSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  INPUT_COMMAND,
  ParagraphNode,
  PASTE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalEditorRef } from '../plugins/LexicalEditorRefContext';
import { INLINE_INPUT_COMMAND } from '../plugins/InlineInputPlugin';

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

  // Sync external value changes to the DOM without overwriting user edits
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value ?? '';
    }
  }, [value]);

  // sync changes back to puck
  const handleClickInlinePreview = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isReadOnly) return;

      e.stopPropagation();
      // if (editorRef.current) {
      //   editorRef.current.dispatchCommand(CLICK_COMMAND, e.nativeEvent);
      // }
      if (ref.current) {
        ref.current.focus();
      }

      // dispatch to open the Puck ui
      // dispatch({ type: 'setUi', ui: { field: { focus: propName } } });
    },
    [isReadOnly, propName, dispatch],
  );

  // const applyChangesToPuck = useCallback(
  //   (e: React.InputEvent<HTMLDivElement>) => {
  //     if (isReadOnly) return;

  //     const newValue = e.currentTarget.innerHTML;
  //     const item = getItemById(componentId);
  //     const itemSelector = getSelectorForId(componentId);
  //     if (!item || !itemSelector) return;
  //     console.log('item is or selector: ', item, itemSelector);
  //     const nextProps = structuredClone(item.props);
  //     setDeep(nextProps, propPath, newValue);

  //     dispatch({
  //       type: 'replace',
  //       destinationZone: itemSelector.zone,
  //       destinationIndex: itemSelector.index,
  //       data: {
  //         type: item.type,
  //         props: nextProps,
  //       },
  //     });
  //   },
  //   [isReadOnly, propName, dispatch],
  // );

  const handleInput = useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      if (isReadOnly) return;
      const html = e.currentTarget.outerHTML;

      // Push the HTML into the Lexical editor via the shared editor ref
      // if (editorRef.current) {
      //   // editorRef.current.dispatchCommand(INLINE_INPUT_COMMAND, html);
      //   editorRef.current.update(() => {});
      // }
      const currEditor = editorRef.current;
      if (currEditor) {
        currEditor.update(() => {
          // Prevent the browser from stealing focus
          $addUpdateTag(SKIP_DOM_SELECTION_TAG);

          $setSelection(null);

          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(currEditor, dom);
          const root = $getRoot();
          root.clear();
          root.append(...nodes);
        });
      }
      // Re-focus the inline div after the update
      // Use requestAnimationFrame to ensure it runs after React's render cycle
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.focus();
        }
      });
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
        // onInput={applyChangesToPuck}
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
