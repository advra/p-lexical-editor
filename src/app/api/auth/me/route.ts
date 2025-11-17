// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/utils/auth';
import { UserModel } from '@/modules/user/models/user-model';
import dbConnect from '@/lib/db/mongodb';

/*
  Checks if user is logged in. Returns null if not logged in 
  Queries database for fresh user data to ensure security

  returns session
*/

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ session: null }, { status: 200 });
  
  // Connect to database and fetch fresh user data
  await dbConnect();
  const user = await UserModel.findOne({ username: session.user.username }).lean();
  if (!user) return NextResponse.json({ session: null }, { status: 200 });
  
  // Return secure session with fresh data from database
  const secureSession = {
    user: {
      username: user.username,
      roles: user.roles,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    sessionId: session.sessionId
  };
  
  return NextResponse.json({ session: secureSession }, { status: 200 });
}
