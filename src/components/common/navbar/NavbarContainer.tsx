'use client';

import Link from "next/link"
import ClientMenu from "./ClientMenu"
import ThemeSwitch from "../theme-switch";

type Props = {
  username: string | null
}

export const NavbarContainer = ({ username }: Props) => {
  return (
    <>
      <div className="w-full px-4 py-2 shadow-sm bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="mr-4 font-semibold"><Link href="/toc" className="text-black dark:text-white">EPROC</Link></div>
          <div className="ml-auto flex gap-2">
            {/* <ThemeSwitch /> */}
            <ClientMenu username={username} />
          </div>
        </div>
      </div>
    </>
  )
}
