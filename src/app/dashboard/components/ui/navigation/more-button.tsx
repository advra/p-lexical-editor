import React from 'react';
import { Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Props = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

function PreviewButton({ onClick }: Props) {
  return (
    <Tooltip title="Preview">
      <div
        className="rounded-sm aspect-square h-[30px]
                                hover:border-blue-400 hover:cursor-pointer"
        onClick={onClick}
      >
        <VisibilityIcon className="m-0.5 text-gray-400 hover:text-blue-400" />
      </div>
    </Tooltip>
  );
}

export default PreviewButton;
