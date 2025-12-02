'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Box } from '@mui/material';
import TextField from '@/components/common/TextField';

import { default as CustomButton } from '@/components/common/buttons/Button';
import { useRouter } from 'next/navigation';

export type MetadataInfo = {
  title: string;
  description: string;
  tags?: string[];
};

type Props = {
  metadata: MetadataInfo;
  open: boolean;
  onClose: () => void;
  onUpdate: (newData: MetadataInfo) => Promise<void> | void;
};

export default function ProcMetadataDialog({
  metadata,
  open,
  onClose,
  onUpdate,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(metadata.title);
  const [description, setDescription] = useState(metadata.description);
  const [tags, setTags] = useState<string[]>(metadata.tags ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );

  console.log('metadata', metadata);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const toCsv = (vals: (string | null | undefined)[]) =>
    vals
      .map((v) => (v ?? '').trim())
      .filter(Boolean)
      .join(',');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-proc-title"
    >
      <div className="p-4 flex items-center gap-2 my-2">
        <h3>Document Details</h3>
      </div>

      <div className="px-4 mb-8">
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            disabled
            label="Name"
            placeholder={metadata?.title}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            autoFocus
          />

          <TextField
            disabled
            className="w-full"
            label="Description"
            placeholder={metadata?.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            error={!!errors.description}
          />

          <TextField
            disabled
            className="w-full"
            label="Tags"
            placeholder={metadata?.tags?.join(',')}
            value={tags}
            onChange={(e) => setDescription(e.target.value)}
            required
            error={!!errors.description}
          />
        </Box>
      </div>

      <div className="ml-auto p-4 flex gap-2">
        <CustomButton
          className=" text-gray-600 border border-gray-600 rounded-sm hover:bg-black/10"
          onClick={onClose}
          disabled={submitting}
        >
          Close
        </CustomButton>
      </div>
    </Dialog>
  );
}
