import type { Media } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface MovieCarouselProps {
  title: string;
  movies: Media[];
  className?: string;
  style?: React.CSSProperties;
}

export function MovieCarousel({ title, movies, className, style }: MovieCarouselProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className={cn("animate-fade-in-up group relative", className)} style={style}>
      <h2 className="mb-4 font-headline text-2xl font-bold">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 py-4">
          {movies.map((movie) => (
            <CarouselItem key={movie.id} className="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.28%]">
              <MovieCard movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
