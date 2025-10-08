// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/utils/auth';

/*
  Checks if user is logged in. Returns null if not logged in 

  returns session
*/

export async function GET() {
  const session = await getSessionFromCookie();
  const user = session?.user ?? null;
  return NextResponse.json({ session }, { status: 200 });
}
