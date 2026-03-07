'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Nettoie les cookies de session côté serveur.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('nexushub-role', '', { maxAge: 0, path: '/' });
  revalidatePath('/');
}

/**
 * Informe le serveur du rôle actuel (utilisé par le middleware).
 * Cette action est appelée directement par le client après login/signup.
 */
export async function setRoleCookie(role: string) {
  const cookieStore = await cookies();
  cookieStore.set('nexushub-role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
