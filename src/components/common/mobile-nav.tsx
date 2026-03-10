'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';
import type { NavLink } from '@/lib/navigation';
import { useTranslation } from '../providers/language-provider';

interface MobileNavProps {
  navLinks: NavLink[];
}

export function MobileNav({ navLinks }: MobileNavProps) {
  const { t } = useTranslation();

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
  );
}
