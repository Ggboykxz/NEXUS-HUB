'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft, UserCircle, LogOut, Settings, ChevronDown, CircleDollarSign, Brush, Library, PenSquare, MoreHorizontal } from 'lucide-react';
import { navLinks, type NavLink } from '@/lib/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../providers/language-provider';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, limit, query, where, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [uniqueGenres, setUniqueGenres] = useState<{name: string, slug: string}[]>([]);

  const [hasMounted, setHasMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimers = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    // Fetch genres from Firestore
    const fetchGenres = async () => {
      try {
        const q = query(collection(db, 'stories'), limit(20));
        const snap = await getDocs(q);
        const genreMap = new Map();
        snap.forEach(doc => {
          const data = doc.data();
          if (data.genre && data.genreSlug) {
            genreMap.set(data.genreSlug, { name: data.genre, slug: data.genreSlug });
          }
        });
        setUniqueGenres(Array.from(genreMap.values()));
      } catch (e) {
        console.error("Error fetching genres:", e);
      }
    };
    fetchGenres();

    // Listen to Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({ id: user.uid, ...userDoc.data() });
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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
                'flex items-center gap-1 hover:text-primary focus:text-primary focus:outline-none transition-colors text-xs',
                isActive ? 'text-foreground font-semibold' : 'text-foreground/80'
              )}
            >
              <span>{link.label}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {link.isGenreDropdown && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/stories">{t('nav.browse')} Tout</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Genres</DropdownMenuLabel>
                  {uniqueGenres.length > 0 ? uniqueGenres.map((genre) => (
                    <DropdownMenuItem key={`header-genre-${genre.slug}`} asChild>
                      <Link href={`/genre/${genre.slug}`}>{genre.name}</Link>
                    </DropdownMenuItem>
                  )) : (
                    <DropdownMenuItem disabled className="text-xs italic text-muted-foreground">Aucun genre trouvé</DropdownMenuItem>
                  )}
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
          'flex items-center gap-2 hover:text-primary transition-colors text-xs',
          isActive ? 'text-foreground font-semibold' : 'text-foreground/80',
          className
        )}
      >
        <span>{link.label}</span>
        {link.badge && (
          <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn(
              "text-[8px] px-1 py-0 h-3",
              link.badge.variant === 'green' ? "bg-emerald-500 border-none" : "border-orange-500/50 text-orange-400"
          )}>
              {link.badge.label}
          </Badge>
        )}
      </Link>
    );
  };

  const visibleLinks = navLinks.slice(0, 5);
  const hiddenLinks = navLinks.slice(5);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className={cn("container flex max-w-7xl items-center px-6 lg:px-12 transition-all", isScrolled ? "h-12" : "h-14")}>
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Accueil NexusHub">
              <span className="font-display font-bold text-lg tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-x-4">
            {visibleLinks.map((link, idx) => (
              <NavLinkRenderer key={`nav-link-${idx}`} link={link} />
            ))}
            
            {hiddenLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {hiddenLinks.map((link, idx) => (
                    <DropdownMenuItem key={`hidden-link-${idx}`} asChild>
                      <Link href={link.href} className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <link.icon className="h-4 w-4 text-muted-foreground" />
                          {link.label}
                        </span>
                        {link.badge && (
                          <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn(
                              "text-[8px] px-1 py-0 h-3",
                              link.badge.variant === 'green' ? "bg-emerald-500 border-none" : "border-orange-500/50 text-orange-400"
                          )}>
                              {link.badge.label}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSearchOpen(true)} aria-label="Ouvrir la recherche">
                <Search className="h-4 w-4" />
              </Button>

              <Button asChild variant="default" size="sm" className="h-8 gap-1 px-3 font-bold shadow-sm shadow-primary/10 text-xs">
                <Link href="/submit">
                  <PenSquare className="h-3 w-3" />
                  <span>{t('nav.submit')}</span>
                </Link>
              </Button>
              
              {!isLoggedIn ? (
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                    <Link href="/signup">{t('nav.signup')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/settings?tab=africoins" className="flex items-center gap-1 hover:bg-muted p-1 rounded-full transition-colors" aria-label="Solde AfriCoins">
                    <CircleDollarSign className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs">{userProfile?.afriCoins || 0}</span>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-7 w-7 rounded-full p-0">
                        <Avatar className="h-7 w-7 border-2 border-primary/20">
                          <AvatarImage src={userProfile?.photoURL} alt={userProfile?.displayName} />
                          <AvatarFallback>{userProfile?.displayName?.slice(0, 2) || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={userProfile?.role?.includes('artist') ? `/artiste/${userProfile?.slug}` : `/profile/${userProfile?.uid}`}><UserCircle className="mr-2 h-4 w-4" />{t('nav.profile')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/library"><Library className="mr-2 h-4 w-4" />{t('nav.library')}</Link>
                      </DropdownMenuItem>
                      {userProfile?.role?.includes('artist') && (
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

            <div className="md:hidden flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSearchOpen(true)} aria-label="Ouvrir la recherche">
                <Search className="h-4 w-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ouvrir le menu">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <ScrollArea className="h-full w-full">
                    <div className="flex flex-col gap-6 px-6 py-8">
                      <Link href="/" className="font-display font-bold text-xl mb-2">NexusHub<span className="text-primary">.</span></Link>
                      
                      <div className="flex flex-col gap-4">
                        <Button asChild variant="default" className="justify-start gap-3 h-11 text-base font-bold shadow-lg shadow-primary/20">
                          <Link href="/submit">
                            <PenSquare className="h-5 w-5" />
                            {t('nav.submit')}
                          </Link>
                        </Button>

                        {!isLoggedIn && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button asChild variant="outline" className="h-10">
                              <Link href="/login">{t('nav.login')}</Link>
                            </Button>
                            <Button asChild className="h-10">
                              <Link href="/signup">{t('nav.signup')}</Link>
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-border/50" />

                      <nav className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2 ml-2">Navigation</p>
                        {navLinks.map((link, idx) => (
                          <div key={`mobile-nav-group-${idx}`} className="flex flex-col gap-1">
                            <Link 
                              href={link.href} 
                              className={cn(
                                "flex items-center justify-between text-sm font-semibold px-3 py-3 hover:bg-muted rounded-xl transition-colors",
                                pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground/80"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <link.icon className={cn("h-4 w-4", pathname === link.href ? "text-primary" : "text-muted-foreground")} />
                                {link.label}
                              </div>
                              {link.badge && (
                                <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn(
                                    "text-[8px] px-1 py-0 h-4",
                                    link.badge.variant === 'green' ? "bg-emerald-500 border-none" : "border-orange-500/50 text-orange-400"
                                )}>
                                    {link.badge.label}
                                </Badge>
                              )}
                            </Link>
                            {link.subLinks && link.subLinks.length > 0 && (
                              <div className="ml-9 flex flex-col gap-1 mb-2">
                                {link.subLinks.map((sub) => (
                                  <Link 
                                    key={`mobile-sub-${sub.href}`} 
                                    href={sub.href} 
                                    className="text-xs py-2 px-2 text-muted-foreground hover:text-primary transition-colors border-l border-border/50"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </nav>

                      <Separator className="bg-border/50" />

                      <div className="flex flex-col gap-4">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground ml-2">Préférences</p>
                        <div className="flex items-center justify-between px-2">
                          <span className="text-sm font-medium text-foreground/80">Langue</span>
                          <LanguageSwitcher />
                        </div>
                        <div className="flex items-center justify-between px-2">
                          <span className="text-sm font-medium text-foreground/80">Thème</span>
                          <ThemeToggle />
                        </div>
                      </div>

                      {isLoggedIn && (
                        <>
                          <Separator className="bg-border/50" />
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2 ml-2">Mon Compte</p>
                            <Link href="/library" className="flex items-center gap-3 text-sm font-semibold px-3 py-3 hover:bg-muted rounded-xl transition-colors text-foreground/80">
                              <Library className="h-4 w-4 text-muted-foreground" />
                              {t('nav.library')}
                            </Link>
                            {userProfile?.role?.includes('artist') && (
                              <Link href="/dashboard/creations" className="flex items-center gap-3 text-sm font-semibold px-3 py-3 hover:bg-muted rounded-xl transition-colors text-foreground/80">
                                <Brush className="h-4 w-4 text-muted-foreground" />
                                {t('nav.workshop')}
                              </Link>
                            )}
                            <Link href="/settings" className="flex items-center gap-3 text-sm font-semibold px-3 py-3 hover:bg-muted rounded-xl transition-colors text-foreground/80">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              {t('nav.settings')}
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-semibold px-3 py-3 hover:bg-destructive/10 rounded-xl transition-colors text-destructive">
                              <LogOut className="h-4 w-4" />
                              {t('nav.logout')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className={cn("w-full items-center gap-2 animate-in fade-in-0", isSearchOpen ? 'flex' : 'hidden')}>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} aria-label="Fermer la recherche">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="h-8 w-full pr-10 rounded-full bg-muted/50 border-none text-xs"
              autoFocus
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-6 w-6">
              <Search className="h-3 w-3" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
