// app/api/change-password/route.ts (server)
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import z from 'zod';
import { trpc } from '@/trpc/server';
import dbConnect from '@/lib/db/mongodb';
import { UserModel } from '@/modules/user/models/user-model';

const bodySchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { oldPassword, newPassword } = bodySchema.parse(json);

    // Get the user from the cookie/session instead of client-supplied username
    const cookie = req.cookies.get('user-session')?.value;
    if (!cookie)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let sessionUser;
    try {
      sessionUser = JSON.parse(cookie);
    } catch {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const username = sessionUser.username;
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // connect to mongo and select passwords for compare
    await dbConnect();
    const userDocument = await UserModel.findOne({ username }).select(
      '+password',
    );
    if (!userDocument?.password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(oldPassword, userDocument.password);
    if (!ok)
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 },
      );

    const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10) || 10;
    userDocument.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userDocument.save();

    // rotate cookie session for user
    const newSessionId = crypto.randomUUID();
    const newCookie = {
      username: userDocument.username,
      roles: Array.isArray(userDocument.roles)
        ? userDocument.roles
        : userDocument.roles
          ? [userDocument.roles]
          : [],
      sessionId: newSessionId,
    };

    const res = NextResponse.json(
      { message: 'Password changed' },
      { status: 200 },
    );
    res.cookies.set('user-session', JSON.stringify(newCookie), {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ message: 'Password changed' }, { status: 200 });
  } catch (err) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input', issues: err.issues },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
