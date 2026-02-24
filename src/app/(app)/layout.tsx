import Header from '@/components/common/header';
import Footer from '@/components/common/footer';

/**
 * Layout pour les pages principales de l'application.
 * Contient le Header et le Footer partagés.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
