'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Box, CircularProgress } from '@mui/material';

type Props = {
  open: boolean;
};

export default function RedirectingDialog({ open }: Props) {
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      aria-labelledby="redirecting-title"
    >
      <div className="p-4">
        <CircularProgress />
      </div>

      <div className="px-4 mb-8">
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          Procedure successfully created. Redirecting you to the eproc page...
        </Box>
      </div>
    </Dialog>
  );
}
