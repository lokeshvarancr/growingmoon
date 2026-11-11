import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/state/AppContext';
import ToastProvider from '@/components/shared/ToastProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
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
    <html lang="en" data-scroll-behavior="smooth" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.className} font-sans antialiased bg-gm-ivory text-gm-midnight min-h-screen selection:bg-gm-lavender/30`}
      >
        <AppProvider>
          {children}
          <ToastProvider />
        </AppProvider>
      </body>
    </html>
  );
}
