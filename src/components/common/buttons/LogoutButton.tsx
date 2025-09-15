// src/components/ui/buttons/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';

import Button from './Button';

type Props = { handleClose?: () => void };

export default function LogoutButton({ handleClose }: Props) {
  const router = useRouter();
  const handleLogout = async () => {
    handleClose?.();

    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      router.push("/login");
    } else {
      alert("Logout failed");
    }
  };

  return (
    <Button
      asChild
      className='p-2 hover:bg-gray-200 w-full rounded-none'
      onClick={handleLogout}
    >
      <div className="pl-2 flex items-center justify-start gap-2 w-full text-left">
        <LogoutIcon fontSize="small" />
        <span>Logout</span>
      </div>
    </Button>
  );
}
