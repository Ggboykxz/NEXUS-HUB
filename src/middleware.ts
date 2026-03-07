import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sécurité centralisé pour NexusHub.
 * Gère les redirections basées sur le cookie '__session' et le rôle utilisateur.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Firebase Hosting exige '__session' pour passer les cookies au serveur
  const sessionCookie = request.cookies.get('__session');
  const role = request.cookies.get('nexushub-role')?.value || '';

  // Définition des zones d'accès
  const isAuthRoute = ['/login', '/signup', '/forgot-password'].some(r => pathname.startsWith(r));
  const isProtectedRoute = ['/dashboard', '/settings', '/messages', '/library', '/profile/me', '/notifications'].some(r => pathname.startsWith(r));
  const isArtistRoute = ['/submit', '/dashboard/creations', '/dashboard/ai-studio', '/dashboard/stats', '/dashboard/world-building'].some(r => pathname.startsWith(r));
  const isAdminRoute = pathname.startsWith('/admin') || (pathname === '/dashboard' && role === 'admin');

  // 1. Redirection pour les utilisateurs déjà connectés accédant aux pages d'auth
  if (isAuthRoute && sessionCookie) {
    const target = role.startsWith('artist') ? '/dashboard/creations' : '/';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Redirection pour les utilisateurs non connectés accédant aux zones protégées
  if ((isProtectedRoute || isArtistRoute) && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    // On garde l'URL d'origine pour rediriger après connexion
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protection spécifique Artiste : redirection vers home si rôle insuffisant
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - icons, images, manifest.json (public assets)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|icons|images|manifest.json|.*\\.png$|.*\\.svg$|favicon.ico).*)',
  ],
};
