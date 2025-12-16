import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header, Footer, SearchModal, CartDrawer } from '@/components/layout';

export const metadata: Metadata = {
  title: {
    default: 'PariharaOnline - Temple Services & Sacred Prasad',
    template: '%s | PariharaOnline',
  },
  description:
    'Book authentic temple services, pujas, homams, and receive sacred prasad from renowned temples. Serving devotees worldwide with devotion.',
  keywords: [
    'temple services',
    'puja booking',
    'homam',
    'prasad delivery',
    'online temple',
    'hindu rituals',
    'parihara',
  ],
  authors: [{ name: 'PariharaOnline' }],
  creator: 'PariharaOnline',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pariharaonline.com',
    siteName: 'PariharaOnline',
    title: 'PariharaOnline - Temple Services & Sacred Prasad',
    description:
      'Book authentic temple services, pujas, homams, and receive sacred prasad from renowned temples.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PariharaOnline - Temple Services & Sacred Prasad',
    description:
      'Book authentic temple services, pujas, homams, and receive sacred prasad from renowned temples.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <SearchModal />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
