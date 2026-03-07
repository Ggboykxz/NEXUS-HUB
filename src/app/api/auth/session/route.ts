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
    // C'est crucial pour que le rôle soit disponible pour le middleware immédiatement
    let role = 'reader';
    let profileExists = false;
    let attempts = 0;
    
    while (attempts < 10 && !profileExists) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists && userDoc.data()?.role) {
        role = userDoc.data()?.role;
        profileExists = true;
        break;
      }
      await new Promise(r => setTimeout(r, 500));
      attempts++;
    }

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 jours
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true, role, profileReady: profileExists });

    // Firebase App Hosting et les règles de sécurité exigent souvent le nom '__session'
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    // On stocke le rôle dans un cookie accessible (en lecture seule pour le middleware)
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
