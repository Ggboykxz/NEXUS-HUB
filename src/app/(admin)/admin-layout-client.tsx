'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, LayoutDashboard, Users, Flag, Award, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';

/**
 * Composant client gérant la logique d'autorisation du Nexus Core.
 */
export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData?.role === 'admin') {
          setStatus('authorized');
        } else {
          setStatus('denied');
          setTimeout(() => router.replace('/'), 3000);
        }
      } catch (error) {
        console.error("Admin check error:", error);
        setStatus('denied');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Accès au Nexus Core...</p>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-20 w-20 text-rose-600 mb-6 animate-bounce" />
        <h1 className="text-4xl font-display font-black text-white mb-4">Accès Interdit</h1>
        <p className="text-stone-400 italic max-w-md">"Seuls les Gardiens du Hub peuvent pénétrer dans ce sanctuaire numérique. Redirection vers les sables publics..."</p>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Award, label: 'Validations Pro', href: '/dashboard#validations' },
    { icon: Flag, label: 'Signalements', href: '/dashboard#reports' },
    { icon: Users, label: 'Membres', href: '/dashboard#users' },
  ];

  return (
    <div className="flex min-h-screen bg-stone-950 text-white">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-stone-900/50 backdrop-blur-xl sticky top-0 h-screen hidden md:flex flex-col">
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="h-10 w-auto group-hover:scale-110 transition-transform" />
            <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest px-2">ADMIN</Badge>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                pathname === item.href ? "bg-primary text-black" : "text-stone-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button asChild variant="ghost" className="w-full justify-start text-stone-500 hover:text-rose-500 gap-3">
            <Link href="/"><Home className="h-4 w-4" /> Quitter Admin</Link>
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
