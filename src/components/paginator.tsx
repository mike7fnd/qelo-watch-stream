
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  const MAX_PAGES_SHOWN = 5;

  if (totalPages <= MAX_PAGES_SHOWN) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Link href={createPageURL(currentPage - 1)}>
        <Button variant="ghost" size="icon" disabled={currentPage <= 1} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <Link key={`${page}-${index}`} href={createPageURL(page)}>
              <Button
                variant={currentPage === page ? 'default' : 'ghost'}
                className={cn('h-9 w-9 p-0 rounded-full', {
                  'font-bold': currentPage === page,
                })}
              >
                {page}
              </Button>
            </Link>
          ) : (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          )
        )}
      </div>
      <Link href={createPageURL(currentPage + 1)}>
        <Button variant="ghost" size="icon" disabled={currentPage >= totalPages} className="rounded-full">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
