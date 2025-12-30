'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className={cn('absolute top-4 left-4 z-50 h-12 w-12 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white md:top-6 md:left-24', className)}
      aria-label="Go back"
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
}
