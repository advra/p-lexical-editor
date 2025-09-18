'use client';

import Button from '@mui/material/Button';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import IconButton from '@mui/material/IconButton';
// import { useRouter } from 'next/navigation';

export const ExportPDFButton = () => {
  // const router = useRouter();
  return (
    <>
      {/* <Button
        size="small"
        variant="outlined"
        startIcon={<PictureAsPdfIcon />}
        aria-label="Edit"
        onClick={() => {
          console.log('EXPORT PDF');
        }}
      >
        Export
      </Button> */}
      <IconButton aria-label="delete" size="large">
        <PictureAsPdfIcon />
      </IconButton>
    </>
  );
};
