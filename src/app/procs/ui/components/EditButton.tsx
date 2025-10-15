'use client';

import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
  path: string;
  disabled?: boolean;
  showLabel?: boolean;
};

export const EditButton = ({ path, disabled, showLabel = false }: Props) => {
  const router = useRouter();
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton
        sx={{
          color: '#2ca33e',
          '&:hover': {
            color: '#0d8c20',
          },
        }}
        aria-label="edit"
        size="large"
        disabled={disabled}
        onClick={() => {
          router.push(`${path}/edit`);
        }}
      >
        <EditIcon />
      </IconButton>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          Edit
        </Typography>
      )}
    </Box>
  );
};
