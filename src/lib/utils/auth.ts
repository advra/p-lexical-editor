// // lib/auth.ts (server)
// import { Session, User } from '@/modules/auth/types';
// import { cookies } from 'next/headers';
// // import { verifySessionToken } from "./session";

// const SESSION_COOKIE = 'user-session';

// // Minimal cookie parser for a raw Cookie header
// function getCookieFromHeader(headers: Headers, name: string): string | null {
//   const raw = headers.get('cookie');
//   if (!raw) return null;
//   const parts = raw.split(/;\s*/);
//   for (const p of parts) {
//     const idx = p.indexOf('=');
//     if (idx === -1) continue;
//     const k = decodeURIComponent(p.slice(0, idx).trim());
//     if (k === name) return decodeURIComponent(p.slice(idx + 1));
//   }
//   return null;
// }

// async function getSessionFromCookie() {
//   const cookieValue = (await cookies()).get('user-session')?.value;
//   if (!cookieValue) return null;
//   // TODO Implement either JWT Session or stateful approach with a database store
//   // const session = await verifySessionToken(cookieValue);
//   const session: Session = cookieValue ? JSON.parse(cookieValue) : null;
//   console.log('Session is', session);
//   if (!session) return null;

//   return session;
// }

// async function getSessionFromHeaders(
//   headers: Headers,
// ): Promise<Session | null> {
//   const cookieValue = getCookieFromHeader(headers, SESSION_COOKIE);
//   if (!cookieValue) return null;
//   try {
//     const session = JSON.parse(cookieValue) as Session;
//     return session ?? null;
//   } catch {
//     return null;
//   }
// }

// /** Optional: a single convenience function that tries headers first, then cookies(). */
// export async function getSession(opts?: {
//   headers?: Headers;
// }): Promise<Session | null> {
//   if (opts?.headers) return getSessionFromHeaders(opts.headers);
//   return getSessionFromCookie();
// }

import { cookies } from 'next/headers';
import type { Session, User } from '@/modules/auth/types';

export async function getUserFromCookie(): Promise<User | null> {
  const raw = (await cookies()).get('user-session')?.value;
  if (!raw) return null;
  const session: User = JSON.parse(raw);
  console.log('PARSED:', session);
  try {
    return session;
  } catch {
    return null;
  }
}
