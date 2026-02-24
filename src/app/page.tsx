/**
 * Fichier neutralisé pour éviter le conflit de "Parallel Pages".
 * La page d'accueil réelle se trouve dans src/app/(app)/page.tsx
 * pour bénéficier du layout avec Header et Footer.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  return null; // Next.js privilégiera (app)/page.tsx si ce fichier est vide d'export de composant UI ou géré par redirect
}
