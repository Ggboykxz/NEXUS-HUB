import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/components/providers/language-provider';
import HeaderFooterWrapper from '@/components/common/header-footer-wrapper';

/**
 * Layout imbriqué pour le groupe (app).
 * Ne contient pas de balises <html> ou <body> car elles sont héritées du RootLayout.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <HeaderFooterWrapper>
        {children}
      </HeaderFooterWrapper>
      <Toaster />
    </LanguageProvider>
  );
}
