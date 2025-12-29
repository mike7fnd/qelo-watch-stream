import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientProviders } from '@/components/client-providers';
import { Sidebar } from '@/components/sidebar';

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <ClientProviders>
          <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden pt-16 md:pt-0 md:pl-16">{children}</main>
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
