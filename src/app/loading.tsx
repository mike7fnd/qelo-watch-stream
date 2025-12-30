import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] w-full bg-muted md:h-[85vh]">
        <div className="relative z-10 flex h-full items-end p-4 md:p-8">
          <div className="container max-w-screen-2xl">
            <div className="max-w-lg space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-lg md:h-14" />
              <Skeleton className="h-6 w-1/2 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-11 w-32 rounded-[30px]" />
                <Skeleton className="h-11 w-32 rounded-[30px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousels Skeleton */}
      <div className="container max-w-screen-2xl space-y-12 py-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/4 rounded-lg" />
            <div className="flex space-x-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="w-1/2 flex-shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
                  <div className="aspect-[2/3]">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
