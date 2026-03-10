'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Menu, 
  UserCircle, 
  Library, 
  Brush, 
  Settings, 
  LogOut, 
  Coins, 
  ChevronRight,
  Twitter,
  Instagram,
  Facebook,
  Globe,
  Zap,
  Sparkles,
  Search
} from 'lucide-react';
import type { NavLink } from '@/lib/navigation';
import { useTranslation } from '../providers/language-provider';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from './language-switcher';

interface MobileNavProps {
  navLinks: NavLink[];
}

export function MobileNav({ navLinks }: MobileNavProps) {
  const { t } = useTranslation();
  const { currentUser, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 rounded-full hover:bg-white/5">
          <Menu className="h-6 w-6 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-stone-950 text-white border-none w-[85%] sm:max-w-md overflow-hidden flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de Navigation</SheetTitle>
          <SheetDescription>Accédez aux différentes sections de NexusHub</SheetDescription>
        </SheetHeader>

        {/* User Profile Header (Mobile) */}
        <div className="p-6 pt-10 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-950 border-b border-white/5 relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Zap className="h-32 w-32 text-primary" />
          </div>
          
          {currentUser && profile ? (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary ring-4 ring-primary/10 shadow-2xl">
                  <AvatarImage src={profile.photoURL} />
                  <AvatarFallback className="bg-stone-800 text-primary font-black text-xl">{profile.displayName?.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-xl font-display font-black text-white truncate gold-resplendant">{profile.displayName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[8px] uppercase border-primary/30 text-primary font-black px-2">{profile.role?.replace('_', ' ')}</Badge>
                    <span className="h-1 w-1 rounded-full bg-stone-700" />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Niveau {profile.level || 1}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                  <p className="text-[8px] font-black uppercase text-stone-500 tracking-widest mb-1">Solde</p>
                  <p className="text-lg font-black text-primary">{profile.afriCoins || 0} 🪙</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                  <p className="text-[8px] font-black uppercase text-stone-500 tracking-widest mb-1">Série</p>
                  <p className="text-lg font-black text-orange-500">{profile.readingStreak?.currentCount || 0} j</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-black text-white">Prêt pour <br/> l'aventure ?</h2>
                <p className="text-stone-500 text-xs italic">Connectez-vous pour graver votre propre légende.</p>
              </div>
              <div className="flex gap-3">
                <SheetClose asChild>
                  <Button asChild className="flex-1 bg-primary text-black font-black rounded-xl">
                    <Link href="/login">Connexion</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="flex-1 border-white/10 text-white font-bold rounded-xl">
                    <Link href="/signup">S'inscrire</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-10">
            {/* Quick Actions for logged in users */}
            {currentUser && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-stone-600 tracking-[0.3em] px-2">Actions Rapides</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: "Mon Profil", icon: UserCircle, href: `/profile/${currentUser.uid}`, color: "text-blue-500" },
                    { label: "Ma Bibliothèque", icon: Library, href: "/library", color: "text-primary" },
                    ...(profile?.role?.includes('artist') ? [{ label: "Mon Atelier", icon: Brush, href: "/dashboard/creations", color: "text-emerald-500" }] : []),
                    { label: "Configuration", icon: Settings, href: "/settings", color: "text-stone-400" },
                  ].map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link href={item.href} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-95 group">
                        <div className={cn("p-2 rounded-xl bg-stone-900 group-hover:scale-110 transition-transform", item.color)}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm flex-1">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-stone-700" />
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-stone-600 tracking-[0.3em] px-2">Navigation</p>
              <nav className="flex flex-col gap-1">
                {navLinks.map((l, i) => (
                  <SheetClose asChild key={i}>
                    <Link href={l.href} className="flex items-center gap-4 py-4 px-2 text-lg font-black uppercase tracking-tighter hover:text-primary transition-all border-b border-white/5 group">
                      <div className="bg-white/5 p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                        <l.icon className="h-5 w-5 text-primary" />
                      </div>
                      {getNavLabel(l)}
                      <ChevronRight className="h-4 w-4 ml-auto opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>

            {/* Support & Tools */}
            <div className="space-y-4 pt-4">
              <p className="text-[10px] font-black uppercase text-stone-600 tracking-[0.3em] px-2">Plus</p>
              <div className="grid grid-cols-2 gap-3">
                <SheetClose asChild>
                  <Link href="/africoins" className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center gap-2 text-center group">
                    <Coins className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase">AfriCoins</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/events" className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center gap-2 text-center group">
                    <Sparkles className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase">Événements</span>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer of the Drawer */}
        <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 text-stone-600 hover:text-white" />
              <Instagram className="h-5 w-5 text-stone-600 hover:text-white" />
              <Facebook className="h-5 w-5 text-stone-600 hover:text-white" />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>

          {currentUser && (
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="w-full justify-start h-12 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 font-black text-xs uppercase tracking-widest gap-3"
            >
              <LogOut className="h-4 w-4" /> Se déconnecter
            </Button>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Nexus-Cloud Synchronisé</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
