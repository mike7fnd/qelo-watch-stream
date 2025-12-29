
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MyListProvider } from '@/hooks/use-my-list';
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
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <MyListProvider>
          <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden md:pl-16">{children}</main>
          </div>
          <Toaster />
        </MyListProvider>
      </body>
    </html>
  );
}
