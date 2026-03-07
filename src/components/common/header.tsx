'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Menu, Search, ArrowLeft, UserCircle, LogOut, Settings,
  ChevronDown, ChevronRight, CircleDollarSign, Brush, Library, 
  Cloud, Zap, Flame, LayoutGrid, Bell, Coins, Layers, Book, 
  Clock, CheckCircle2, TrendingUp, Eye, Globe, Sparkles, Mic, Headphones
} from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import { useTranslation } from '../providers/language-provider';
import { useGenres } from '../providers/genres-provider';
import { db, auth } from '@/lib/firebase';
import { collection, limit, query, onSnapshot, where, orderBy, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { Story } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from './language-switcher';

export default function Header() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { genres: uniqueGenres } = useGenres();
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, profile } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCoinFlashing, setIsCoinFlashing] = useState(false);
  const prevCoinsRef = useRef<number | undefined>(undefined);

  const { data: trendingStories = [] } = useQuery({
    queryKey: ['mega-menu-trending'],
    queryFn: async () => {
      try {
        const storiesRef = collection(db, 'stories');
        try {
          const q = query(storiesRef, where('isPublished', '==', true), orderBy('views', 'desc'), limit(3));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
        } catch (e) {
          const qSimple = query(storiesRef, limit(3));
          const snapSimple = await getDocs(qSimple);
          return snapSimple.docs.map(d => ({ id: d.id, ...d.data() } as Story));
        }
      } catch (error) {
        console.error("Error fetching trending stories for mega menu: ", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const storiesRef = collection(db, 'stories');
    const unsubscribeDb = onSnapshot(query(storiesRef, limit(1)),
      () => setDbStatus('connected'),
      () => setDbStatus('error')
    );

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeDb();
    };
  }, []);

  useEffect(() => {
    if (profile?.afriCoins !== undefined) {
      if (prevCoinsRef.current !== undefined && profile.afriCoins > prevCoinsRef.current) {
        setIsCoinFlashing(true);
        const timer = setTimeout(() => setIsCoinFlashing(false), 1000);
        return () => clearTimeout(timer);
      }
      prevCoinsRef.current = profile.afriCoins;
    }
  }, [profile?.afriCoins]);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    try {
      const notifRef = collection(db, 'users', currentUser.uid, 'notifications');
      const qNotif = query(notifRef, where('read', '==', false));

      const unsubscribeNotifications = onSnapshot(qNotif, (snap) => {
        setUnreadCount(snap.size);
      }, (error) => {
        if (error.code !== 'permission-denied') {
          console.error("Notifications listener error:", error);
        }
      });

      return () => unsubscribeNotifications();
    } catch (e) {}
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error("Erreur lors de la déconnexion", e);
      toast({ title: "Erreur", description: "Impossible de se déconnecter.", variant: "destructive" });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ title: "Non supporté", description: "Votre navigateur ne supporte pas la voix.", variant: "destructive" });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        router.push(`/search?q=${encodeURIComponent(transcript)}`);
        setIsSearchOpen(false);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const getNavLabel = (link: NavLink) => {
    const keyMap: Record<string, string> = {
      "Parcourir": "nav.browse",
      "Classements": "nav.rankings",
      "Artistes": "nav.artists",
      "Forums": "nav.forums",
      "Boutique": "nav.shop",
      "Originals": "nav.originals",
      "AI Studio": "nav.ai_studio",
      "NexusHub Pro": "nav.pro"
    };
    return t(keyMap[link.label] || link.label);
  };

  const NavLinkRenderer = ({ link, className }: { link: NavLink, className?: string }) => {
    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
    const isBrowse = link.label === "Parcourir";
    const label = getNavLabel(link);

    if (isBrowse || link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex items-center gap-1 hover:text-primary focus:text-primary transition-colors text-[11px] uppercase font-black tracking-widest outline-none',
              isActive ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            <span>{label}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className={cn(
              "p-0 rounded-[2rem] border-primary/10 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300",
              isBrowse ? "w-[600px]" : "w-56 p-2"
            )}
          >
            {isBrowse ? (
              <div className="flex h-full">
                <div className="w-1/2 p-6 border-r border-white/5 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-4">{t('footer.library')}</p>
                    {[
                      { label: 'Webtoon Hub', href: '/webtoon-hub', icon: Layers, color: 'text-primary' },
                      { label: 'BD Africaine', href: '/bd-africaine', icon: Book, color: 'text-emerald-500' },
                      { label: 'Séries en Cours', href: '/ongoing', icon: Clock, color: 'text-blue-500' },
                      { label: 'Séries Terminées', href: '/completed', icon: CheckCircle2, color: 'text-orange-500' },
                    ].map((item) => (
                      <DropdownMenuItem key={item.href} asChild className="rounded-xl h-12 focus:bg-primary/5 cursor-pointer">
                        <Link href={item.href} className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg bg-white/5", item.color)}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-sm text-foreground">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <Button asChild variant="ghost" className="w-full justify-between h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary">
                      <Link href="/stories">Voir tout le catalogue <ChevronRight className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                </div>

                <div className="w-1/2 bg-white/[0.02] p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em]">{t('home.trending')}</p>
                    <TrendingUp className="h-3 w-3 text-stone-600" />
                  </div>
                  <div className="space-y-4">
                    {trendingStories.map((story) => (
                      <Link key={story.id} href={`/webtoon-hub/${story.slug}`} className="flex items-center gap-4 group/item transition-all hover:translate-x-1">
                        <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-white/10 shadow-lg shrink-0">
                          <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover group-hover/item:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover/item:text-primary transition-colors">{story.title}</h4>
                          <p className="text-[9px] text-stone-500 font-medium uppercase mt-0.5">{story.genre}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Eye className="h-2.5 w-2.5 text-stone-600" />
                            <span className="text-[8px] font-black text-stone-600">{(story.views / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Card className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                      <p className="text-[9px] text-primary font-black uppercase leading-tight">Recommandation IA</p>
                      <p className="text-[10px] text-stone-400 italic mt-1 font-light">"Basé sur vos lectures récentes."</p>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {link.isGenreDropdown && (
                  <>
                    <DropdownMenuItem asChild className="rounded-xl h-10">
                      <Link href="/stories" className="flex items-center gap-3 font-bold"><LayoutGrid className="h-4 w-4 text-primary" />{label} Tout</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuLabel className="text-[9px] uppercase font-black text-muted-foreground px-3 pt-3 pb-1 tracking-[0.2em]">Genres Populaires</DropdownMenuLabel>
                    <div className="grid grid-cols-1 gap-0.5">
                      {uniqueGenres.slice(0, 8).map((genre) => (
                        <DropdownMenuItem key={`header-genre-${genre.slug}`} asChild className="rounded-xl h-10">
                          <Link href={`/genre/${genre.slug}`} className="font-medium">{genre.name}</Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </>
                )}
                {link.subLinks?.map((sub) => (
                  <DropdownMenuItem key={`sublink-${sub.href}`} asChild className="rounded-xl h-10">
                    <Link href={sub.href} className="font-medium">{sub.label}</Link>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link href={link.href} className={cn('flex items-center gap-2 hover:text-primary transition-colors text-[11px] uppercase font-black tracking-widest', isActive ? 'text-foreground' : 'text-foreground/60', className)}>
        <span>{label}</span>
        {link.badge && <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn("text-[8px] px-1 py-0 h-3.5", link.badge.variant === 'green' ? "bg-emerald-500 border-none shadow-emerald-500/20" : "border-orange-500/50 text-orange-400")}>{link.badge.label}</Badge>}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-500">
      <div className={cn("container flex max-w-7xl items-center px-6 lg:px-12 transition-all", isScrolled ? "h-12" : "h-14")}>
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tighter text-foreground gold-resplendant">NexusHub<span className="text-primary">.</span></span>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 bg-muted/30 px-3 py-1 rounded-full border border-border/50">
              <div className={cn("w-1.5 h-1.5 rounded-full transition-all", dbStatus === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-bounce")} />
              <Cloud className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-x-8">
            {navLinks.slice(0, 5).map((link, idx) => (
              <NavLinkRenderer key={`nav-link-${idx}`} link={link} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <div className="hidden md:flex items-center gap-3">
              {currentUser && profile && (
                <div className="flex items-center gap-3 mr-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 group cursor-help" title="Votre série de lecture actuelle">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-foreground">{profile.readingStreak?.currentCount || 0}j</span>
                  </div>
                  <Separator orientation="vertical" className="h-3 bg-primary/20" />
                  <Link href="/settings?tab=africoins" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <CircleDollarSign className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black text-foreground">{profile.afriCoins}</span>
                  </Link>
                </div>
              )}

              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted rounded-full" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>

              {currentUser && (
                <>
                  <Link href="/notifications" className="relative">
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted rounded-full">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-3.5 min-w-[14px] px-1 bg-destructive text-white text-[8px] font-black rounded-full flex items-center justify-center animate-in zoom-in duration-300 border-2 border-background">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <Link href="/africoins">
                    <div className={cn(
                      "hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 cursor-pointer hover:bg-primary/20 transition-all",
                      isCoinFlashing && "animate-bounce border-primary shadow-[0_0_15px_rgba(212,168,67,0.5)] bg-primary/20"
                    )}>
                      <Coins className={cn("h-3.5 w-3.5 text-primary transition-colors", isCoinFlashing && "text-yellow-400")} />
                      <span className={cn(
                        "text-[11px] font-black text-primary transition-colors",
                        isCoinFlashing && "text-yellow-400"
                      )}>
                        {profile?.afriCoins || 0} 🪙
                      </span>
                    </div>
                  </Link>
                </>
              )}

              {!currentUser ? (
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm" className="h-9 px-4 text-xs font-black uppercase tracking-widest rounded-full"><Link href="/login">{t('nav.login')}</Link></Button>
                  <Button asChild size="sm" className="h-9 px-5 text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 bg-primary text-black hover:bg-primary/90"><Link href="/signup">{t('nav.signup')}</Link></Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background hover:ring-primary transition-all">
                      <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{profile?.displayName?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-primary/10 shadow-2xl">
                    <div className="p-3 bg-muted/30 rounded-xl mb-2 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback>{profile?.displayName?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate text-foreground">{profile?.displayName}</p>
                        <Badge variant="outline" className="text-[8px] h-4 uppercase border-primary/30 text-primary font-black">{profile?.role === 'reader' ? 'Lecteur' : 'Artiste'}</Badge>
                      </div>
                    </div>
                    {/* Lien dynamique : Vitrine publique pour les artistes, profil privé pour les lecteurs */}
                    <DropdownMenuItem asChild className="rounded-xl h-10 gap-3 font-bold text-xs">
                      <Link href={profile?.role?.startsWith('artist') ? `/artiste/${profile.slug}` : `/profile/${currentUser.uid}`}>
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl h-10 gap-3 font-bold text-xs"><Link href="/library"><Library className="h-4 w-4 text-muted-foreground" />{t('nav.library')}</Link></DropdownMenuItem>
                    {profile?.role?.includes('artist') && <DropdownMenuItem asChild className="rounded-xl h-10 gap-3 font-bold text-xs"><Link href="/dashboard/creations"><Brush className="h-4 w-4 text-muted-foreground" />{t('nav.workshop')}</Link></DropdownMenuItem>}
                    <DropdownMenuItem asChild className="rounded-xl h-10 gap-3 font-bold text-xs"><Link href="/settings"><Settings className="h-4 w-4 text-muted-foreground" />{t('nav.settings')}</Link></DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-10 gap-3 text-destructive focus:bg-destructive/10 focus:text-destructive font-black text-xs"><LogOut className="h-4 w-4" />{t('nav.logout')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-stone-950 text-white border-none">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navigation</SheetTitle>
                  <SheetDescription>Accédez aux différentes sections de NexusHub</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <div className="p-8 space-y-10">
                    <h2 className="font-display font-black text-2xl gold-resplendant">NexusHub<span className="text-primary">.</span></h2>
                    <nav className="space-y-2">
                      {navLinks.map((l, i) => (
                        <Link key={i} href={l.href} className="flex items-center gap-4 py-4 text-lg font-black uppercase tracking-tighter hover:text-primary transition-colors border-b border-white/5">
                          <l.icon className="h-5 w-5 text-primary" />{getNavLabel(l)}
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
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="rounded-full h-10 w-10"><ArrowLeft className="h-5 w-5 text-primary" /></Button>
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="h-11 w-full pl-12 pr-12 rounded-full bg-white/5 border-white/10 text-white focus:border-primary shadow-2xl transition-all font-light"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Button
              type="button"
              onClick={handleVoiceSearch}
              variant="ghost"
              size="icon"
              className={cn("absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full", isListening && "text-red-500 animate-pulse")}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
