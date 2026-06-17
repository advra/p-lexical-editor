/**
 * A Lexical-based rich text editor that replaces Puck's default TipTap richtext field.
 *
 * This component is used as a field type override for the "richtext" field type in Puck.
 * It provides a WYSIWYG editing experience using Lexical (by Meta) instead of TipTap.
 *
 * The editor stores content as HTML strings, which is compatible with Puck's data model.
 */
export function LexicalRichtextField({
  field,
  value,
  onChange,
  readOnly,
  id,
  name,
  children,
}: Readonly<Props>) {
  // Initial config for Lexical
  const initialConfig = useMemo(
    () => ({
      namespace: 'PuckLexical',
      editable: !readOnly,
      onError: (error: Error) => {
        console.error('Lexical error:', error);
      },
    }),
    [readOnly],
  );

  return (
    <div className="lexical-richtext-field border border-gray-200 rounded-md overflow-hidden">
      {children}
      {/* <LexicalComposer initialConfig={initialConfig}> */}
      {/* <LexicalToolbar /> */}
      {/* Set initial HTML content */}
      {/* <InitialHtmlContentPlugin html={value || ''} /> */}
      {/* Toolbar */}
      {/* {!readOnly && <LexicalToolbar />} */}
      {/* Editor */}
      {/* <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-editor min-h-[100px] p-3 focus:outline-none"
                style={{ outline: 'none' }}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                Enter text...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div> */}
      {/* Plugins */}
      {/* <HistoryPlugin />
        <AutoFocusPlugin /> */}
      {/* </LexicalComposer> */}
    </div>
  );
}
