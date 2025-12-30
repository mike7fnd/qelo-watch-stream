
import type { Media } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface MovieCarouselProps {
  title: string;
  movies: Media[];
  href?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MovieCarousel({ title, movies, href, className, style }: MovieCarouselProps) {
  if (!movies || movies.length === 0) return null;

  const uniqueMovies = movies.filter((movie, index, self) =>
    index === self.findIndex((m) => (
      m.id === movie.id
    ))
  );

  return (
    <section className={cn("animate-fade-in-up relative", className)} style={style}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-headline text-2xl font-bold">{title}</h2>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span>See All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 py-4">
          {uniqueMovies.map((movie) => (
            <CarouselItem key={movie.id} className="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.28%]">
              <MovieCard movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
