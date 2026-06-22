// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

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

  useEffect(() => {
    if (ref.current) {
      registerOverlayPortal(ref.current);
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isReadOnly) return;

      e.preventDefault();
      e.stopPropagation();

      dispatch({ type: 'setUi', ui: { field: { focus: propName } } });
    },
    [isReadOnly, propName, dispatch],
  );

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1 inline-block"
      dangerouslySetInnerHTML={{ __html: value ?? '' }}
    />
  );
};

export default EditableRichTextTransform;
