import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('x-route-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/|_next$|favicon\\.ico$|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
};
