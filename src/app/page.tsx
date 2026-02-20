/**
 * Fichier neutralisé pour éviter les conflits de routes avec src/app/(app)/page.tsx.
 * La page d'accueil principale est désormais gérée au sein du groupe (app) 
 * pour assurer la cohérence du layout et la réussite du build de production.
 */
export default function RootPageRedirect() {
  return null;
}
