import { NextResponse, NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API pour échanger un ID Token Firebase contre un cookie de session sécurisé.
 * Attend activement que le document Firestore soit créé pour garantir la cohérence du rôle.
 */
export async function POST(request: NextRequest) {
  const { adminAuth, adminDb } = getAdminServices();
  
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // ATTENTE ACTIVE DU PROFIL FIRESTORE (Max 5 secondes)
    // On s'assure que le document existe avant de créer la session
    let role = 'reader';
    let profileReady = false;
    
    for (let i = 0; i < 10; i++) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists && userDoc.data()?.role) {
        role = userDoc.data()?.role;
        profileReady = true;
        break;
      }
      // Pause de 500ms entre les tentatives
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 jours
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ 
      success: true, 
      role, 
      profileReady 
    });

    // Configuration du cookie de session pour Firebase App Hosting
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    // Stockage du rôle pour le middleware
    response.cookies.set('nexushub-role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Session API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('__session');
  response.cookies.delete('nexushub-role');
  return response;
}
