'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft, Bell, UserCircle, LogOut, Settings, ChevronDown, CircleDollarSign, Brush, TrendingUp, ListMusic, Library, PenSquare } from 'lucide-react';
import { navLinks, type NavLink } from '@/lib/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stories, artists } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../providers/language-provider';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);

  const [hasMounted, setHasMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimers = useRef<{ [key: string]: any }>({});

  const uniqueGenres = useMemo(() => {
    const genreMap = new Map();
    stories.forEach(s => {
      if (!genreMap.has(s.genreSlug)) {
        genreMap.set(s.genreSlug, { name: s.genre, slug: s.genreSlug });
      }
    });
    return Array.from(genreMap.values());
  }, []);

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const handleStorageChange = () => {
      const status = localStorage.getItem('isLoggedIn') === 'true';
      const type = localStorage.getItem('accountType');
      const id = localStorage.getItem('userId');
      setIsLoggedIn(status);
      setIsArtist(status && type === 'artist');
      setUserId(status ? id : null);
      if (status && type === 'artist') {
        const artist = artists.find(a => a.id === id);
        setUserSlug(artist?.slug || null);
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginStateChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChange', handleStorageChange);
    };
  }, [hasMounted]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accountType');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('loginStateChange')); 
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const NavLinkRenderer = ({ link, className } : { link: NavLink, className?: string }) => {
    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
    
    if (link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
      return (
        <DropdownMenu open={openDropdown === link.label} onOpenChange={(open) => setOpenDropdown(open ? link.label : null)}>
          <div 
            onMouseEnter={() => {
              if (dropdownTimers.current[link.label]) clearTimeout(dropdownTimers.current[link.label]);
              setOpenDropdown(link.label);
            }} 
            onMouseLeave={() => {
              dropdownTimers.current[link.label] = setTimeout(() => setOpenDropdown(null), 200);
            }} 
            className={cn("flex items-center", className)}
          >
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-1 hover:text-primary focus:text-primary focus:outline-none transition-colors',
                isActive ? 'text-foreground font-semibold' : 'text-foreground/80'
              )}
            >
              <span>{link.label}</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {link.isGenreDropdown && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/stories">{t('nav.browse')} Tout</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Genres</DropdownMenuLabel>
                  {uniqueGenres.map((genre) => (
                    <DropdownMenuItem key={`header-genre-${genre.slug}`} asChild>
                      <Link href={`/genre/${genre.slug}`}>{genre.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {link.subLinks?.map((sub) => (
                <DropdownMenuItem key={`sublink-${sub.href}`} asChild>
                  <Link href={sub.href}>{sub.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      );
    }

    return (
      <Link
        href={link.href}
        className={cn(
          'flex items-center gap-2 hover:text-primary transition-colors',
          isActive ? 'text-foreground font-semibold' : 'text-foreground/80',
          className
        )}
      >
        <span>{link.label}</span>
        {link.badge && (
          <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn(
              "text-[9px] px-1 py-0 h-3.5",
              link.badge.variant === 'green' ? "bg-emerald-500 border-none" : "border-orange-500/50 text-orange-400"
          )}>
              {link.badge.label}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className={cn("container flex max-w-7xl items-center px-6 lg:px-12 transition-all", isScrolled ? "h-14" : "h-16")}>
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Accueil NexusHub">
              <span className="font-display font-bold text-xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-x-5 text-sm font-medium">
            {navLinks.slice(0, 5).map((link, idx) => (
              <NavLinkRenderer key={`nav-link-${idx}`} link={link} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2.5">
              <LanguageSwitcher />
              <ThemeToggle />
              
              <Button asChild variant="default" size="sm" className="h-9 gap-1.5 px-3.5 font-bold shadow-md shadow-primary/10">
                <Link href="/submit">
                  <PenSquare className="h-3.5 w-3.5" />
                  <span>{t('nav.submit')}</span>
                </Link>
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsSearchOpen(true)} aria-label="Ouvrir la recherche">
                <Search className="h-4.5 w-4.5" />
              </Button>
              
              {!isLoggedIn ? (
                <div className="flex items-center gap-1.5">
                  <Button asChild variant="ghost" size="sm" className="h-9 px-3">
                    <Link href="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-9 px-3">
                    <Link href="/signup">{t('nav.signup')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link href="/settings?tab=africoins" className="flex items-center gap-1 hover:bg-muted p-1 rounded-full transition-colors" aria-label="Solde AfriCoins">
                    <CircleDollarSign className="h-4.5 w-4.5 text-primary" />
                    <span className="font-bold text-xs">150</span>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                          <AvatarImage src="https://images.unsplash.com/photo-1557053910-d9eadeed1c58" alt="Profil" />
                          <AvatarFallback>LD</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={isArtist ? `/artiste/${userSlug}` : `/profile/${userId}`}><UserCircle className="mr-2 h-4 w-4" />{t('nav.profile')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/library"><Library className="mr-2 h-4 w-4" />{t('nav.library')}</Link>
                      </DropdownMenuItem>
                      {isArtist && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/creations"><Brush className="mr-2 h-4 w-4" />{t('nav.workshop')}</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/settings"><Settings className="mr-2 h-4 w-4" />{t('nav.settings')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />{t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsSearchOpen(true)} aria-label="Ouvrir la recherche">
                <Search className="h-4.5 w-4.5" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Ouvrir le menu">
                    <Menu className="h-4.5 w-4.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col gap-5 pt-8">
                    <Link href="/" className="font-display font-bold text-xl">NexusHub<span className="text-primary">.</span></Link>
                    <nav className="flex flex-col gap-3">
                      <Button asChild variant="default" className="justify-start gap-3 h-11 text-base">
                        <Link href="/submit">
                          <PenSquare className="h-4.5 w-4.5" />
                          {t('nav.submit')}
                        </Link>
                      </Button>
                      {navLinks.map((link, idx) => (
                        <Link key={`mobile-nav-${idx}`} href={link.href} className="text-base font-medium px-2 py-1.5 hover:bg-muted rounded-lg transition-colors">{link.label}</Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className={cn("w-full items-center gap-2 animate-in fade-in-0", isSearchOpen ? 'flex' : 'hidden')}>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} aria-label="Fermer la recherche">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="h-9 w-full pr-10 rounded-full bg-muted/50 border-none text-sm"
              autoFocus
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-7 w-7">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}