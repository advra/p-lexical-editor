'use client';
import Link from 'next/link';
import Image from 'next/image';
import ClientMenu from './ClientMenu';
import useUser from '@/hooks/use-user';

export const NavbarContainer = () => {
  const { user } = useUser();

  return (
    <>
      <div className="w-full px-4 shadow-sm bg-black">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center justify-center align-middle gap-1">
            <div className="relative w-8 h-8">
              <Link href="/dashboard" className="text-white">
                <Image
                  src="/EprocLogo.png"
                  alt="Eproc Logo"
                  fill
                  className="object-contain"
                />
              </Link>
            </div>
            <div>
              <Link href="/dashboard" className="text-white">
                <div className="mr-4 font-semibold">EPROC</div>
              </Link>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            {/* <ThemeSwitch /> */}
            <ClientMenu username={user?.username ?? null} />
          </div>
        </div>
      </div>
    </>
  );
};
