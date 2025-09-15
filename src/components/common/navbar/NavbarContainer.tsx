'use client';
import Link from "next/link"
import ClientMenu from "./ClientMenu"
import useUser from "@/hooks/use-user";

export const NavbarContainer = () => {
  const { user } = useUser();
  console.log("user is ", user);

  return (
    <>
      <div className="w-full px-4 py-2 shadow-sm bg-black">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="mr-4 font-semibold">
            <Link href="/toc" className="text-white">EPROC</Link>
          </div>
          <div className="ml-auto flex gap-2">
            {/* <ThemeSwitch /> */}
            <ClientMenu username={user?.username ?? null} />
          </div>
        </div>
      </div>
    </>
  )
}
