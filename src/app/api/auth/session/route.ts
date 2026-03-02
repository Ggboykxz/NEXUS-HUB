import { NextResponse } from 'next/server';

/**
 * API pour gérer le cookie de session sécurisé (HttpOnly).
 * Empêche l'accès au cookie via JavaScript côté client pour protéger contre le XSS.
 */

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('nexushub-session', 'active', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 heures
    path: '/',
  });
  
  return response;
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
  
  return response;
}
