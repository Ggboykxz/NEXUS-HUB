import { NextResponse, NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API pour échanger un ID Token Firebase contre un cookie de session sécurisé.
 * Utilise le nom de cookie standard '__session' requis par Firebase Hosting.
 */
export async function POST(request: NextRequest) {
  const { adminAuth, adminDb } = getAdminServices();
  
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authorization.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
  }

  try {
    // 1. Vérification du token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Récupération du rôle depuis Firestore (Source de vérité)
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const role = userDoc.data()?.role || 'reader';

    // 3. Création du cookie de session (14 jours)
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true, role });

    // Configuration du cookie de session (HttpOnly, Secure)
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    // Cookie de rôle accessible au client pour le routage immédiat
    response.cookies.set('nexushub-role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Session API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}

/**
 * Suppression des cookies de session lors de la déconnexion.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('nexushub-role', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}
