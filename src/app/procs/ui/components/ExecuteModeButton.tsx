'use client';

import { useRouter } from 'next/navigation';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

type Props = {
  path: string;
};

export const ExecuteModeButton = ({ path }: Props) => {
  const router = useRouter();
  return (
    <>
      <div
        className="rounded-sm aspect-square h-[30px]
       border-orange-500 hover:border-orange-400 hover:cursor-pointer"
        onClick={() => {
          router.push(`${path}/execute`);
        }}
      >
        <ElectricBoltIcon className="m-0.5 text-orange-500 hover:text-orange-400" />
      </div>
    </>
  );
};
