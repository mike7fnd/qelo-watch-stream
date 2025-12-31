'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Tv, List, Film, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from './ui/input';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/series', label: 'TV', icon: Tv },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/my-list', label: 'My List', icon: List },
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

    const desktopNavItems = [...mainNavItems, { href: '/search', label: 'Search', icon: Search }];
    const activeItem = desktopNavItems.find(item => isNavItemActive(pathname, item.href));

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
    }, [pathname]);
    
    return (
        <nav className="hidden md:flex items-center justify-center">
            <div 
                ref={navRef}
                className="relative flex items-center gap-2 rounded-full bg-black/30 p-1 backdrop-blur-md"
            >
                {activeItem && indicatorStyle && (
                    <span
                        className="absolute inset-y-1 h-8 rounded-full bg-white/90 transition-all duration-500 ease-spring"
                        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
                    />
                )}
                {desktopNavItems.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href);
                    const desktopLabel = item.label === 'TV' ? 'TV Shows' : item.label;
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
                           {item.label === 'Search' ? <Search className="h-4 w-4" /> : desktopLabel}
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
      data-active={isActive}
      className={cn(
        'relative z-10 flex h-14 flex-1 flex-col items-center justify-center gap-0.5 p-1 text-xs transition-colors',
        isActive ? 'text-background' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <item.icon className="h-6 w-6" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const navRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const mobileNavItems = mainNavItems;
    const activeItem = mobileNavItems.find(item => isNavItemActive(pathname, item.href));

    useEffect(() => {
        const calculateIndicator = () => {
            if (!navRef.current) return;
            const activeElement = navRef.current.querySelector(`a[data-active='true']`) as HTMLElement | null;
            if (activeElement) {
                const navRect = navRef.current.getBoundingClientRect();
                const elemRect = activeElement.getBoundingClientRect();
                setIndicatorStyle({
                    left: elemRect.left - navRect.left,
                    width: elemRect.width,
                });
            } else {
                setIndicatorStyle(null);
            }
        };

        calculateIndicator();
        window.addEventListener('resize', calculateIndicator);

        return () => window.removeEventListener('resize', calculateIndicator);
    }, [pathname]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsSearchOpen(false);
        }
    };
    
    return (
        <nav className="flex h-8 items-center justify-end md:hidden">
             <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 top-0 z-20 px-4 pt-4"
                    >
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} exit={{ width: 0 }}>
                                <Input
                                    ref={input => input?.focus()}
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-8 w-full rounded-full bg-muted pl-4 pr-10"
                                />
                            </motion.div>
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={() => setIsSearchOpen(true)} className="z-10 text-foreground">
                <Search className="h-6 w-6" />
            </button>
             <div className="fixed bottom-4 left-0 right-0 z-50">
                <div 
                    ref={navRef}
                    className="relative mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full bg-background/80 p-1 backdrop-blur-lg"
                >
                    {activeItem && indicatorStyle && (
                        <span
                            className="absolute inset-y-1 h-[calc(100%-0.5rem)] rounded-full bg-white/90 transition-all duration-500 ease-spring"
                            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
                        />
                    )}
                    {mobileNavItems.map((item) => (
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
