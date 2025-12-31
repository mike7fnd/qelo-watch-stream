
import Image from 'next/image';
import Link from 'next/link';
import type { CastMember } from '@/lib/types';
import { getImageUrl } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { User } from 'lucide-react';

interface CastCarouselProps {
  cast: CastMember[];
}

export function CastCarousel({ cast }: CastCarouselProps) {
  if (!cast || cast.length === 0) return null;

  const sortedCast = cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 20);

  if (sortedCast.length === 0) return null;
    
  return (
    <section>
      <h2 className="mb-4 font-bold text-2xl tracking-tight">Cast</h2>
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <CarouselContent className="-ml-4 py-2">
          {sortedCast.map((member) => (
            <CarouselItem key={member.id} className="basis-1/3 pl-4 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8 2xl:basis-[12.5%]">
              <Link href={`/person/${member.id}`} className="group block">
                <div className="flex flex-col items-center text-center">
                  <Card className="overflow-hidden rounded-full border-2 border-transparent transition-colors w-32 h-32 md:w-44 md:h-44 group-hover:border-primary">
                    <CardContent className="p-0 h-full w-full">
                      <div className="relative h-full w-full">
                        {member.profile_path ? (
                          <Image
                            src={getImageUrl(member.profile_path, 'w300')}
                            alt={member.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 12.5vw"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <User className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <p className="mt-2 text-base font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.character}</p>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
