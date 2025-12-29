import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // rating out of 10
  className?: string;
}

export function StarRating({ rating, className }: StarRatingProps) {
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));
  const ratingOutOfTen = rating > 0 ? rating.toFixed(1) : 'N/A';

  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="flex items-center gap-1 text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
            <Star key={`full-${i}`} className="h-4 w-4 fill-current" />
        ))}
        {halfStar && (
            <div className="relative h-4 w-4">
            <Star className="absolute h-4 w-4 text-white/20" />
            <Star style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} className="absolute h-4 w-4 fill-current" />
            </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
            <Star key={`empty-${i}`} className="h-4 w-4 text-white/20" />
        ))}
       </div>
       <span className="text-sm font-medium">{ratingOutOfTen}</span>
    </div>
  );
}
