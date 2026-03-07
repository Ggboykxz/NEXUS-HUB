import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sécurité utilisant le cookie 'nexushub-role' pour les redirections.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get('nexushub-role')?.value || '';
  const isAuthenticated = !!role;

  const isAuthRoute = ['/login', '/signup', '/forgot-password'].some(r => pathname.startsWith(r));
  const isProtectedRoute = ['/dashboard', '/settings', '/messages', '/library', '/profile/me', '/notifications'].some(r => pathname.startsWith(r));
  const isArtistRoute = ['/submit', '/dashboard/creations', '/dashboard/ai-studio', '/dashboard/stats', '/dashboard/world-building'].some(r => pathname.startsWith(r));
  const isAdminRoute = pathname.startsWith('/admin') || (pathname === '/dashboard' && role === 'admin');

  // 1. Redirection pour les connectés accédant à l'auth
  if (isAuthRoute && isAuthenticated) {
    const target = role.startsWith('artist') ? '/dashboard/creations' : '/';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Redirection pour les non-connectés accédant aux zones privées
  if ((isProtectedRoute || isArtistRoute) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protection Artiste
  if (isArtistRoute && !role.startsWith('artist') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Protection Admin
  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|icons|images|manifest.json|.*\\.png$|.*\\.svg$|favicon.ico).*)',
  ],
};
