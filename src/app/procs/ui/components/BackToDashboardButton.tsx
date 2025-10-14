'use client';

import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/navigation';

export const BackToDashboardButton = () => {
  const router = useRouter();
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ChevronLeftIcon />}
        aria-label="Back to Dashboard"
        onClick={() => {
          router.push('/dashboard');
        }}
      >
        Dashboard
      </Button>
    </>
  );
};
