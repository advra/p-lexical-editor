// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

import { registerOverlayPortal } from '@puckeditor/core';
import { useEffect, useRef } from 'react';

type Props = {
  value: string;
};

export const EditableText = ({ value }: Props) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      // Register the element as an overlay portal
      registerOverlayPortal(ref.current);
    }
  }, [ref.current]);

  return (
    // Mark the element as editable for inline text editing
    <div
      contentEditable
      ref={ref}
      className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1"
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
};

export default EditableText;
