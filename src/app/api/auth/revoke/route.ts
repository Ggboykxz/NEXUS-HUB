import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API pour révoquer tous les jetons de rafraîchissement d'un utilisateur.
 * Utilisé pour la déconnexion de tous les appareils.
 */
export async function POST(request: Request) {
  const { adminAuth } = getAdminServices();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 1. Révocation des jetons dans Firebase Auth (Côté Serveur)
    await adminAuth.revokeRefreshTokens(uid);

    const response = NextResponse.json({ 
      success: true, 
      message: 'Toutes les sessions ont été révoquées.' 
    });
    
    // 2. Nettoyage du cookie de session principal
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // 3. Nettoyage du cookie de rôle accessible au client
    response.cookies.set('nexushub-role', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Revocation API Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la révocation des sessions', message: error.message }, 
      { status: 500 }
    );
  }
}
