import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const role = request.auth?.user?.role;

    if (role !== 'ADMIN') {
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
