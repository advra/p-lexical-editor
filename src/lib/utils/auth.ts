// // lib/auth.ts (server)
import { cookies } from 'next/headers';
import type { Session, User } from '@/modules/auth/types';

/*
  Function to verify user when making a request (use in api endpoints and/or server react components)
  Note: If client components need user, simply pass it in as a Prop
*/
export async function getSessionFromCookie(): Promise<Session | null> {
  // cookie should be {"user":{...},"sessionId":"..."}
  const raw = (await cookies()).get('user-session')?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.user?.username || !parsed?.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}
