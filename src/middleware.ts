import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const protectedPaths = ['/settings', '/dashboard', '/app'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.method === 'GET') {
    const { pathname } = req.nextUrl;

    /*
      Redirect when users go to /edit 
      Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
      Note guard this so that it only works when it contains /procs/some-id-link/edit
    */

    if (pathname.endsWith('/edit')) {
      const parts = pathname.split('/').filter(Boolean);

      if (parts[0] === 'procs' && parts[1]) {
        const id = parts[1]; // ← your ID
        const isEdit = parts[parts.length - 1] === 'edit';

        if (isEdit) {
          // rewrite /procs/:id/.../edit → /puck/procs/:id/... (drop /edit)
          const withoutEdit = pathname.replace(/\/edit\/?$/, ''); // or string slice
          return NextResponse.rewrite(new URL(`/puck${withoutEdit}`, req.url));
        }
      }
    }

    // Disable "/puck/[...puckPath]"
    if (pathname.startsWith('/puck')) {
      console.error('Error fetching data:');
      return NextResponse.redirect(new URL('/', req.url));
    }

    /*
      Protect many routes by ensuring users are logged in.
    */

    // define protected prefixes
    const url = req.nextUrl.clone();
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
