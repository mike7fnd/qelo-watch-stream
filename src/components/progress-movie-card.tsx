
import Image from 'next/image';
import Link from 'next/link';
import type { Media } from '@/lib/types';
import { getImageUrl } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';

interface ProgressMovieCardProps {
  movie: Media;
  progress: number;
  className?: string;
}

export function ProgressMovieCard({ movie, progress, className }: ProgressMovieCardProps) {
  const title = 'title' in movie ? movie.title : movie.name;
  const link = `/${movie.media_type === 'tv' ? 'series' : 'movie'}/${movie.id}/play`;
  const imageUrl = getImageUrl(movie.backdrop_path || movie.poster_path || '', 'w500');
  
  return (
    <div className="block relative group">
      <Card className={cn("overflow-hidden rounded-[15px] bg-card shadow-lg transition-all duration-300 ease-in-out md:hover:scale-105 md:hover:z-10", className)}>
        <CardContent className="p-0">
          <div className="aspect-video relative">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover rounded-t-[15px]"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
            <Link href={link}>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-12 w-12 text-white" />
                </div>
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="absolute bottom-0 left-0 right-0 p-2">
          <Progress value={progress} className="h-1 w-full" />
      </div>
    </div>
  );
}
