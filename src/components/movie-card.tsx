import Image from 'next/image';
import Link from 'next/link';
import type { Media } from '@/lib/types';
import { getImageUrl } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Media;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const title = 'title' in movie ? movie.title : movie.name;
  const link = `/${movie.media_type === 'tv' ? 'series' : 'movie'}/${movie.id}`;

  return (
    <Link href={link} className="block group">
      <Card className={cn("overflow-hidden rounded-[15px] bg-transparent shadow-lg transition-all duration-300 ease-in-out md:hover:scale-105 md:hover:z-10 md:hover:shadow-[0_0_25px_5px] md:hover:shadow-white/20", className)}>
        <CardContent className="p-0">
          <div className="aspect-[2/3] relative">
            <Image
              src={getImageUrl(movie.poster_path || '', 'w500')}
              alt={title}
              fill
              className="object-cover rounded-[15px]"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

