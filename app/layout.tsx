import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-axion-sans',
  display: 'swap'
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-axion-display',
  display: 'swap'
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-axion-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Vanderson Lindoso | Desenvolvedor Web Full Stack',
  description:
    'Portfólio AXION — projetos em React, TypeScript, PHP, Laravel e mais. Centro de comando do desenvolvedor Vanderson Lindoso.',
  openGraph: {
    title: 'Vanderson Lindoso | Desenvolvedor Web Full Stack',
    description: 'Portfólio com projetos reais publicados no GitHub e Vercel',
    url: 'https://portifolio-eight-kohl-75.vercel.app/',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
