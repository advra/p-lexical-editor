import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.method === "GET") {
    // Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
    if (req.nextUrl.pathname.endsWith("/edit")) {
      const pathWithoutEdit = req.nextUrl.pathname.slice(
        0,
        req.nextUrl.pathname.length - 5
      );
      const pathWithEditPrefix = `/puck${pathWithoutEdit}`;

      return NextResponse.rewrite(new URL(pathWithEditPrefix, req.url));
    }

    // Disable "/puck/[...puckPath]"
    if (req.nextUrl.pathname.startsWith("/puck")) {
      console.error('Error fetching data:');
      return NextResponse.redirect(new URL("/", req.url));
    }

    /*
      Protect many routes by ensuring users are logged in.
      TODO: Do we want to guard pages?
    */

    // define protected prefixes
    const url = req.nextUrl.clone();
    const protectedPaths = ['/settings', '/toc', '/app'];
    const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p));

    if (isProtected) {
      const token = req.cookies.get('user-session')?.value;
      if (!token) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      // TODO: JWT verify or DB check
      // const valid = await verifySessionToken(token);
      // if (!valid) {
      //   url.pathname = '/login';
      //   return NextResponse.redirect(url);
      // }
    }
  }

  return res;
}
