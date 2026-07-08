'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LexicalEditorRichTextField } from './LexicalEditor';

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
    <InlineLexicalEditor
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
function InlineLexicalEditor({
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
  const anchorRef = useRef<HTMLDivElement>(null);

  console.log(value);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleOpen = useCallback(() => {
    if (!isReadOnly) {
      setIsEditing(true);
    }
  }, [isReadOnly]);

  const handleClose = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <>
      {/* Inline preview - renders the HTML content */}
      <div
        ref={anchorRef}
        onClick={handleOpen}
        className="lexical-inline-preview cursor-pointer min-h-[1.5em] hover:ring-2 hover:ring-blue-200 rounded px-1 transition-all"
        dangerouslySetInnerHTML={{ __html: localValue || '' }}
      />

      {/* Overlay portal for inline editing */}
      {isEditing &&
        anchorRef.current &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={handleClose}
          >
            <div
              className="bg-white rounded-lg shadow-xl border border-gray-200 w-[600px] max-w-[90vw] max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Edit {propName}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-4">
                <LexicalEditorRichTextField
                  field={{}}
                  value={localValue}
                  onChange={(newValue) => setLocalValue(newValue)}
                  name={propName}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // The value is already updated via onChange
                    handleClose();
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
