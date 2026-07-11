/*
  This dynamically renders the puck editor in the path: ex: /procs/34uerj
*/

'use client';

import { Data, Puck } from '@puckeditor/core';
import config from '../../../../puck.config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DiscardChangesButton } from '@/components/puck/ui/DiscardChangesButton';
import { LexicalEditorRichTextField } from '@/components/puck/ui/lexical/LexicalEditor';
import { ProcProvider } from '@/context/ProcContext';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import { useUser } from '@/context/UserContext';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import EditableInlineRichTextTransform from '../lexical/field-transforms/editable-rich-text-transform';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { useMemo } from 'react';
import { tr } from 'zod/v4/locales';
import { LexicalEditorRefProvider } from '../lexical/plugins/LexicalEditorRefContext';
import { $isTextNode, ParagraphNode, TextNode } from 'lexical';
import { htmlExportMap } from '../lexical/htmlExportMap';

export function PuckClientEditor({
  pathName,
  proc,
  slug,
}: Readonly<{
  pathName: string;
  proc:
    | ProcPublic
    | (ProcPublicWithAcl & {
        data: Partial<Data>;
      });
  slug: string;
}>) {
  const router = useRouter();
  // const slug = path.split('/').filter(Boolean).pop()!;
  const { session, loading } = useUser();
  const user = session?.user;
  // Check if user has edit permissions
  const isOwner = proc.owner === user?.username;
  const isAdmin = user?.roles?.includes('admin');
  const userPermissions = {
    read: isOwner || isAdmin || true, // Default to true for now
    edit: !!(isOwner || isAdmin),
    execute: !!(isOwner || isAdmin),
  };

  const handlePublish = async (data: Partial<Data>) => {
    try {
      const res = await fetch(`/api/puck/proc/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save changes');
      }

      toast.success('Changes saved!');
      // Redirect to view mode instead of staying in edit mode
      // dont use router.push
      const viewPath = pathName.replace('/edit', '');
      router.push(viewPath);
      // router.refresh();
      window.location.href = viewPath;
    } catch {
      toast.error('Error saving, please try again...');
    }
  };

  const initialConfig: InitialConfigType = useMemo(
    () => ({
      namespace: 'PuckLexical',
      editable: true,
      onError: (error: Error) => {
        console.error('Lexical error:', error);
      },
      nodes: [ListNode, ListItemNode, HeadingNode, ParagraphNode, TextNode],
      html: {
        export: htmlExportMap,
        import: {
          span: () => ({
            conversion: (domNode) => {
              const span = domNode as HTMLSpanElement;
              const style = span.getAttribute('style') || '';
              return {
                forChild: (lexicalNode) => {
                  if ($isTextNode(lexicalNode) && style) {
                    lexicalNode.setStyle(style);
                  }
                  return lexicalNode;
                },
                node: null,
              };
            },
            // Higher priority than default
            priority: 1,
          }),
        },
      },
    }),
    [],
  );

  return (
    <LexicalEditorRefProvider>
      <ProcProvider
        viewMode={'edit'}
        owner={proc.owner}
        permissions={userPermissions}
        currentUser={user}
        procId={proc._id}
      >
        <div className="h-screen overflow-auto">
          <LexicalComposer initialConfig={initialConfig}>
            <Puck
              iframe={{ enabled: false, waitForStyles: false }}
              config={config}
              data={proc.data}
              onPublish={handlePublish}
              overrides={{
                headerActions: ({ children }) => (
                  <>
                    <DiscardChangesButton slug={slug} />
                    {children}
                  </>
                ),

                // custom fields
                fieldTypes: {
                  checkbox: ({ field, name, value, onChange }) => (
                    <label>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                      {field.label || name}
                    </label>
                  ),
                  // Override the default TipTap richtext editor with Lexical
                  richtext: ({
                    field,
                    name,
                    value,
                    onChange,
                    readOnly,
                    children,
                  }) => (
                    <LexicalEditorRichTextField
                      field={field}
                      value={value}
                      name={name}
                      onChange={onChange}
                      readOnly={readOnly}
                    >
                      {children}
                    </LexicalEditorRichTextField>
                  ),
                },
              }}
              // Field transforms enable inline editing with overlay portals
              // TODO fix this. comment out and i can click and editor appears on right side but if i dont it doesnt..
              fieldTransforms={{
                richtext: (props) => (
                  <EditableInlineRichTextTransform transformProps={props} />
                ),
              }}
            />
          </LexicalComposer>
        </div>
      </ProcProvider>
    </LexicalEditorRefProvider>
  );
}
