
'use client';

import { Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TrailerModalProps {
  trailerKey: string;
  buttonClassName?: string;
}

export function TrailerModal({ trailerKey, buttonClassName }: TrailerModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className={cn(buttonClassName)}>
          <Youtube className="mr-2" />
          Watch Trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 border-0">
        <DialogHeader>
            <DialogTitle className="sr-only">Watch Trailer</DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          <iframe
            className="h-full w-full rounded-lg"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
