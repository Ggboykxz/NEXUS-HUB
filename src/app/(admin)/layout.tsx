import { Metadata } from 'next';
import AdminLayoutClient from './admin-layout-client';

/**
 * Layout racine du Nexus Core (Admin).
 * Sécurisé contre l'indexation par les moteurs de recherche.
 */
export const metadata: Metadata = {
  title: 'Nexus Core | Administration',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
