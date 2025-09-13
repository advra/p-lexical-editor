import { NextRequest, NextResponse } from 'next/server';

const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'operator' },
  { username: 'viewer', password: 'viewer123', role: 'viewer' },
];

// Also allow GET if you want a simple browser check:
export async function GET() {
  return NextResponse.json({ message: 'pong' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

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
