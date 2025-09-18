import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '@/trpc/routers/_app';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { Session } from '@/modules/auth/types';
import { createTRPCContext } from '@/trpc/init';

export function readUsers() {
  const p = path.join(process.cwd(), 'data', 'users.json');
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const caller = appRouter.createCaller(await createTRPCContext());
  const user = await caller.users.login({ username, password });
  const sessionId = crypto.randomUUID();

  // For now, we'll just set a cookie with the username and role
  const response = NextResponse.json({ message: 'Login successful' });

  // Set a single HTTP-only cookie with user info + session ID
  const cookieData: Session = {
    username: user.username,
    roles: user.roles,
    sessionId,
  };

  response.cookies.set('user-session', JSON.stringify(cookieData), {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });

  console.log(`XXXXX LOGIN sessionId ${sessionId}`);

  return response;
}
