// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/utils/auth";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json(
    { user: null },
    { status: 200 }
  );

  return NextResponse.json({ user }, { status: 200 });
}
