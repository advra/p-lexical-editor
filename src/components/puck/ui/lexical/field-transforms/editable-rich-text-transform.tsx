// source example: https://puckeditor.com/docs/extending-puck/field-transforms#making-it-interactive

/*
  This component is the inline content editable inside puck editor that allows users to click and edit directly
  It handles things such as click events, so when clicked on will notify puck to open the Lexical Editor on the right panel
*/
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  BaseField,
  Field,
  FieldTransformFnParams,
  registerOverlayPortal,
  usePuck,
} from '@puckeditor/core';
import {
  $addUpdateTag,
  $createParagraphNode,
  $getRoot,
  $isElementNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalEditorRef } from '../plugins/LexicalEditorRefContext';
import { extractRichTextContent } from '../plugins/lexicalUtils';

type Props = {
  transformProps: FieldTransformFnParams<
    | ({
        type: string;
      } & BaseField)
    | Field<any, {}>
  >;
};

export const EditableInlineRichTextTransform = ({ transformProps }: Props) => {
  const { value, isReadOnly, propName, propPath, componentId } = transformProps;
  const { dispatch, appState, getItemById, getSelectorForId } = usePuck();
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useLexicalEditorRef();
  const isInlineFocused = useRef(false);

  useEffect(() => {
    if (ref.current) {
      registerOverlayPortal(ref.current, { disableDrag: true });
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
  // Also skip if the inline toolbar has set a skip-sync flag (for font/font-family/color changes)
  useEffect(() => {
    if (ref.current && !isInlineFocused.current && ref.current.dataset.skipSync !== 'true') {
      ref.current.innerHTML = extractRichTextContent(value);
    }
    // Clear the flag after a delay to prevent the same value change cycle from
    // clearing it too early (the inline toolbar sets this flag before syncing)
    if (ref.current && ref.current.dataset.skipSync === 'true') {
      const el = ref.current;
      const timer = setTimeout(() => {
        delete el.dataset.skipSync;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [value]);

  // Handle keyboard shortcuts for formatting (Ctrl+B, Ctrl+I, Ctrl+U)
  // Also prevent Enter from propagating to Puck's block-level keyboard handlers
  // const handleKeyDown = useCallback(
  //   (e: React.KeyboardEvent<HTMLDivElement>) => {
  //     if (isReadOnly) return;

  //     // Prevent Enter key from bubbling up to Puck's block duplication handler
  //     if (e.key === 'Enter') {
  //       e.stopPropagation();
  //       return;
  //     }

  //     const isCtrl = e.ctrlKey || e.metaKey; // metaKey for Mac

  //     if (isCtrl) {
  //       switch (e.key.toLowerCase()) {
  //         case 'b':
  //           e.preventDefault();
  //           document.execCommand('bold');
  //           break;
  //         case 'i':
  //           e.preventDefault();
  //           document.execCommand('italic');
  //           break;
  //         case 'u':
  //           e.preventDefault();
  //           document.execCommand('underline');
  //           break;
  //       }
  //     }
  //   },
  //   [isReadOnly],
  // );

  useEffect(() => {
    const el = ref.current;
    if (!el || isReadOnly) return;

    const handleNativeKeyDown = (e: KeyboardEvent) => {
      // Stop propagation so Puck's document-level listener doesn't see it
      e.stopPropagation();

      if (e.key === 'Enter') {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline');
            break;
        }
      }
    };

    el.addEventListener('keydown', handleNativeKeyDown);
    return () => el.removeEventListener('keydown', handleNativeKeyDown);
  }, [isReadOnly]);

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
      // Use innerHTML instead of outerHTML to avoid including the wrapper div element
      const html = e.currentTarget.innerHTML;

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

          // Wrap any non-element nodes (e.g. bare text nodes) in <p> elements
          // because the root node only accepts element or decorator nodes
          for (const node of nodes) {
            if ($isElementNode(node)) {
              root.append(node);
            } else {
              // Wrap bare text/other non-element nodes in a paragraph
              const p = $createParagraphNode();
              p.append(node);
              root.append(p);
            }
          }
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
        // onKeyDown={handleKeyDown}
        className="lexical-inline-preview cursor-text min-h-[1.5em] rounded px-1 mr-5"
      />
      <div className="absolute top-0 -right-1">
        <DragIndicatorIcon className="text-gray-500" />
      </div>
    </div>
  );
};

export default EditableInlineRichTextTransform;
