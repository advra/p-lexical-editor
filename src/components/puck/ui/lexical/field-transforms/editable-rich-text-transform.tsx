// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  BaseField,
  Field,
  FieldTransformFnParams,
  registerOverlayPortal,
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
  const { value, isReadOnly, propName } = transformProps;
  const { dispatch } = usePuck();
  const ref = useRef<HTMLDivElement>(null);
  const isExternalUpdate = useRef(false);

  useEffect(() => {
    if (ref.current) {
      registerOverlayPortal(ref.current);
    }
  }, []);

  // Sync external value changes to the DOM without overwriting user edits
  // The isExternalUpdate flag prevents feedback loops
  useEffect(() => {
    if (ref.current) {
      isExternalUpdate.current = true;
      ref.current.innerHTML = value ?? '';
    }
  }, [value]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isReadOnly) return;

      e.preventDefault();
      e.stopPropagation();

      dispatch({ type: 'setUi', ui: { field: { focus: propName } } });

      console.log('INNER IS', e.currentTarget.innerHTML);
    },
    [isReadOnly, propName, dispatch],
  );

  return (
    <div className="relative">
      <div
        contentEditable
        suppressContentEditableWarning
        ref={ref}
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
