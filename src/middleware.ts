import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware pour la sécurité et la gestion des routes.
 * 1. Protection des routes basées sur le rôle via un cookie de session vérifié.
 * 2. Redirection des utilisateurs connectés hors des pages d'authentification.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupérer les cookies de session et de rôle
  // Le cookie 'session' est HttpOnly et sécurisé, défini par notre API.
  // Le cookie 'nexushub-role' est accessible côté client.
  const sessionCookie = request.cookies.get('session');
  const role = request.cookies.get('nexushub-role')?.value || '';

  // Définition des routes avec leurs exigences d'accès
  const protectedRoutes = ['/dashboard', '/settings', '/messages', '/library', '/profile'];
  const artistRoutes = ['/submit', '/dashboard/creations', '/dashboard/ai-studio'];
  const authRoutes = ['/login', '/signup', '/forgot-password'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isArtistRoute = artistRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // --- LOGIQUE DE REDIRECTION ---

  // 1. Si l'utilisateur est sur une route d'authentification mais est déjà connecté,
  // le rediriger vers la page d'accueil.
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Si l'utilisateur essaie d'accéder à une route protégée (standard ou artiste)
  // sans session, le rediriger vers la page de connexion.
  if ((isProtectedRoute || isArtistRoute) && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // Garder en mémoire la page de destination
    return NextResponse.redirect(loginUrl);
  }

  // 3. Si l'utilisateur essaie d'accéder à une route d'artiste mais n'a pas le bon rôle,
  // le rediriger vers une page d'erreur ou la page d'accueil.
  if (isArtistRoute && !role.startsWith('artist')) {
    // Note: on pourrait rediriger vers une page `/unauthorized` à l'avenir.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si aucune des conditions ci-dessus n'est remplie, la requête est autorisée.
  return NextResponse.next();
}

export const config = {
  /*
   * Faire correspondre tous les chemins de requête, à l'exception de ceux qui commencent par :
   * - api (routes API)
   * - _next/static (fichiers statiques)
   * - _next/image (optimisation d'images)
   * - favicon.ico (icône de favori)
   * Cela évite d'exécuter le middleware sur des ressources non pertinentes.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|.*\.png$|.*\.svg$|.*\.jpeg$|.*\.jpg$|favicon.ico).*)',
  ],
};
