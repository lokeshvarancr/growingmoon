import type { Metadata } from 'next';
import { Newsreader, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/state/AppContext';
import ToastProvider from '@/components/shared/ToastProvider';
import MotionRoot from '@/components/shared/MotionRoot';

const display = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const text = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-text',
});

export const metadata: Metadata = {
  title: 'Growing Moon — Founder Journey Social Platform',
  description: 'Your journey matters before you make it big. Discover relatable founders, document your Journey Passport, and take your next step.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${text.className} font-sans antialiased bg-gm-ivory text-gm-midnight min-h-screen`}
      >
        <MotionRoot>
          <AppProvider>
            {children}
            <ToastProvider />
          </AppProvider>
        </MotionRoot>
      </body>
    </html>
  );
}
