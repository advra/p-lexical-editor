'use client';

import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';

type Props = {
  path: string;
};

export const EditButton = ({ path }: Props) => {
  const router = useRouter();
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="edit"
        size="large"
        onClick={() => {
          router.push(`${path}/edit`);
        }}
      >
        <EditIcon className="text-amber-600" />
      </IconButton>
    </>
  );
};
