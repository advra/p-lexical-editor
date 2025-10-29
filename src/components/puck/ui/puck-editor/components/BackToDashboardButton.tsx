'use client';

import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@mui/material';

export const BackToDashboardButton = () => {
  const router = useRouter();
  const toolTipText = 'Back to Proc Dashboard';
  return (
    <>
      <Tooltip title={toolTipText}>
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
      </Tooltip>
    </>
  );
};
