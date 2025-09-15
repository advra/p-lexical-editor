// src/components/ui/buttons/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import LoginIcon from '@mui/icons-material/Login';

import Button from './Button';

type Props = { handleClose?: () => void };

export default function LoginButton({ handleClose }: Props) {
  const router = useRouter();
  const handleLogin = async () => {
    handleClose?.();
    router.push("/login");
  };

  return (
    <div
      className='w-full rounded-none hover:bg-gray-200 hover:cursor-pointer'
      onClick={handleLogin}
    >
      <div className="pl-2 flex items-center justify-start gap-2 w-full text-left">
        <LoginIcon fontSize="small" />
        <span>Login</span>
      </div>
    </div>
  );
}
