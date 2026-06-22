// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

import {
  BaseField,
  Field,
  FieldTransformFnParams,
  registerOverlayPortal,
  usePuck,
} from '@puckeditor/core';
import { useEffect, useRef } from 'react';

type Props = {
  transformProps: FieldTransformFnParams<
    | ({
        type: string;
      } & BaseField)
    | Field<any, {}>
  >;
};

export const EditableTextTransform = ({ transformProps }: Props) => {
  const { value, isReadOnly, componentId, field, propName, propPath } =
    transformProps;
  const { dispatch } = usePuck();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !isReadOnly) {
      // Register the element as an overlay portal
      registerOverlayPortal(ref.current);
    }
  }, [ref.current, isReadOnly]);

  return (
    <div
      contentEditable
      ref={ref}
      onClickCapture={() => {
        dispatch({ type: 'setUi', ui: { field: { focus: propName } } });
      }}
      className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1"
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
};

export default EditableTextTransform;
