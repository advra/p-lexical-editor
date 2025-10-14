'use client';

import { useRouter } from 'next/navigation';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

export const SessionButtons = () => {
  return (
    <>
      <div
        className="rounded-sm aspect-square h-[30px]
       border-green-500 hover:border-green-400 hover:cursor-pointer"
      >
        <PlayCircleFilledIcon className="m-0.5 text-green-600 hover:text-green-500" />
      </div>
    </>
  );
};
