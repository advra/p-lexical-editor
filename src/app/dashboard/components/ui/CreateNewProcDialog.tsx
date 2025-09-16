"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextfield,
  Box,
  MenuItem,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@/components/common/TextField";

import { default as CustomButton } from "@/components/common/buttons/Button"
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type ProcPayload = {
  name: string;
  description: string;
  projectTag?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: ProcPayload) => Promise<void> | void;
  projectTags?: string[]; // optional list of tags to show in a select
};

export default function CreateNewProcDialog({
  open,
  onClose,
  onCreate,
  projectTags = [],
}: Props) {
  const router = useRouter()

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectTag, setProjectTag] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (!open) {
      // reset fields when dialog closes
      setName("");
      setDescription("");
      setProjectTag("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!description.trim()) next.description = "Description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { id, path, data } = await onCreate({ name: name.trim(), description: description.trim(), projectTag });
      toast.success(`Successfully Created new Proc: ${name.trim()}`)
      router.push(`/procs/${id}`);
    } catch (err) {
      console.error("Create proc failed", err);
      toast.error("Error creating Proc")
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="create-proc-title">
      <div className="p-4">
        <h3>Create New Proc</h3>
      </div>

      <div className="px-4 mb-8">
        <Box component="form" noValidate autoComplete="off" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            placeholder="Eg. Viasat-2 Boeing Launch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            // helperText={errors.name ?? ""}
            autoFocus
          />

          <TextField
            className="w-full"
            label="Description"
            placeholder="Describe your operational procedure"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            // multiline
            // minRows={3}
            error={!!errors.description}
          // helperText={errors.description ?? ""}
          />

          {/* Project tag: if you pass a list, show select otherwise show text input */}
          {projectTags && projectTags.length > 0 ? (
            <TextField
              className="w-full"
              label="Project Tag"
              // select
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
            // helperText="Assign a project tag"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {projectTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              className="w-full"
              label="Project Tag"
              placeholder="Assign a project tag"
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
