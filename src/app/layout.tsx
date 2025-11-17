import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import './global.css';
import { NextThemeProvider } from './theme-provider';
import { TRPCReactProvider } from '@/trpc/client';
import { UserProvider } from '@/context/UserContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Eproc',
  description: 'EProc by Bixby Dev Team',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextThemeProvider>
          <TRPCReactProvider>
            <UserProvider>{children}</UserProvider>
          </TRPCReactProvider>
          <Toaster bottom-right />
        </NextThemeProvider>
      </body>
    </html>
  );
}
