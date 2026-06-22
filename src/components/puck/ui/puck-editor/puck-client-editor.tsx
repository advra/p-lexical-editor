/*
  This dynamically renders the puck editor in the path: ex: /procs/34uerj
*/

'use client';

import { Puck } from '@puckeditor/core';
import config from '../../../../puck.config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DiscardChangesButton } from '@/components/puck/ui/DiscardChangesButton';
import {
  InitialHtmlContentPlugin,
  LexicalRichtextField,
  LexicalToolbar,
} from '@/components/puck/ui/lexical/LexicalEditor';
import { richtextFieldTransform } from '@/components/puck/ui/lexical/lexical-field-transform';
import { ProcProvider } from '@/context/ProcContext';
import {
  ProcPublic,
  ProcPublicWithAcl,
} from '@/modules/procs/models/proc-model';
import { useUser } from '@/context/UserContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import EditableTextTransform from '../lexical/field-transforms/editable-rich-text-transform';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalToolbarV2 } from '../lexical/Toobarv2';

export function PuckClientEditor({
  pathName,
  proc,
  slug,
}: {
  pathName: string;
  proc:
    | ProcPublic
    | (ProcPublicWithAcl & {
        data: Partial<Data>;
      });
  slug: string;
}) {
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
      const viewPath = pathName.replace('/edit', '');
      router.push(viewPath);
    } catch {
      toast.error('Error saving, please try again...');
    }
  };

  const lexicalConfig = {
    namespace: 'PuckLexical',
    // editable: !readOnly,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    // nodes: [ListNode, ListItemNode, HeadingNode],
  };

  return (
    <ProcProvider
      viewMode={'edit'}
      owner={proc.owner}
      permissions={userPermissions}
      currentUser={user}
      procId={proc._id}
    >
      <LexicalComposer initialConfig={lexicalConfig}>
        <InitialHtmlContentPlugin html={''} />
        {/* Toolbar */}
        <div className="">
          <LexicalToolbarV2 />
        </div>
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
        {/* <OnChangePlugin onChange={handleChange} /> */}
        {/* <ListPlugin /> */}
        <div className="h-screen overflow-auto">
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
                  <LexicalRichtextField
                    field={field}
                    value={value}
                    name={name}
                    onChange={onChange}
                    readOnly={readOnly}
                  >
                    {children}
                  </LexicalRichtextField>
                ),
              },
            }}
            // Field transforms enable inline editing with overlay portals
            // TODO fix this. comment out and i can click and editor appears on right side but if i dont it doesnt..
            fieldTransforms={{
              richtext: (props) => (
                <EditableTextTransform transformProps={props} />
              ),
            }}
          />
        </div>
      </LexicalComposer>
    </ProcProvider>
  );
}
