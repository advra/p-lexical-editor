'use client';

import { useRouter } from 'next/navigation';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { Tooltip } from '@mui/material';

type Props = {
  path: string;
  disabled: boolean;
  canExecute: boolean;
};

export const ExecuteModeButton = ({ path, disabled, canExecute }: Props) => {
  const router = useRouter();
  const toolTipText = canExecute ? 'Execute Session' : 'No Execute Permissions';
  return (
    <>
      <Tooltip title={toolTipText}>
        {disabled ? (
          <div
            className="rounded-sm aspect-square h-[30px]
       border-orange-500 hover:border-orange-400 hover:cursor-pointer"
            onClick={() => {
              router.push(`${path}/execute`);
            }}
          >
            <ElectricBoltIcon className="m-0.5 text-orange-500 hover:text-orange-400" />
          </div>
        ) : (
          <div
            className="rounded-sm aspect-square h-[30px]
       border-gray-500 hover:cursor-not-allowed"
          >
            <ElectricBoltIcon className="m-0.5 text-gray-500" />
          </div>
        )}
      </Tooltip>
    </>
  );
};
