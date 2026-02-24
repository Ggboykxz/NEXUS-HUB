import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/components/providers/language-provider';
import { AuthModalProvider } from '@/components/providers/auth-modal-provider';
import HeaderFooterWrapper from '@/components/common/header-footer-wrapper';

export const metadata: Metadata = {
  title: 'NexusHub | Plongez au Cœur des Histoires Africaines',
  description: 'La plateforme de la narration visuelle africaine. Découvrez des webtoons et BD inspirés des cultures du Gabon, du Nigeria, du Sénégal et de toute l\'Afrique.',
  keywords: ['BD africaine', 'Webtoon africain', 'Afrofuturisme', 'Mythologie africaine', 'NexusHub', 'Histoires africaines Gabon'],
  authors: [{ name: 'NexusHub Team' }],
  openGraph: {
    title: 'NexusHub | Hub Créatif de la BD Africaine',
    description: 'Lisez les meilleures œuvres graphiques du continent.',
    url: 'https://nexushub.africa',
    siteName: 'NexusHub',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusHub | BD & Webtoons Africains',
    description: 'La plateforme de la narration visuelle africaine.',
  },
};

export const viewport: Viewport = {
  themeColor: '#D4A843',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden min-h-screen bg-background" suppressHydrationWarning>
        <LanguageProvider>
          <AuthModalProvider>
            <HeaderFooterWrapper>
              {children}
            </HeaderFooterWrapper>
            <Toaster />
          </AuthModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
