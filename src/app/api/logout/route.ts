import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });

  // Remove the cookie by setting it to empty and expired
  response.cookies.set('user', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });

  return response;
}
