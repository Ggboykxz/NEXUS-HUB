import { NextResponse } from 'next/server';

/**
 * API pour gérer le cookie de session sécurisé (HttpOnly) et le rôle.
 * Empêche l'accès au cookie de session via JavaScript côté client.
 */

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    const response = NextResponse.json({ success: true });
    
    // Cookie de session sécurisé
    response.cookies.set('nexushub-session', 'active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 heures
      path: '/',
    });

    // Cookie de rôle (accessible au middleware pour redirection)
    if (role) {
      response.cookies.set('nexushub-role', role, {
        httpOnly: false, // On le laisse accessible pour des besoins UI éventuels
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('nexushub-session', '', {
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
