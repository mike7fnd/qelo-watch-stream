
'use client';

import React, { useState, useEffect } from 'react';
import type { Media } from '@/lib/types';
import { getMovieDetails, getTvShowDetails } from '@/lib/tmdb';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ProgressMovieCard } from './progress-movie-card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface WatchedItem {
  id: string;
  progress: number;
  mediaType: 'movie' | 'tv';
}

export function ContinueWatching({ className, style }: { className?: string; style?: React.CSSProperties; }) {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProgressFromLocalStorage = () => {
      const watched: WatchedItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('qelo-progress-')) {
          const progress = JSON.parse(localStorage.getItem(key) || '0');
          if (progress > 5 && progress < 95) {
            const rawId = key.replace('qelo-progress-', '');
            // Simple check for tv show (contains season/episode) vs movie
            const mediaType = rawId.includes('-s') ? 'tv' : 'movie';
            const id = mediaType === 'tv' ? rawId.split('-s')[0] : rawId;
            // Avoid duplicates
            if (!watched.some(item => item.id === id)) {
                watched.push({ id, progress, mediaType });
            }
          }
        }
      }
      return watched.sort((a,b) => b.progress - a.progress);
    };
    setItems(getProgressFromLocalStorage());
  }, []);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const mediaPromises = items.map(item => {
        if (item.mediaType === 'movie') {
          return getMovieDetails(item.id).then(m => ({ ...m, media_type: 'movie' as const }));
        } else {
          return getTvShowDetails(item.id).then(s => ({ ...s, media_type: 'tv' as const }));
        }
      });

      try {
        const results = await Promise.all(mediaPromises);
        setMedia(results);
      } catch (error) {
        console.error("Failed to fetch media details for continue watching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaDetails();
  }, [items]);
  
  if (loading || media.length === 0) return null;

  return (
    <section className={cn("animate-fade-in-up relative", className)} style={style}>
        <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold">Continue Watching</h2>
        </div>
        <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4 py-4">
            {media.map((item) => {
                const watchedItem = items.find(i => i.id === String(item.id));
                if (!watchedItem) return null;
                return (
                    <CarouselItem key={item.id} className="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.28%]">
                        <ProgressMovieCard movie={item} progress={watchedItem.progress} />
                    </CarouselItem>
                );
            })}
            </CarouselContent>
        </Carousel>
    </section>
  );
}

