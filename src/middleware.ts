import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sécurité centralisé pour NexusHub.
 * Gère les redirections basées sur le cookie '__session'.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('__session');
  const role = request.cookies.get('nexushub-role')?.value || '';

  // Définition des zones d'accès
  const isAuthRoute = ['/login', '/signup', '/forgot-password'].some(r => pathname.startsWith(r));
  const isProtectedRoute = ['/dashboard', '/settings', '/messages', '/library', '/profile/me'].some(r => pathname.startsWith(r));
  const isArtistRoute = ['/submit', '/dashboard/creations', '/dashboard/ai-studio'].some(r => pathname.startsWith(r));
  const isAdminRoute = pathname.startsWith('/admin') || (pathname === '/dashboard' && role === 'admin');

  // 1. Utilisateur déjà connecté -> Rediriger hors des pages d'authentification
  if (isAuthRoute && sessionCookie) {
    const target = role.startsWith('artist') ? '/dashboard/creations' : '/';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Utilisateur non connecté -> Rediriger vers login pour les zones protégées
  if ((isProtectedRoute || isArtistRoute) && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protection spécifique Artiste
  if (isArtistRoute && !role.startsWith('artist') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Protection Admin (Nexus Core)
  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpeg$|.*\\.jpg$|favicon.ico).*)',
  ],
};
