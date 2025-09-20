'use client';

import { useState } from 'react';
import { default as CustomButton } from '@/components/common/buttons/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface Props {
  slug: string;
}

export const DiscardChangesButton = ({ slug }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const backToPreview = () => router.push(`/procs/${slug}`);

  const handleOpen = () => setOpen(true);
  const handleCancel = () => {
    if (confirming) return; // optional guard
    setOpen(false);
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      backToPreview();
      // if you needed async cleanup, await it here before pushing
    } finally {
      setConfirming(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        className="text-red-500 hover:text-red-600 bg-transparent hover:bg-red-300 
          hover:cursor-pointer  border border-red-500 focus:outline-none 
          focus:ring-transparent font-medium rounded-md text-sm p-1
          text-center inline-flex items-center me-2
           h-full aspect-square  
          "
        onClick={handleOpen}
        aria-label="Discard changes"
      >
        <DeleteIcon fontSize="medium" />
      </button>

      {/* Confirm dialog */}
      <Dialog
        open={open}
        onClose={handleCancel} // closes on ESC / backdrop
        fullWidth
        maxWidth="sm"
        aria-labelledby="discard-changes-title"
      >
        <DialogTitle id="discard-changes-title">
          Discard unsaved changes?
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            You have unsaved edits. Discard them? This action can’t be undone.
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton
            className="text-gray-700 border border-gray-400 rounded-sm hover:bg-black/10"
            onClick={handleCancel}
            disabled={confirming}
          >
            Cancel
          </CustomButton>

          <CustomButton
            className="bg-red-600 text-white rounded-sm hover:bg-red-700"
            onClick={handleConfirm}
            disabled={confirming}
          >
            Discard
          </CustomButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
