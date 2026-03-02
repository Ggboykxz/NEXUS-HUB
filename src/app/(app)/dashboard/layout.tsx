import { Metadata } from 'next';

/**
 * Layout pour les pages du tableau de bord utilisateur.
 * Désactive l'indexation pour protéger les outils de création et les stats.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-in fade-in duration-500">{children}</div>;
}
