import { redirect } from 'next/navigation';

/**
 * Fichier neutralisé pour éviter les conflits avec src/app/page.tsx
 * Redirige vers la racine pour stabiliser le build Next.js.
 */
export default function AppGroupHomePage() {
  redirect('/');
}
