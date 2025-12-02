'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextfield,
  Box,
  MenuItem,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@/components/common/TextField';

import { default as CustomButton } from '@/components/common/buttons/Button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createResponse } from '@/app/api/puck/proc/route';

export type ProcPayload = {
  name: string;
  description: string;
  tags?: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: ProcPayload) => Promise<createResponse>;
  tags?: string[]; // optional list of tags to show in a select
};

export default function CreateNewProcDialog({
  open,
  onClose,
  onCreate,
  tags = [],
}: Props) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectTag, setProjectTag] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );

  useEffect(() => {
    if (!open) {
      // reset fields when dialog closes
      setName('');
      setDescription('');
      setProjectTag('');
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!description.trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { path } = await onCreate({
        name: name.trim(),
        description: description.trim(),
        tags,
      });
      toast.success(`Successfully Created new Proc: ${name.trim()}`);
      // redirect
      router.push(path);
    } catch (err) {
      console.error('Create proc failed', err);
      toast.error('Error creating Proc');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-proc-title"
    >
      <div className="p-4">
        <h3>Create New Document</h3>
      </div>

      <div className="px-4 mb-8">
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Name*"
            placeholder="Eg. New Document"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            autoFocus
          />

          <TextField
            className="w-full"
            label="Description*"
            placeholder="Describe your document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            error={!!errors.description}
          />

          {/* Project tag: if you pass a list, show select otherwise show text input */}
          {tags && tags.length > 0 ? (
            <TextField
              className="w-full"
              label="Tag (Optional)"
              placeholder="Assign a tag"
              // select
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              className="w-full"
              label="Project Tag"
              placeholder="Assign a project tag (Optional)"
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
              // helperText="Assign a project tag"
            />
          )}
        </Box>
      </div>

      <div className="ml-auto p-4 flex gap-2">
        <CustomButton
          className=" text-gray-600 border border-gray-600 rounded-sm hover:bg-black/10"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </CustomButton>

        <CustomButton
          className="bg-black text-white rounded-sm flex hover:bg-black/85"
          onClick={handleCreate}
          disabled={submitting}
        >
          Create
        </CustomButton>
      </div>
    </Dialog>
  );
}
