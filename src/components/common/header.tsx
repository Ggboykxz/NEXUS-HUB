'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft, Bell, UserCircle, LogOut, Settings, ChevronDown, CircleDollarSign, Brush, TrendingUp, MoreVertical, ListMusic, Award, PenSquare, Library } from 'lucide-react';
import { navLinks, type NavLink } from '@/lib/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeToggle } from './theme-toggle';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../providers/language-provider';
import { LanguageSwitcher } from './language-switcher';

const DropdownItemRenderer = ({ link }: { link: NavLink }) => {
  const uniqueGenres = [...new Set(stories.map(s => ({ name: s.genre, slug: s.genreSlug })))];
  const { t } = useTranslation();

  if (link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
      return (
          <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>{link.label}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                      {link.isGenreDropdown && (
                          <>
                              <DropdownMenuItem asChild>
                                  <Link href="/stories">Toutes les œuvres</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {uniqueGenres.map((genre) => (
                                  <DropdownMenuItem key={genre.slug} asChild>
                                      <Link href={`/genre/${genre.slug}`}>{genre.name}</Link>
                                  </DropdownMenuItem>
                              ))}
                          </>
                      )}
                      {link.subLinks && link.subLinks.map((subLink) => (
                          <DropdownMenuItem key={subLink.href} asChild>
                              <Link href={subLink.href}>{subLink.label}</Link>
                          </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
              </DropdownMenuPortal>
          </DropdownMenuSub>
      );
  }
  return (
      <DropdownMenuItem asChild className="flex justify-between items-center">
          <Link href={link.href} className="w-full flex justify-between items-center">
            <span>{link.label}</span>
            {link.badge && (
                <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn(
                    "text-[10px] px-1.5 py-0 h-4",
                    link.badge.variant === 'green' ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "border-orange-500/50 text-orange-500"
                )}>
                    {link.badge.label}
                </Badge>
            )}
          </Link>
      </DropdownMenuItem>
  );
};

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
  const dropdownTimers = useRef<{ [key: string]: any }>({}).current;

  const handleDropdownEnter = (label: string) => {
      if (dropdownTimers[label]) {
          clearTimeout(dropdownTimers[label]);
      }
      setOpenDropdown(label);
  };

  const handleDropdownLeave = (label: string) => {
      dropdownTimers[label] = setTimeout(() => {
          setOpenDropdown(null);
      }, 200);
  };

  const uniqueGenres = [...new Set(stories.map(s => ({ name: s.genre, slug: s.genreSlug })))];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const handleStorageChange = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      const accountType = localStorage.getItem('accountType');
      const storedUserId = localStorage.getItem('userId');
      
      setIsLoggedIn(loggedInStatus);
      setIsArtist(loggedInStatus && accountType === 'artist');
      setUserId(loggedInStatus ? storedUserId : null);

      if (loggedInStatus && accountType === 'artist') {
          const artist = artists.find(a => a.id === storedUserId);
          setUserSlug(artist?.slug || null);
      } else {
          setUserSlug(null);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accountType');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('loginStateChange')); 
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getTranslatedLabel = (link: NavLink) => {
    switch(link.href) {
      case '/stories': return t('nav.browse');
      case '/rankings': return t('nav.rankings');
      case '/artists': return t('nav.artists');
      case '/forums': return t('nav.forums');
      case '/shop': return t('nav.shop');
      case '/submit': return link.badge?.variant === 'green' ? t('nav.pro') : t('nav.draft');
      default: return link.label;
    }
  };

  const NavLinkRenderer = ({ link, className } : { link: NavLink, className?: string }) => {
    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
    const label = getTranslatedLabel(link);
  
    if (link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
      return (
        <DropdownMenu open={openDropdown === link.label} onOpenChange={(isOpen) => setOpenDropdown(isOpen ? link.label : null)}>
          <div onMouseEnter={() => handleDropdownEnter(link.label)} onMouseLeave={() => handleDropdownLeave(link.label)} className={cn("flex items-center", className)}>
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-1 hover:text-primary focus:text-primary focus:outline-none transition-colors duration-300',
                '[&>svg]:transition-transform [&>svg]:duration-200 [&[data-state=open]>svg]:rotate-180',
                isActive ? 'text-foreground dark:text-white font-semibold' : ''
              )}
            >
              <span className="flex items-center gap-2">
                {label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {link.isGenreDropdown && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/stories">{t('nav.browse')} All</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Genres</DropdownMenuLabel>
                  {uniqueGenres.map((genre) => (
                    <DropdownMenuItem key={genre.slug} asChild>
                      <Link href={`/genre/${genre.slug}`}>{genre.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {link.subLinks && link.subLinks.map((subLink) => (
                  <DropdownMenuItem key={subLink.href} asChild>
                    <Link href={subLink.href}>{subLink.label}</Link>
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
          'flex items-center gap-2 hover:text-primary transition-colors duration-300',
          isActive ? 'text-foreground dark:text-white font-semibold' : '',
          className
        )}
      >
        <span>{label}</span>
        {link.badge && (
          <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn(
              "text-[10px] px-1.5 py-0 h-4 ml-1",
              link.badge.variant === 'green' ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "border-orange-500/50 text-orange-500"
          )}>
              {link.badge.label}
          </Badge>
        )}
      </Link>
    );
  }

  const LoggedInNav = (
    <>
      <Link href="/settings?tab=africoins" className="flex items-center gap-1.5 border-r pr-3 mr-1 hover:bg-muted p-2 rounded-md transition-colors">
         <CircleDollarSign className="h-5 w-5 text-primary" />
         <span className="font-semibold text-sm">150</span>
       </Link>
      <Popover>
         <PopoverTrigger asChild>
             <Button variant="ghost" size="icon" className="relative text-foreground/90">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                 </span>
             </Button>
         </PopoverTrigger>
         <PopoverContent align="end" className="w-96">
             <div className="flex justify-between items-center mb-4">
               <h4 className="font-medium leading-none">Notifications</h4>
               <Link href="/notifications" className="text-xs text-primary hover:underline">Voir tout</Link>
             </div>
             <div className="grid gap-4">
               <Link href="/webtoon/les-chroniques-d-orisha" className="group flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-muted transition-colors">
                 <Avatar className="h-10 w-10 border">
                     <AvatarImage src="https://images.unsplash.com/photo-1739513261598-d1025613319b" alt="The Orisha Chronicles" />
                     <AvatarFallback>OC</AvatarFallback>
                 </Avatar>
                 <div>
                     <p className="text-sm">Nouveau chapitre de <span className="font-semibold">The Orisha Chronicles</span> disponible !</p>
                     <p className="text-xs text-muted-foreground">par Jelani Adebayo - il y a 5 minutes</p>
                 </div>
               </Link>
             </div>
         </PopoverContent>
       </Popover>

       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="ghost" className="relative h-10 w-10 rounded-full">
             <Avatar className="h-10 w-10">
               <AvatarImage src="https://images.unsplash.com/photo-1557053910-d9eadeed1c58" alt="Léa Dubois" />
               <AvatarFallback>LD</AvatarFallback>
             </Avatar>
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
           <DropdownMenuLabel className="font-normal">
             <div className="flex flex-col space-y-1">
               <p className="text-sm font-medium leading-none">Léa Dubois</p>
               <p className="text-xs leading-none text-muted-foreground">
                 lea.dubois@example.com
               </p>
             </div>
           </DropdownMenuLabel>
           <DropdownMenuSeparator />
           {userId && <DropdownMenuItem asChild><Link href={isArtist ? `/artiste/${userSlug}` : `/profile/${userId}`}><UserCircle className="mr-2"/>{t('nav.profile')}</Link></DropdownMenuItem>}
           {isLoggedIn && (
             <>
               <DropdownMenuItem asChild><Link href="/library"><Library className="mr-2"/>{t('nav.library')}</Link></DropdownMenuItem>
               <DropdownMenuItem asChild><Link href="/playlists"><ListMusic className="mr-2"/>{t('nav.playlists')}</Link></DropdownMenuItem>
             </>
           )}
           {isArtist && (
               <>
                   <DropdownMenuItem asChild><Link href="/dashboard/creations"><Brush className="mr-2"/>{t('nav.workshop')}</Link></DropdownMenuItem>
                   <DropdownMenuItem asChild><Link href="/dashboard/stats"><TrendingUp className="mr-2"/>{t('nav.stats')}</Link></DropdownMenuItem>
               </>
           )}
           <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2"/>{t('nav.settings')}</Link></DropdownMenuItem>
           <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleLogout} className="cursor-pointer"><LogOut className="mr-2"/>{t('nav.logout')}</DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
    </>
  );

  const LoggedOutNav = (
    <>
      <Button asChild variant="ghost">
        <Link href="/login">{t('nav.login')}</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/signup">{t('nav.signup')}</Link>
      </Button>
      <Button asChild>
        <Link href="/submit">{t('nav.submit')}</Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className={cn("container flex max-w-7xl items-center px-6 lg:px-12 transition-all duration-300", isScrolled ? "h-16" : "h-20")}>
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-x-4 text-sm font-medium tracking-wide text-foreground/80 dark:text-stone-300">
            {navLinks.slice(0, 5).map((link) => (
              <NavLinkRenderer key={link.label} link={link} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                 <LanguageSwitcher />
                 <ThemeToggle />
                 <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                      <Search className="h-5 w-5" />
                  </Button>
                 
                <div className={cn('flex items-center gap-2', (hasMounted && isLoggedIn) ? 'hidden' : 'flex')}>
                    {LoggedOutNav}
                </div>
                <div className={cn('flex items-center gap-2', (hasMounted && isLoggedIn) ? 'flex' : 'hidden')}>
                    {LoggedInNav}
                </div>
              </div>
              
              <div className="md:hidden flex items-center">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="pr-0 bg-background flex flex-col">
                        <div>
                            <Link href="/" className="flex items-center space-x-2 px-4 pt-4 mb-6">
                                <span className="font-display font-bold text-2xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
                            </Link>
                            <nav className="flex flex-col space-y-2 px-4">
                                {navLinks.map((link) => (
                                  <Link key={link.label} href={link.href} className="text-lg font-medium">
                                    {getTranslatedLabel(link)}
                                  </Link>
                                ))}
                            </nav>
                        </div>
                      </SheetContent>
                    </Sheet>
                </div>
          </div>
        </div>

        <div className={cn("w-full items-center gap-2 animate-in fade-in-0", isSearchOpen ? 'flex' : 'hidden')}>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              placeholder={t('nav.search')}
              className="h-10 w-full pr-10 rounded-full"
              autoFocus
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
