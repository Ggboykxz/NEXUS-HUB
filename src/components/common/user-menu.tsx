'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '../providers/language-provider';
import { UserCircle, Library, Brush, Settings, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function UserMenu() {
  const { currentUser, profile } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error("Logout Error", e);
      toast({ title: "Error", description: "Could not log out.", variant: "destructive" });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="h-9 px-4 text-xs font-black uppercase tracking-widest rounded-full"><Link href="/login">{t('nav.login')}</Link></Button>
        <Button asChild size="sm" className="h-9 px-5 text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 bg-primary text-black hover:bg-primary/90"><Link href="/signup">{t('nav.signup')}</Link></Button>
      </div>
    );
  }

  if (currentUser && profile) {
    return (
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
    );
  }

  return null;
}