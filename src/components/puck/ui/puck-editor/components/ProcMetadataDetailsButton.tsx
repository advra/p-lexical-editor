'use client';

import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';

type Props = {
  openMetadataDetails: () => void;
};

export const ProcMetadataDetailsButton = ({ openMetadataDetails }: Props) => {
  const toolTipText = 'View Metadata';
  return (
    <>
      <Tooltip title={toolTipText}>
        <IconButton
          color="inherit"
          aria-label="Proc Metadata Details"
          size="large"
          onClick={() => openMetadataDetails()}
        >
          <InfoIcon className="text-gray-700-600" />
        </IconButton>
      </Tooltip>
    </>
  );
};
