import { Skeleton } from "@/components/ui/skeleton";

export default function SeriesDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Backdrop Skeleton */}
      <div className="relative h-[80vh] w-full md:h-[95vh]">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container relative z-10 -mt-[45vh] max-w-screen-2xl pb-16 md:-mt-[50vh] xl:-mt-[40vh]">
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-3 md:gap-12">
          {/* Poster Skeleton */}
          <div className="flex justify-center md:col-span-1 md:row-start-1">
            <div className="w-1/2 max-w-[200px] flex-shrink-0 md:w-full md:max-w-none">
              <div className="aspect-[2/3] relative">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="flex flex-col justify-end space-y-4 text-center md:col-span-2 md:text-left">
            <Skeleton className="h-10 w-3/4 self-center rounded-lg md:h-14 md:self-start" />
            <Skeleton className="h-6 w-1/2 self-center rounded-lg md:self-start" />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1 md:justify-start">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex w-full flex-col gap-4 pt-4 sm:w-auto sm:flex-row">
              <Skeleton className="h-12 w-full rounded-[30px] sm:w-48" />
              <Skeleton className="h-12 w-full rounded-[30px] sm:w-44" />
            </div>
          </div>
        </div>

        <Skeleton className="my-8 h-px w-full md:my-12" />

        <div className="space-y-12">
          {/* Overview Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4 rounded-lg" />
          </div>

          {/* Cast Carousel Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <div className="flex space-x-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-24 w-24 rounded-full md:h-32 md:w-32" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>

           {/* Season Selector Skeleton */}
          <div className="space-y-6">
            <div className="flex flex-col items-baseline justify-between gap-4 sm:flex-row sm:items-center">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-10 w-full sm:w-[200px] rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col overflow-hidden rounded-lg border bg-card md:flex-row">
                        <Skeleton className="aspect-video w-full md:w-1/3" />
                        <div className="flex w-full flex-col gap-2 p-4">
                            <Skeleton className="h-5 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />
                            <Skeleton className="mt-2 h-4 w-1/2 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}
