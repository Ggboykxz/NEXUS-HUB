import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de sécurité pour protéger les routes contre le CSRF
 * et valider les en-headers d'origine sur les méthodes de mutation.
 */
export function middleware(request: NextRequest) {
  const { method, headers } = request;

  // Protection CSRF pour les méthodes de modification
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = headers.get('origin');
    const host = headers.get('host');

    // Vérifie que l'origine de la requête correspond à l'hôte de l'application
    if (origin && host && !origin.includes(host)) {
      return new NextResponse(
        JSON.stringify({ error: 'Accès refusé : origine non autorisée (CSRF protection)' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

// Appliquer le middleware à toutes les routes sauf les assets statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}