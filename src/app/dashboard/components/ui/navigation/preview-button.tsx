import React from 'react';
import { Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';

type Props = {
  slug?: string;
};

function PreviewButton({ slug }: Props) {
  return (
    <Tooltip title="View document">
      <Link href={`procs/${slug}`}>
        <div
          className="rounded-sm aspect-square h-[30px]
                                hover:border-blue-400 hover:cursor-pointer"
        >
          <VisibilityIcon className="m-0.5 text-gray-400 hover:text-blue-400" />
        </div>
      </Link>
    </Tooltip>
  );
}

export default PreviewButton;
