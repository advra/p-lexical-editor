// lib/auth.ts (server)
import { Session, User } from "@/modules/auth/types";
import { cookies } from "next/headers";
// import { verifySessionToken } from "./session";

export async function getUserFromCookie() {
  const cookieValue = (await cookies()).get("user-session")?.value;
  if (!cookieValue) return null;
  // TODO Implement either JWT Session or stateful approach with a database store 
  // const session = await verifySessionToken(cookieValue);
  const session: Session = cookieValue ? JSON.parse(cookieValue) : null;
  console.log("Session is", session);
  if (!session) return null;

  // return minimal info only
  const user: User = {
    username: session.username,
    roles: session.roles ?? [],
    id: session.sessionId ?? null,
  };

  return user;
}
