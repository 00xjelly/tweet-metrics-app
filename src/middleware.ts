import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For now, skip authentication checks
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Only run middleware on api routes that should require auth later
export const config = {
  matcher: '/api/auth/:path*'
};