import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* Header Skeleton */}
      <div className="fixed top-0 z-40 w-full border-b border-border/40 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-10 w-full max-w-xs rounded-md" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="relative h-[60vh] w-full md:h-screen -mt-16 md:mt-0">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:bg-gradient-to-r md:from-background md:via-background/70 md:to-transparent" />
        <div className="relative z-10 flex h-full items-end pb-10">
          <div className="container max-w-screen-2xl">
            <div className="max-w-lg space-y-3 md:space-y-4">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-10 w-3/4 rounded-lg md:h-16" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <div className="flex items-center gap-3 pt-4">
                <Skeleton className="h-12 w-36 rounded-[30px]" />
                <Skeleton className="h-12 w-36 rounded-[30px]" />
                <Skeleton className="h-11 w-11 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousels Skeleton */}
      <div className="container max-w-screen-2xl space-y-12 py-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/4 rounded-lg" />
            <div className="flex space-x-4">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-1/2 flex-shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 2xl:basis-[14.28%]">
                  <div className="aspect-[2/3]">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
         <div className="space-y-4">
            <Skeleton className="h-8 w-1/4 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="aspect-video">
                        <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
