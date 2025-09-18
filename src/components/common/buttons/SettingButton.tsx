// src/components/ui/buttons/SettingsButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import SettingsIcon from '@mui/icons-material/Settings';

import Button from './Button';

type Props = { handleClose?: () => void };

export default function SettingsButton({ handleClose }: Props) {
  const router = useRouter();
  const handleLogout = async () => {
    handleClose?.();

    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/login');
    } else {
      alert('Logout failed');
    }
  };

  return (
    <div
      className=" w-full rounded-none hover:bg-gray-200 hover:cursor-pointer"
      onClick={handleLogout}
    >
      <div className="pl-2 flex items-center justify-start gap-2 w-full text-left">
        <SettingsIcon fontSize="small" />
        <span>Settings</span>
      </div>
    </div>
  );
}
