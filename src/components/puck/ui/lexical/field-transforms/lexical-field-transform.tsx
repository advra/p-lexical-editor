'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LexicalRichtextField } from '../LexicalEditor';
import { registerOverlayPortal } from '@puckeditor/core';

/**
 * Field transform for the "richtext" field type that enables inline editing
 * with overlay portals in Puck.
 *
 * This transform renders the richtext content inline in the preview, and when
 * clicked, opens an overlay portal with the Lexical editor for inline editing.
 *
 * Usage:
 * ```tsx
 * <Puck
 *   fieldTransforms={{
 *     richtext: richtextFieldTransform,
 *   }}
 * />
 * ```
 */
export const richtextFieldTransform = ({
  value,
  isReadOnly,
  componentId,
  propName,
  field,
}: {
  value: string;
  isReadOnly: boolean;
  componentId: string;
  propName: string;
  field: any;
}) => {
  return (
    <EditableINlineRichText
      value={value}
      isReadOnly={isReadOnly}
      propName={propName}
    />
  );
};

/**
 * Inline editor component that renders the HTML content and provides
 * an overlay portal for editing when clicked.
 */
function EditableINlineRichText({
  value,
  isReadOnly,
  propName,
}: Readonly<{
  value: string;
  isReadOnly: boolean;
  propName: string;
}>) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (ref.current) {
      registerOverlayPortal(ref.current);
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (!isReadOnly) {
      setIsEditing(true);
    }
  }, [isReadOnly]);

  return (
    <>
      <div
        contentEditable
        ref={ref}
        onClick={handleOpen}
        className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1"
        dangerouslySetInnerHTML={{ __html: localValue || '' }}
      />
      {isEditing &&
        createPortal(
          <LexicalRichtextField
            field={{}}
            value={localValue}
            onChange={(newValue) => setLocalValue(newValue)}
            readOnly={false}
            name={propName}
          />,
          document.body,
        )}
    </>
  );
}
