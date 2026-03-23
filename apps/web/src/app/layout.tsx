import type { Metadata } from 'next';
import { Bebas_Neue, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Providers } from '@/components/providers/providers';
import { FloatingAdminButton } from '@/components/layout/floating-admin-button';
import './globals.css';

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'MLB Authentic',
  description: 'Premium MLB jersey storefront built with Next.js and NestJS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebas.variable} ${manrope.variable}`}>
      <body className="font-sans text-scoreboard antialiased">
        <Providers>
          <div className="relative min-h-screen overflow-x-hidden">
            <Navbar />
            <main className="relative">
              {children}
            </main>
            <Footer />
            <FloatingAdminButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}
