import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de sécurité pour NexusHub.
 * 1. Protection contre le CSRF sur les méthodes de mutation.
 * 2. Protection des routes sensibles par session et rôle.
 * 3. Redirection des utilisateurs connectés hors des pages d'auth.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method, headers } = request;

  // --- 1. PROTECTION CSRF ---
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = headers.get('origin');
    const host = headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return new NextResponse(
        JSON.stringify({ error: 'Accès refusé : origine non autorisée (CSRF protection)' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // --- 2. GESTION DE LA SESSION VIA COOKIE ---
  const session = request.cookies.get('nexushub-session');
  const role = request.cookies.get('nexushub-role')?.value || '';

  // Routes nécessitant une authentification simple
  const protectedRoutes = ['/dashboard', '/settings', '/messages', '/library'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Routes nécessitant le rôle ARTISTE
  const artistRoutes = ['/submit', '/dashboard/creations', '/dashboard/ai-studio'];
  const isArtistRoute = artistRoutes.some(route => pathname.startsWith(route));

  // Routes d'authentification (à éviter si déjà connecté)
  const authRoutes = ['/login', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // -- LOGIQUE DE REDIRECTION --

  // 1. Redirection si non connecté sur une route protégée (Simple ou Artiste)
  if ((isProtectedRoute || isArtistRoute) && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirection si connecté mais PAS artiste sur une route d'artiste
  if (isArtistRoute && !role.startsWith('artist')) {
    // On redirige vers la racine si l'utilisateur n'a pas les droits
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Redirection si déjà connecté sur une route d'auth
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
