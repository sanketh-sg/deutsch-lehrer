import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Single-user gate: HTTP Basic Auth, any username, password = APP_PASSWORD.
 * Fails closed if the password is not configured, so a missing env var can
 * never leave the AI endpoints open. Set it in .env.local for local dev.
 */
export function proxy(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return new NextResponse('APP_PASSWORD is not set', { status: 500 });

  let sent = ':';
  try {
    sent = atob((req.headers.get('authorization') ?? '').replace(/^Basic /, ''));
  } catch {} // malformed header falls through to 401
  if (sent.slice(sent.indexOf(':') + 1) === password) return NextResponse.next();

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Deutsch Lehrer"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
