import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { Session } from '@/modules/auth/types';

export function readUsers() {
  const p = path.join(process.cwd(), 'data', 'users.json');
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const users = readUsers();
  console.log('USERS', users);
  const user = users.find((u: { username: any }) => u.username === username);
  if (!user) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    );
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    );
  }

  const sessionId = crypto.randomUUID();

  // For now, we'll just set a cookie with the username and role
  const response = NextResponse.json({ message: 'Login successful' });

  // Set a single HTTP-only cookie with user info + session ID
  const cookieData: Session = {
    username: user.username,
    roles: user.roles,
    sessionId,
  };

  console.log(`XXXXX LOGIN sessionId ${sessionId}`);

  response.cookies.set('user-session', JSON.stringify(cookieData), {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
