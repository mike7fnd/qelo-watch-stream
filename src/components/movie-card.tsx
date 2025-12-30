
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
  const imageUrl = getImageUrl(movie.poster_path || '', 'w500');
  
  return (
    <Link href={link} className="block relative group">
      <Card className={cn("overflow-visible rounded-[15px] bg-transparent shadow-lg transition-all duration-300 ease-in-out md:hover:scale-105 md:hover:z-10", className)}>
        <CardContent className="p-0">
          <div className="aspect-[2/3] relative">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover rounded-[15px]"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
             <div 
              className="absolute inset-0 rounded-[15px] opacity-0 group-hover:opacity-70 transition-opacity duration-300"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                transform: 'scale(1) translateZ(0)',
                filter: 'blur(50px)',
                zIndex: -1,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
