
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
}

export function Paginator({ currentPage, totalPages }: PaginatorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };
  
  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      router.push(createPageURL(page));
    }
  };

  const pages = [];
  const MAX_PAGES_SHOWN = 5;
  const clampedTotalPages = Math.min(totalPages, 500);

  if (clampedTotalPages <= MAX_PAGES_SHOWN) {
    for (let i = 1; i <= clampedTotalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(clampedTotalPages - 1, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (currentPage < clampedTotalPages - 2) {
      pages.push('...');
    }
    pages.push(clampedTotalPages);
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Button variant="ghost" size="icon" disabled={currentPage <= 1} onClick={() => handlePageClick(currentPage - 1)} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === 'number' ? (
              <Button
                key={`${page}-${index}`}
                onClick={() => handlePageClick(page)}
                variant={currentPage === page ? 'default' : 'ghost'}
                className={cn('h-9 w-9 p-0 rounded-full', {
                  'font-bold': currentPage === page,
                })}
              >
                {page}
              </Button>
          ) : (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          )
        )}
      </div>
       <Button variant="ghost" size="icon" disabled={currentPage >= clampedTotalPages} onClick={() => handlePageClick(currentPage + 1)} className="rounded-full">
          <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
