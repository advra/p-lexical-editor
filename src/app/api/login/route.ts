import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

export function readUsers() {
  const p = path.join(process.cwd(), 'data', 'users.json');
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const users = readUsers();
  const user = users.find((u: { username: any; }) => u.username === username);
  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const sessionId = crypto.randomUUID();

  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  // For now, we'll just set a cookie with the username and role
  const response = NextResponse.json({ message: 'Login successful' });

  // Set a single HTTP-only cookie with user info + session ID
  const cookieData = {
    username: user.username,
    role: user.role,
    sessionId,
  };

  console.log(`XXXXX LOGIN sessionId ${sessionId}`)

  response.cookies.set('user', JSON.stringify(cookieData), {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
