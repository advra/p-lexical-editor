// // lib/auth.ts (server)
import { cookies } from 'next/headers';
import type { Session, User } from '@/modules/auth/types';

export async function getSessionFromCookie(): Promise<Session | null> {
  const raw = (await cookies()).get('user-session')?.value; // cookie should be {"user":{...},"sessionId":"..."}
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.user?.username || !parsed?.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}
