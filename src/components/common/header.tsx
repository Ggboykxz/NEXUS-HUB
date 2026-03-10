'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Menu, Search, ArrowLeft, UserCircle, LogOut, Settings,
  ChevronDown, ChevronRight, CircleDollarSign, Brush, Library, 
  Cloud, Zap, Flame, LayoutGrid, Bell, Coins, Layers, Book, 
  Clock, CheckCircle2, TrendingUp, Eye, Globe, Sparkles, MessageSquare, ShoppingCart, Mic, X
} from 'lucide-react';
import { navLinks as defaultNavLinks, type NavLink } from '@/lib/navigation';
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

  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCoinFlashing, setIsCoinFlashing] = useState(false);
  const prevCoinsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navLinks = defaultNavLinks.map(link => {
    if (link.label === 'Artistes') return { label: 'Forums', href: '/forums', icon: MessageSquare };
    if (link.label === 'AI Studio') return { label: 'Boutique', href: '/shop', icon: ShoppingCart };
    return link;
  });

  const { data: trendingStories = [] } = useQuery({
    queryKey: ['mega-menu-trending'],
    queryFn: async () => {
      try {
        const storiesRef = collection(db, 'stories');
        const q = query(storiesRef, where('isPublished', '==', true), orderBy('views', 'desc'), limit(3));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
      } catch (error) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (profile?.afriCoins !== undefined) {
      if (prevCoinsRef.current !== undefined && profile.afriCoins > prevCoinsRef.current) {
        setIsCoinFlashing(true);
        setTimeout(() => setIsCoinFlashing(false), 1000);
      }
      prevCoinsRef.current = profile.afriCoins;
    }
  }, [profile?.afriCoins]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (e) {
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

  const getNavLabel = (link: NavLink) => {
    const keyMap: Record<string, string> = {
      "Parcourir": "nav.browse",
      "Classements": "nav.rankings",
      "Forums": "nav.forums",
      "Boutique": "nav.shop",
      "Originals": "nav.originals",
      "NexusHub Pro": "nav.pro"
    };
    return t(keyMap[link.label] || link.label);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500 border-b",
      isScrolled ? "bg-stone-950/95 backdrop-blur-xl border-white/5 h-12 shadow-xl" : "bg-stone-950 border-transparent h-16"
    )}>
      <div className="container flex max-w-7xl items-center h-full px-6 lg:px-12">
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(212,168,67,0.3)] transition-transform group-hover:scale-110">
                <span className="font-display font-black text-stone-950 text-xl">N</span>
              </div>
              <span className="font-display font-black text-xl tracking-tighter text-white gold-resplendant hidden sm:inline">NexusHub<span className="text-primary">.</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-x-8">
              {navLinks.slice(0, 5).map((link, idx) => {
                const isActive = pathname === link.href;
                const isBrowse = link.label === "Parcourir";
                const label = getNavLabel(link);

                if (isBrowse) {
                  return (
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors text-[11px] uppercase font-black tracking-widest outline-none text-foreground/60">
                        {label} <ChevronDown className="h-3 w-3 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[600px] p-0 rounded-[2.5rem] bg-stone-950 border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex h-full">
                          <div className="w-1/2 p-8 border-r border-white/5 space-y-6">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Exploration</p>
                            <div className="grid gap-2">
                              {[
                                { label: 'Webtoon Hub', href: '/webtoon-hub', icon: Layers, color: 'text-primary' },
                                { label: 'BD Africaine', href: '/bd-africaine', icon: Book, color: 'text-emerald-500' },
                                { label: 'Séries en Cours', href: '/ongoing', icon: Clock, color: 'text-blue-500' },
                                { label: 'Séries Terminées', href: '/completed', icon: CheckCircle2, color: 'text-orange-500' },
                              ].map((item) => (
                                <DropdownMenuItem key={item.href} asChild className="rounded-2xl h-14 cursor-pointer focus:bg-white/5">
                                  <Link href={item.href} className="flex items-center gap-4">
                                    <div className={cn("p-2.5 rounded-xl bg-white/5", item.color)}><item.icon className="h-5 w-5" /></div>
                                    <span className="font-bold text-sm">{item.label}</span>
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          </div>
                          <div className="w-1/2 bg-white/[0.02] p-8 space-y-6">
                            <p className="text-[10px] font-black uppercase text-stone-500 tracking-[0.3em]">Tendances</p>
                            {trendingStories.map((story) => (
                              <Link key={story.id} href={`/webtoon-hub/${story.slug}`} className="flex items-center gap-4 group/item">
                                <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                  <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover group-hover/item:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white truncate group-hover/item:text-primary">{story.title}</h4>
                                  <p className="text-[9px] text-stone-500 uppercase mt-0.5">{story.genre}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Link key={idx} href={link.href} className={cn(
                    "text-[11px] uppercase font-black tracking-widest transition-colors",
                    isActive ? "text-primary" : "text-stone-400 hover:text-white"
                  )}>
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Cloud className="h-3.5 w-3.5 text-stone-500" />
              <span className="text-[9px] font-black uppercase text-stone-500 tracking-widest">Nexus-Cloud Link</span>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="rounded-full text-stone-400 hover:text-white hover:bg-white/5">
              <Search className="h-5 w-5" />
            </Button>

            {mounted && currentUser ? (
              <div className="flex items-center gap-3">
                <Link href="/notifications" className="relative group">
                  <Button variant="ghost" size="icon" className="rounded-full text-stone-400 group-hover:text-white">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-stone-950 animate-pulse" />}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/5 border border-white/10 rounded-full hover:border-primary/30 transition-all group">
                      <Avatar className="h-8 w-8 border-2 border-stone-900 group-hover:border-primary/50 transition-all">
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{profile?.displayName?.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start min-w-0">
                        <span className={cn("text-[10px] font-black text-primary uppercase transition-all", isCoinFlashing && "scale-110")}>{profile?.afriCoins || 0} 🪙</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl bg-stone-900 border-white/5 shadow-2xl">
                    <div className="p-4 bg-white/5 rounded-2xl mb-2 flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20"><AvatarImage src={profile?.photoURL}/></Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate">{profile?.displayName}</p>
                        <Badge variant="outline" className="text-[8px] uppercase border-primary/30 text-primary">{profile?.role}</Badge>
                      </div>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer focus:bg-primary/10">
                      <Link href={`/profile/${currentUser.uid}`} className="flex items-center gap-3 font-bold text-xs"><UserCircle className="h-4 w-4" /> Mon Profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer focus:bg-primary/10">
                      <Link href="/library" className="flex items-center gap-3 font-bold text-xs"><Library className="h-4 w-4" /> Ma Bibliothèque</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer focus:bg-primary/10">
                      <Link href="/settings" className="flex items-center gap-3 font-bold text-xs"><Settings className="h-4 w-4" /> Configuration</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-11 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 font-black text-xs gap-3">
                      <LogOut className="h-4 w-4" /> Quitter le Hub
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="rounded-full text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-white">
                  <Link href="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild className="rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-widest px-6 h-9 gold-shimmer shadow-lg shadow-primary/20">
                  <Link href="/signup">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        <div className={cn(
          "absolute inset-0 z-[60] bg-stone-950 flex items-center px-6 lg:px-12 transition-all duration-500",
          isSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}>
          <form onSubmit={handleSearchSubmit} className="w-full max-w-4xl mx-auto flex items-center gap-6">
            <Button type="button" variant="ghost" onClick={() => setIsSearchOpen(false)} className="rounded-full h-12 w-12 bg-white/5">
              <ArrowLeft className="h-6 w-6 text-primary" />
            </Button>
            <div className="relative flex-1 group">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quelle légende cherchez-vous ?"
                className="h-14 w-full pl-6 pr-14 rounded-2xl bg-white/5 border-white/10 text-white text-lg font-light italic focus:border-primary shadow-2xl transition-all"
                autoFocus={isSearchOpen}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-stone-500 hover:text-primary">
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <Button type="button" variant="outline" className="hidden sm:flex rounded-2xl h-14 border-white/10 gap-3 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black">
              <Mic className="h-4 w-4" /> Recherche Vocale
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}