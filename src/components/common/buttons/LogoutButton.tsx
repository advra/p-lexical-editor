// src/components/ui/buttons/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';

import Button from './Button';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
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
      className='p-2 hover:bg-gray-200'
      onClick={handleLogout}
    >
      <LogoutIcon fontSize='small' />
    </Button>
  );
}
