'use client';

import Button from '@mui/material/Button';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import IconButton from '@mui/material/IconButton';
// import { useRouter } from 'next/navigation';

export const ExportPDFButton = () => {
  // const router = useRouter();
  return (
    <>
      <IconButton aria-label="delete" size="large">
        <PictureAsPdfIcon className="text-gray-600" />
      </IconButton>
    </>
  );
};
