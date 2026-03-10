'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '../providers/language-provider';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, limit, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import Image from 'next/image';
import { ChevronRight, Layers, Book, Clock, CheckCircle2, TrendingUp, Eye } from 'lucide-react';

export function MegaMenu() {
  const { t } = useTranslation();

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
        console.error("Error fetching trending stories: ", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 15,
  });

  return (
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
            <Link key={item.href} href={item.href} className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors">
              <div className={cn("p-2 rounded-lg bg-white/5", item.color)}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-foreground">{item.label}</span>
            </Link>
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
                <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover group-item:scale-110 transition-transform duration-500" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate group-item:text-primary transition-colors">{story.title}</h4>
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
  );
}
