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
import { useCallback, useEffect, useRef } from 'react';

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
  const { dispatch, appState } = usePuck();
  const ref = useRef<HTMLDivElement>(null);

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

      e.preventDefault();
      e.stopPropagation();

      dispatch({ type: 'setUi', ui: { field: { focus: propName } } });
    },
    [isReadOnly, propName, dispatch],
  );

  const applyChangesToPuck = useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      if (isReadOnly) return;

      const newValue = e.currentTarget.innerHTML;
      const nextData = structuredClone(appState.data);

      setDeep(nextData, propPath, newValue);

      const component = nextData.content.find(
        (item: any) => item.props?.id === componentId,
      );

      if (!component) return;

      component.props[propName] = newValue;

      dispatch({
        type: 'setData',
        data: nextData,
      });
    },
    [isReadOnly, appState.data, componentId, propName, dispatch],
  );

  return (
    <div className="relative">
      {/* <div
        contentEditable
        suppressContentEditableWarning
        ref={ref}
        onInput={(e) => {
          // Use textContent for plain text, innerHTML for rich text
          applyChangesToLexicalEditor(e);
        }}
        onClick={handleClick}
        className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1 mr-5"
      /> */}
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
