// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  BaseField,
  Field,
  FieldTransformFnParams,
  registerOverlayPortal,
  setDeep,
  usePuck,
} from '@puckeditor/core';
import { $getRoot } from 'lexical';
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

export const EditableRichTextTransform = ({ transformProps }: Props) => {
  const { value, isReadOnly, propName, propPath, componentId } = transformProps;
  const { dispatch, appState, getItemById, getSelectorForId } = usePuck();
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useLexicalEditorRef();

  console.log('propPath', propPath);
  console.log('appState.data before', appState.data);

  useEffect(() => {
    if (ref.current) {
      registerOverlayPortal(ref.current);
    }
  }, []);

  // Sync external value changes to the DOM without overwriting user edits
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value ?? '';
    }
  }, [value]);

  // sync changes back to puck
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isReadOnly) return;

      e.stopPropagation();

      dispatch({ type: 'setUi', ui: { field: { focus: propName } } });
    },
    [isReadOnly, propName, dispatch],
  );

  const applyChangesToPuck = useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      if (isReadOnly) return;
      const newValue = e.currentTarget.innerHTML;

      // Push the HTML into the Lexical editor via the shared editor ref
      const currEditor = editorRef.current;
      if (currEditor) {
        currEditor.update(() => {
          // 1. Parse the HTML string into a DOM Document instance
          const parser = new DOMParser();
          const dom = parser.parseFromString(newValue, 'text/html');

          // 2. Generate Lexical nodes from the DOM
          const nodes = $generateNodesFromDOM(currEditor, dom);

          // 3. Replace the editor content with the new nodes
          const root = $getRoot();
          root.clear();
          root.append(...nodes);
        });
      }
    },
    [isReadOnly, editorRef],
  );

  // const applyChangesToPuck = useCallback(
  //   (e: React.InputEvent<HTMLDivElement>) => {
  //     if (isReadOnly) return;
  //     const newValue = e.currentTarget.innerHTML;
  //     const item = getItemById(componentId);
  //     const itemSelector = getSelectorForId(componentId);
  //     if (!item || !itemSelector) return;
  //     const nextProps = structuredClone(item.props);
  //     setDeep(nextProps, propPath, newValue);

  //     dispatch({
  //       type: 'replace',
  //       destinationZone: itemSelector.zone,
  //       destinationIndex: itemSelector.index,
  //       data: {
  //         ...item,
  //         props: {
  //           ...item.props,
  //           anotherProp: item.props.customFieldProp,
  //         },
  //       },
  //     });
  //   },
  //   [isReadOnly, appState.data, componentId, propPath, dispatch],
  // );

  return (
    <div className="relative">
      <div
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        ref={ref}
        onInput={applyChangesToPuck}
        onClick={handleClick}
        className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1 mr-5"
      />
      <div className="absolute top-0 -right-1">
        <DragIndicatorIcon className="text-gray-500" />
      </div>
    </div>
  );
};

export default EditableRichTextTransform;
