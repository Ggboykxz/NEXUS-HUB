'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/data';
import { Play, Info, Award, Zap, Sparkles, BookHeart, TrendingUp, Clock, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/components/providers/language-provider';

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        setFeaturedStories(fetched);
      } catch (e) {
        console.error("Error fetching stories:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 bg-background pb-20">
      {/* Hero Section */}
      <section className="relative w-full pt-4 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 lg:px-8">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/8] rounded-[2rem] overflow-hidden shadow-2xl border border-primary/10 bg-stone-950">
            {featuredStories[0] && (
              <>
                <Image 
                  src={featuredStories[0].coverImage.imageUrl} 
                  alt={featuredStories[0].title} 
                  fill 
                  className="object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                  <div className="max-w-2xl space-y-4">
                    <Badge className="bg-primary text-black border-none uppercase tracking-widest font-black text-[10px] px-3 py-1">
                      À la une
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter">
                      {featuredStories[0].title}
                    </h1>
                    <p className="text-stone-300 text-sm md:text-lg font-light italic line-clamp-2">
                      "{featuredStories[0].description}"
                    </p>
                    <div className="flex gap-4 pt-4">
                      <Button asChild size="lg" className="rounded-full font-bold px-8 gold-shimmer">
                        <Link href={`/read/${featuredStories[0].id}`}><Play className="mr-2 h-4 w-4 fill-current" /> Lire maintenant</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                        <Link href={`/webtoon/${featuredStories[0].slug}`}><Info className="mr-2 h-4 w-4" /> Détails</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <main className="container max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
        {/* Tendances Section */}
        <section>
          <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary h-6 w-6" />
              <h2 className="text-2xl font-display font-bold">Tendances Actuelles</h2>
            </div>
            <Button variant="link" asChild className="text-primary font-bold">
              <Link href="/popular">Voir tout</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {featuredStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        {/* Community CTA */}
        <section className="bg-stone-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Rejoignez la Révolution Panafricaine</h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-lg">
              Devenez acteur de la culture. Publiez vos œuvres, soutenez vos artistes préférés en AfriCoins et participez aux débats de la communauté.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-10 h-14 font-black text-lg">
                <Link href="/submit">Publier mon œuvre</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 border-white/20 text-white">
                <Link href="/forums">Accéder au Forum</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
