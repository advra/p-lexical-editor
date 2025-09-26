'use client';

import { useRouter } from 'next/navigation';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Props = {
  path: string;
};

export const BackToViewMode = ({ path }: Props) => {
  const router = useRouter();
  return (
    <>
      <div
        className="rounded-sm aspect-square h-[30px]
       border border-blue-500 hover:border-blue-400 hover:cursor-pointer"
        onClick={() => {
          router.push(path);
        }}
      >
        <VisibilityIcon className="m-0.5 text-blue-500 hover:text-blue-400" />
      </div>
    </>
  );
};
