// components/ExportPDFButton.tsx
'use client';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';

export function ExportPDFButton({ href }: { href: string }) {
  const router = useRouter();
  console.log('PRINT', href);
  return (
    <IconButton
      aria-label="Export PDF"
      size="large"
      onClick={() => router.push(href)}
    >
      <PictureAsPdfIcon className="text-gray-600" />
    </IconButton>
  );
}
