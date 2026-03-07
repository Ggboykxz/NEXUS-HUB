import { NextResponse, NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API de Session NexusHub
 * Transforme un Token Firebase en cookie de session sécurisé.
 * Attend activement que le profil Firestore soit créé pour garantir que le rôle est connu.
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

    // ATTENTE ACTIVE DU PROFIL (Polling)
    // On vérifie toutes les 500ms pendant 5 secondes si le doc utilisateur existe.
    // Cela évite de créer une session sans rôle, ce qui causerait une boucle de redirection.
    let role = 'reader';
    let profileReady = false;
    
    for (let i = 0; i < 10; i++) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data?.role) {
          role = data.role;
          profileReady = true;
          break;
        }
      }
      // Petite pause avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!profileReady) {
      console.warn(`[Session API] Profil non trouvé pour ${uid} après 5s d'attente.`);
      // On continue quand même en mode 'reader' par défaut pour éviter de bloquer l'utilisateur,
      // mais on log l'avertissement.
    }

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 jours
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ 
      success: true, 
      role,
      profileReady
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
