'use client';

import { Users } from 'lucide-react';
import { Header } from '@/components/header';

export default function SharedPage() {
  return (
    <>
      <Header />
      <div className="container max-w-screen-2xl py-8 animate-fade-in-up">
        <h1 className="mb-8 text-3xl font-bold">Shared With You</h1>
        <div className="flex flex-col items-center justify-center gap-4 text-center h-96">
            <Users className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Nothing is shared with you yet</h2>
            <p className="text-muted-foreground">When friends share movies or shows with you, they'll appear here.</p>
        </div>
      </div>
    </>
  );
}
