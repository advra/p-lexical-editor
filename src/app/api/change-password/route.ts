// app/api/change-password/route.ts (server)
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

function usersPath() { return path.join(process.cwd(), "data", "users.json"); }
function readUsers() {
  const p = usersPath();
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeUsers(users: any[]) {
  const p = usersPath(), tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), "utf8");
  fs.renameSync(tmp, p);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldPassword, newPassword } = body ?? {};

    // Get the user from the cookie/session instead of client-supplied username
    const cookie = req.cookies.get("user")?.value;
    if (!cookie) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let sessionUser;
    try { sessionUser = JSON.parse(cookie); } catch { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

    const username = sessionUser.username;
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const users = readUsers();
    const idx = users.findIndex((u: any) => u.username === username);
    if (idx === -1) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const user = users[idx];
    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const newHash = await bcrypt.hash(newPassword, 10);
    users[idx] = { ...user, passwordHash: newHash };
    writeUsers(users);

    return NextResponse.json({ message: "Password changed" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
