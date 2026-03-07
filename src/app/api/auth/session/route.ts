import { NextResponse, NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API de Session NexusHub
 * Transforme un Token Firebase en cookie de session sécurisé instantanément.
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

    // On récupère le rôle immédiatement sans boucle d'attente
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : 'reader';

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 jours
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ 
      success: true, 
      role
    });

    // Configuration du cookie de session (obligatoire pour Firebase App Hosting)
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    // Stockage du rôle dans un cookie accessible au middleware
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
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('__session');
  response.cookies.delete('nexushub-role');
  return response;
}
