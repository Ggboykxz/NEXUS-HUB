import type { Metadata, Viewport } from 'next';
import { DM_Sans, Cinzel_Decorative, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/components/providers/language-provider';
import { AuthModalProvider } from '@/components/providers/auth-modal-provider';
import { GenresProvider } from '@/components/providers/genres-provider';
import { QueryProvider } from '@/components/providers/query-provider';

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  weight: ['400', '700', '900'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '600', '700', '900'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'NexusHub | Plongez au Cœur des Histoires Africaines',
  description: 'La plateforme de la narration visuelle africaine. Découvrez des webtoons et BD inspirés des cultures du Gabon et de toute l\'Afrique.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NexusHub',
  },
  formatDetection: {
    telephone: false,
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
    <html
      lang="fr"
      className={`${cinzel.variable} ${playfair.variable} ${dmSans.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className="font-sans antialiased overflow-x-hidden min-h-screen bg-background text-foreground"
        suppressHydrationWarning
      >
        <QueryProvider>
          <LanguageProvider>
            <AuthModalProvider>
              <GenresProvider>
                {children}
                <Toaster />
              </GenresProvider>
            </AuthModalProvider>
          </LanguageProvider>
        </QueryProvider>
        <script src="/register-sw.js" defer></script>
      </body>
    </html>
  );
}
