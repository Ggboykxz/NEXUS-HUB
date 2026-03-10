import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * API pour gérer les cookies de session Firebase.
 * Permet aux Server Actions de vérifier l'authentification.
 */
export async function POST(request: Request) {
  const { adminAuth } = getAdminServices();
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    // Session de 5 jours
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error("Session API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('nexushub-role');
  response.cookies.delete('__session');
  return response;
}
