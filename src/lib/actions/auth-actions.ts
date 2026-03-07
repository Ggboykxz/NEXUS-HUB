'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Nettoie les cookies de session côté serveur.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('nexushub-role', '', { maxAge: 0, path: '/' });
  cookieStore.set('__session', '', { maxAge: 0, path: '/' });
  revalidatePath('/');
}

/**
 * Action pour informer le serveur du rôle actuel (utilisé par le middleware).
 */
export async function setRoleCookie(role: string) {
  const cookieStore = await cookies();
  cookieStore.set('nexushub-role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    sameSite: 'lax'
  });
}
