import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware pour la sécurité et la gestion des routes.
 * 1. Protection des routes basées sur le rôle via le cookie '__session'.
 * 2. Redirection des utilisateurs connectés hors des pages d'authentification.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupérer les cookies de session et de rôle
  // '__session' est le nom standard pour Firebase Hosting SSR
  const sessionCookie = request.cookies.get('__session');
  const role = request.cookies.get('nexushub-role')?.value || '';

  // Définition des routes
  const protectedRoutes = ['/dashboard', '/settings', '/messages', '/library', '/profile'];
  const artistRoutes = ['/submit', '/dashboard/creations', '/dashboard/ai-studio'];
  const authRoutes = ['/login', '/signup', '/forgot-password'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isArtistRoute = artistRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // --- LOGIQUE DE REDIRECTION ---

  // 1. Déjà connecté -> Pas besoin de voir les pages d'auth
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Non connecté -> Redirection vers login pour les routes protégées
  if ((isProtectedRoute || isArtistRoute) && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protection spécifique Artistes
  if (isArtistRoute && !role.startsWith('artist')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpeg$|.*\\.jpg$|favicon.ico).*)',
  ],
};
