import Link from "next/link";
import { cookies } from "next/headers";
import ClientMenu from "./ClientMenu";

export default async function Navbar() {
  const cookieValue = (await cookies()).get("user")?.value;
  let username: string | null = null;
  try {
    const session = cookieValue ? JSON.parse(cookieValue) : null;
    username = session?.username ?? null;
  } catch {
    username = null;
  }

  return (
    <nav className="w-full px-4 py-2 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="mr-4 font-semibold"><Link href="/toc">EPUCK</Link></div>
        <div className="ml-auto">
          <ClientMenu username={username} />
        </div>
      </div>
    </nav>
  );
}
