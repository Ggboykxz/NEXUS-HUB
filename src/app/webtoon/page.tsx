/**
 * Ce fichier est converti en Layout pour résoudre le conflit de routage parallèle avec src/app/(app)/webtoon/page.tsx.
 * En Next.js, un layout ne définit pas de route de page, ce qui élimine l'erreur "two parallel pages".
 */
export default function WebtoonRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
