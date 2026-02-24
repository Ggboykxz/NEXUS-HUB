
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft, UserCircle, LogOut, Settings, ChevronDown, CircleDollarSign, Brush, Library, PenSquare, MoreHorizontal, Database, Cloud, Zap, Flame } from 'lucide-react';
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
import { useGenres } from '../providers/genres-provider';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { db, auth } from '@/lib/firebase';
import { collection, limit, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

export default function Header() {
  const { t } = useTranslation();
  const { genres: uniqueGenres } = useGenres();
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');

  const [hasMounted, setHasMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const storiesRef = collection(db, 'stories');
    const unsubscribeDb = onSnapshot(query(storiesRef, limit(1)), 
      () => setDbStatus('connected'),
      () => setDbStatus('error')
    );

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({ uid: user.uid, ...userDoc.data() } as UserProfile);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeDb();
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = "nexushub-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
                'flex items-center gap-1 hover:text-primary focus:text-primary transition-colors text-xs',
                isActive ? 'text-foreground font-semibold' : 'text-foreground/80'
              )}
            >
              <span>{link.label}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl border-primary/10 bg-card/95 backdrop-blur-xl shadow-2xl">
              {link.isGenreDropdown && (
                <>
                  <DropdownMenuItem asChild className="rounded-lg h-9">
                    <Link href="/stories" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" />{t('nav.browse')} Tout</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 pt-2 pb-1">Genres Populaires</DropdownMenuLabel>
                  <div className="grid grid-cols-1 gap-0.5">
                    {uniqueGenres.slice(0, 8).map((genre) => (
                      <DropdownMenuItem key={`header-genre-${genre.slug}`} asChild className="rounded-lg h-9">
                        <Link href={`/genre/${genre.slug}`}>{genre.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </>
              )}
              {link.subLinks?.map((sub) => (
                <DropdownMenuItem key={`sublink-${sub.href}`} asChild className="rounded-lg h-9">
                  <Link href={sub.href}>{sub.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      );
    }

    return (
      <Link href={link.href} className={cn('flex items-center gap-2 hover:text-primary transition-colors text-xs', isActive ? 'text-foreground font-semibold' : 'text-foreground/80', className)}>
        <span>{link.label}</span>
        {link.badge && <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn("text-[8px] px-1 py-0 h-3", link.badge.variant === 'green' ? "bg-emerald-500 border-none shadow-emerald-500/20" : "border-orange-500/50 text-orange-400")}>{link.badge.label}</Badge>}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-500">
      <div className={cn("container flex max-w-7xl items-center px-6 lg:px-12 transition-all", isScrolled ? "h-12" : "h-14")}>
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tighter text-foreground gold-resplendant">NexusHub<span className="text-primary">.</span></span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-full border border-border/50">
              <div className={cn("w-1.5 h-1.5 rounded-full transition-all", dbStatus === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-bounce")} />
              <Cloud className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-x-6">
            {navLinks.slice(0, 5).map((link, idx) => (
              <NavLinkRenderer key={`nav-link-${idx}`} link={link} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn && userProfile && (
                <div className="flex items-center gap-3 mr-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 group cursor-help" title="Votre série de lecture actuelle">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-foreground">{userProfile.readingStreak?.currentCount || 0}j</span>
                  </div>
                  <Separator orientation="vertical" className="h-3 bg-primary/20" />
                  <Link href="/settings?tab=africoins" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <CircleDollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black text-foreground">{userProfile.afriCoins}</span>
                  </Link>
                </div>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>

              {!isLoggedIn ? (
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold rounded-full"><Link href="/login">{t('nav.login')}</Link></Button>
                  <Button asChild size="sm" className="h-8 px-4 text-xs font-black rounded-full shadow-lg shadow-primary/20"><Link href="/signup">{t('nav.signup')}</Link></Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background hover:ring-primary transition-all">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{userProfile?.displayName?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-primary/10 shadow-2xl">
                    <div className="p-3 bg-muted/30 rounded-xl mb-2 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback>{userProfile?.displayName?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate text-foreground">{userProfile?.displayName}</p>
                        <Badge variant="outline" className="text-[8px] h-4 uppercase border-primary/30 text-primary">{userProfile?.role === 'reader' ? 'Lecteur' : 'Artiste'}</Badge>
                      </div>
                    </div>
                    <DropdownMenuItem asChild className="rounded-lg h-10 gap-3"><Link href="/profile/me"><UserCircle className="h-4 w-4 text-muted-foreground" />Mon Profil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg h-10 gap-3"><Link href="/library"><Library className="h-4 w-4 text-muted-foreground" />Ma Bibliothèque</Link></DropdownMenuItem>
                    {userProfile?.role?.includes('artist') && <DropdownMenuItem asChild className="rounded-lg h-10 gap-3"><Link href="/dashboard/creations"><Brush className="h-4 w-4 text-muted-foreground" />Mon Atelier</Link></DropdownMenuItem>}
                    <DropdownMenuItem asChild className="rounded-lg h-10 gap-3"><Link href="/settings"><Settings className="h-4 w-4 text-muted-foreground" />Paramètres</Link></DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-10 gap-3 text-destructive focus:bg-destructive/10 focus:text-destructive"><LogOut className="h-4 w-4" />Déconnexion</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-stone-950 text-white border-none">
                <ScrollArea className="h-full">
                  <div className="p-8 space-y-10">
                    <h2 className="font-display font-black text-2xl gold-resplendant">NexusHub<span className="text-primary">.</span></h2>
                    <nav className="space-y-2">
                      {navLinks.map((l, i) => (
                        <Link key={i} href={l.href} className="flex items-center gap-4 py-3 text-lg font-bold hover:text-primary transition-colors border-b border-white/5">
                          <l.icon className="h-5 w-5 text-primary" />{l.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className={cn("w-full items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500", isSearchOpen ? 'flex' : 'hidden')}>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="rounded-full"><ArrowLeft className="h-5 w-5 text-primary" /></Button>
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Titre, résumé, auteur..." className="h-11 w-full pl-12 pr-4 rounded-full bg-white/5 border-white/10 text-white focus:border-primary shadow-2xl transition-all" autoFocus />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </form>
        </div>
      </div>
    </header>
  );
}

function LayoutGrid(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  )
}
