
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Tv, List, Film, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/series', label: 'TV Shows', icon: Tv },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/my-list', label: 'My List', icon: List },
  { href: '/search', label: 'Search', icon: Search },
];

function isNavItemActive(pathname: string, itemHref: string) {
    if (itemHref === '/') {
        return pathname === itemHref;
    }
    if (itemHref === '/movies') {
        return pathname.startsWith('/movies') || pathname.startsWith('/movie');
    }
    if (itemHref === '/series') {
        return pathname.startsWith('/series');
    }
    return pathname.startsWith(itemHref);
}

function DesktopNav() {
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);

    const activeItem = mainNavItems.find(item => isNavItemActive(pathname, item.href));

    useEffect(() => {
        const activeElement = navRef.current?.querySelector(`a[data-active='true']`) as HTMLElement | null;
        if (activeElement) {
            setIndicatorStyle({
                left: activeElement.offsetLeft,
                width: activeElement.offsetWidth,
            });
        } else {
            setIndicatorStyle(null);
        }
    }, [pathname, activeItem]);
    
    return (
        <nav className="hidden md:flex items-center justify-center">
            <div 
                ref={navRef}
                className="relative flex items-center gap-2 rounded-full bg-black/30 p-1.5 backdrop-blur-md"
            >
                {activeItem && indicatorStyle && (
                    <span
                        className="absolute inset-y-1.5 h-8 rounded-full bg-foreground transition-all duration-500 ease-spring"
                        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
                    />
                )}
                {mainNavItems.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-active={isActive}
                            className={cn(
                                'relative h-8 px-3 flex items-center justify-center rounded-full text-sm transition-colors z-10',
                                isActive ? 'text-background font-normal' : 'text-foreground hover:bg-white/10 font-light'
                            )}
                        >
                           {item.label === 'Search' ? <Search className="h-4 w-4" /> : item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    )
}

function MobileNavItem({ item }: { item: typeof mainNavItems[0] }) {
  const pathname = usePathname();
  const isActive = isNavItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        'relative h-10 w-10 flex items-center justify-center rounded-full text-sm transition-colors',
        isActive ? 'bg-foreground text-background' : 'text-foreground hover:text-foreground/80 font-light'
      )}
    >
      <item.icon className="h-5 w-5" />
    </Link>
  );
}


function MobileNav() {
    return (
        <nav className="flex items-center justify-between md:hidden">
            <Link href="/" className="z-10">
                <Clapperboard className="h-6 w-6 text-primary" />
            </Link>
             <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full bg-black/30 p-1.5 backdrop-blur-md">
                    {mainNavItems.map((item) => (
                        <MobileNavItem key={item.href} item={item} />
                    ))}
                </div>
            </div>
        </nav>
    )
}

function NavPlaceholder() {
  return (
    <div className="flex h-12 w-full items-center justify-center md:h-11">
      {/* Mobile placeholder */}
      <div className="h-6 w-6 text-primary md:hidden" />
    </div>
  );
}

export function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (pathname.includes('/play')) {
    return null;
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:pt-6">
        <div className="container max-w-screen-2xl">
            {isClient ? (isMobile ? <MobileNav /> : <DesktopNav />) : <NavPlaceholder />}
        </div>
    </header>
  );
}
