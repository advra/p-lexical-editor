import React from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';

type Props = {
  slug: string;
};

function EditButton({ slug }: Props) {
  return (
    <Tooltip title="Open Editor">
      <Link href={`procs/${slug}/edit`}>
        <div
          className="rounded-sm aspect-square h-[30px]
                                hover:border-orange-400 hover:cursor-pointer"
        >
          <EditIcon className="m-0.5 text-gray-400 hover:text-orange-400" />
        </div>
      </Link>
    </Tooltip>
  );
}

export default EditButton;
