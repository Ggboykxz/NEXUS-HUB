import { NextResponse } from 'next/server';

/**
 * Endpoint déprécié. La session est gérée par le SDK Client Firebase
 * et un cookie de rôle synchronisé par le hook useAuth.
 */
export async function POST() {
  return NextResponse.json({ success: true, message: 'Session handled via client SDK' });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('nexushub-role');
  response.cookies.delete('__session');
  return response;
}
