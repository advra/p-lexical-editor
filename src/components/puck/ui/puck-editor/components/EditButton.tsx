'use client';

import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';

type Props = {
  path: string;
  canEdit: boolean;
  disabled?: boolean;
  showLabel?: boolean;
};

export const EditButton = ({
  path,
  canEdit,
  disabled,
  showLabel = false,
}: Props) => {
  const router = useRouter();
  const toolTipText = canEdit ? 'Edit Proc' : 'No Edit Permissions';
  return (
    <Tooltip title={toolTipText}>
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
    </Tooltip>
  );
};
