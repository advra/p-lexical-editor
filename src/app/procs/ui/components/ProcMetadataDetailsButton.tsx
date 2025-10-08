'use client';

import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';

type Props = {
  openMetadataDetails: () => void;
};

export const ProcMetadataDetailsButton = ({ openMetadataDetails }: Props) => {
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Proc Metadata Details"
        size="large"
        onClick={() => openMetadataDetails()}
      >
        <InfoIcon className="text-gray-700-600" />
      </IconButton>
    </>
  );
};
