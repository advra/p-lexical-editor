// components/ExportPDFButton.tsx
'use client';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';

type Props = {
  handlePreviewPrint: () => void | Promise<void>;
};

export function ExportPDFButton({ handlePreviewPrint }: Props) {
  const toolTipText = 'Export as PDF';
  return (
    <IconButton
      aria-label="Export PDF"
      size="large"
      onClick={handlePreviewPrint}
    >
      <Tooltip title={toolTipText}>
        <PictureAsPdfIcon className="text-gray-600" />
      </Tooltip>
    </IconButton>
  );
}
