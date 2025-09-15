import Link from "next/link";
import { cookies } from "next/headers";
import ClientMenu from "./ClientMenu";
import { NavbarContainer } from "./NavbarContainer";

export default async function Navbar() {
  const cookieValue = (await cookies()).get("user")?.value;
  let username: string | null = null;
  try {
    const session = cookieValue ? JSON.parse(cookieValue) : null;
    username = session?.username ?? null;
  } catch {
    username = null;
  }

  return <NavbarContainer username={username} />;
}
