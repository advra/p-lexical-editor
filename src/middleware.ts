import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXACT_PROTECTED = ['/']; // home is protected, but only exact "/"
const PREFIX_PROTECTED = ['/settings', '/dashboard', '/app', '/procs'];
const PUBLIC = new Set(['/login', '/signup', '/forgot-password']);

function isAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname)
  );
}

function isProtectedPath(pathname: string) {
  if (PUBLIC.has(pathname)) return false;
  if (EXACT_PROTECTED.includes(pathname)) return true;
  // protect prefix + path boundary
  return PREFIX_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 0) ignore assets/api (unless you want to protect APIs too)
  if (isAsset(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 1) rewrite /procs/.../edit -> /puck/procs/...
  if (pathname.endsWith('/edit')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'procs' && parts[1]) {
      const withoutEdit = pathname.replace(/\/edit\/?$/, '');
      return NextResponse.rewrite(new URL(`/puck${withoutEdit}`, req.url));
    }
  }

  // 2) disallow hitting /puck directly and other redirects
  if (pathname.startsWith('/puck')) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  // 2) disallow hitting /puck directly
  if (pathname === '/procs') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  // 3) if already on /login and logged in, send home (optional nicety)
  if (pathname === '/login') {
    const token = req.cookies.get('user-session')?.value;
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4) protect routes
  if (isProtectedPath(pathname)) {
    const token = req.cookies.get('user-session')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname + search); // return here after login
      return NextResponse.redirect(url);
    }
    // (optional) verify token here
  }

  return NextResponse.next();
}

// Limit where middleware runs (skips most static assets by default)
export const config = {
  matcher: [
    '/((?!_next/|static/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
};
