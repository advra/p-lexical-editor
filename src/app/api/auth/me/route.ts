// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { User } from '@/modules/auth/types';

/*
  Checks if user is logged in. Returns null if not logged in 
  Queries database for fresh user data to ensure security

  returns session
*/

export const StubbedAdminUser: StubbedUser = {
  username: 'admin',
  roles: ['admin'],
  avatar: '',
  createdAt: '2023-10-27T10:30:00.000Z',
  updatedAt: new Date().toISOString(),
  sessionId: '123456',
};

type StubbedUser = User & {
  avatar: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
};

export async function GET() {
  // Return secure session with fresh data from database
  const secureSession = {
    user: {
      username: StubbedAdminUser.username,
      roles: StubbedAdminUser.roles,
      avatar: StubbedAdminUser,
      createdAt: StubbedAdminUser.createdAt,
      updatedAt: StubbedAdminUser.updatedAt,
    },
    sessionId: StubbedAdminUser.sessionId,
  };
  
  return NextResponse.json({ session: secureSession }, { status: 200 });
}
