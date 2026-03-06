import { NextResponse, NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

// Exchanges a Firebase ID token for a session cookie.
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
    // Verify the ID token and get the user.
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the user's role from Firestore, the single source of truth.
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const role = userDoc.data()?.role || 'reader'; // Default to 'reader' if no role.

    // The session cookie expires in 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true, role });

    // Set the secure, HttpOnly session cookie.
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    // Also set a client-accessible role cookie if needed by the UI.
    response.cookies.set('nexushub-role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Session login error:', error);
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
  }
}

// Deletes the session cookie.
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  // Expire the session cookie.
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Expire the role cookie.
  response.cookies.set('nexushub-role', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}
