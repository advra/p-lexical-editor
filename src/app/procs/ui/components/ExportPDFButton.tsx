// components/ExportPDFButton.tsx
'use client';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import IconButton from '@mui/material/IconButton';

type Props = {
  handlePreviewPrint: () => void | Promise<void>;
};

export function ExportPDFButton({ handlePreviewPrint }: Props) {
  return (
    <IconButton
      aria-label="Export PDF"
      size="large"
      onClick={handlePreviewPrint}
    >
      <PictureAsPdfIcon className="text-gray-600" />
    </IconButton>
  );
}
