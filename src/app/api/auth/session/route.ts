import { NextResponse, NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API de Session NexusHub
 * Transforme un Token Firebase en cookie de session sécurisé.
 * Utilise le nom de cookie '__session' requis par Firebase App Hosting.
 */
export async function POST(request: NextRequest) {
  const { adminAuth, adminDb } = getAdminServices();
  
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Authorization header missing' }, { status: 401 });
  }

  const idToken = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Attente stratégique pour laisser Firestore se synchroniser
    await new Promise(resolve => setTimeout(resolve, 500));

    // Récupération du rôle pour le cookie middleware
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : 'reader';

    // Session de 14 jours
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ 
      success: true, 
      role
    });

    // Configuration du cookie de session principal
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    // Cookie de rôle pour le middleware (accessible au client)
    response.cookies.set('nexushub-role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Authentication failed' 
    }, { status: 403 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('__session');
  response.cookies.delete('nexushub-role');
  return response;
}
