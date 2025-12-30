
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MyListProvider } from '@/hooks/use-my-list';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Qelo',
  description: 'A cinematic movie streaming experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <MyListProvider>
          <Header />
          <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">{children}</main>
          <Toaster />
        </MyListProvider>
      </body>
    </html>
  );
}
