import HeaderFooterWrapper from '@/components/common/header-footer-wrapper';

/**
 * Layout imbriqué pour le groupe (app).
 * Gère l'affichage du Header et du Footer pour toutes les pages de l'application.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HeaderFooterWrapper>
      {children}
    </HeaderFooterWrapper>
  );
}
