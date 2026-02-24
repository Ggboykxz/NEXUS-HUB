'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/data';
import { Play, Info, TrendingUp, Sparkles, Crown, Award, PenSquare, ChevronRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [featured, setFeatured] = useState<Story[]>([]);
  const [popular, setPopular] = useState<Story[]>([]);
  const [topRanked, setTopRanked] = useState<Story[]>([]);
  const [proStories, setProStories] = useState<Story[]>([]);
  const [draftStories, setDraftStories] = useState<Story[]>([]);
  const [newReleases, setNewReleases] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const storiesRef = collection(db, 'stories');
        
        // Récupération parallèle des différentes sections pour optimiser le temps de réponse
        const [popSnap, rankSnap, newSnap] = await Promise.all([
          getDocs(query(storiesRef, orderBy('views', 'desc'), limit(5))),
          getDocs(query(storiesRef, orderBy('likes', 'desc'), limit(5))),
          getDocs(query(storiesRef, orderBy('updatedAt', 'desc'), limit(5)))
        ]);

        const popData = popSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
        const rankData = rankSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
        const newData = newSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));

        setPopular(popData);
        setTopRanked(rankData);
        setNewReleases(newData);
        
        // Simulation des sections Pro et Draft basées sur les critères de performance (Phase MVP)
        setProStories(popData.slice(0, 5));
        setDraftStories(newData.slice(0, 5));
        
        if (popData.length > 0) {
          setFeatured([popData[0]]);
        }

      } catch (e) {
        console.error("Erreur lors de la récupération des histoires:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const SectionHeader = ({ title, icon: Icon, href, colorClass = "text-primary" }: any) => (
    <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-2">
      <div className="flex items-center gap-3">
        <Icon className={cn("h-6 w-6", colorClass)} />
        <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tighter">{title}</h2>
      </div>
      <Button variant="link" asChild className={cn("font-bold text-xs uppercase tracking-widest p-0 h-auto", colorClass)}>
        <Link href={href} className="flex items-center gap-1">
          Voir tout <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  const StoryGrid = ({ data, loading }: { data: Story[], loading: boolean }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {loading ? (
        [...Array(5)].map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
        ))
      ) : data.length > 0 ? (
        data.map(story => <StoryCard key={story.id} story={story} />)
      ) : (
        <div className="col-span-full text-center py-12 bg-muted/5 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm italic">Aucune œuvre disponible pour le moment.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="flex flex-col gap-12 pb-20">
          
          {/* Hero Section */}
          <section className="relative w-full pt-4 overflow-hidden">
            <div className="container max-w-7xl mx-auto px-4 lg:px-8">
              <div className="relative w-full aspect-[16/9] md:aspect-[21/8] rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/10 bg-stone-950">
                {featured.length > 0 ? (
                  <>
                    <Image 
                      src={featured[0].coverImage?.imageUrl || 'https://picsum.photos/seed/1/1200/600'} 
                      alt={featured[0].title} 
                      fill 
                      className="object-cover opacity-50"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                      <div className="max-w-2xl space-y-4">
                        <Badge className="bg-primary text-black border-none uppercase tracking-widest font-black text-[10px] px-3 py-1">
                          À la une
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter">
                          {featured[0].title}
                        </h1>
                        <p className="text-stone-300 text-sm md:text-lg font-light italic line-clamp-2">
                          "{featured[0].description}"
                        </p>
                        <div className="flex gap-4 pt-4">
                          <Button asChild size="lg" className="rounded-full font-bold px-8 gold-shimmer">
                            <Link href={`/read/${featured[0].id}`}><Play className="mr-2 h-4 w-4 fill-current" /> Lire maintenant</Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                            <Link href={`/webtoon/${featured[0].slug}`}><Info className="mr-2 h-4 w-4" /> Détails</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-display font-bold text-white mb-2">Chargement du Hub...</h2>
                    <p className="text-stone-400 text-sm max-w-md">Préparez-vous à l'immersion.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="container max-w-7xl mx-auto px-6 lg:px-8 space-y-20">
            
            {/* Tendances Section */}
            <section id="tendances">
              <SectionHeader title="Tendances Actuelles" icon={TrendingUp} href="/popular" />
              <StoryGrid data={popular} loading={loading} />
            </section>

            {/* Elite du Hub Section */}
            <section id="elite">
              <SectionHeader title="Elite du Hub" icon={Crown} href="/rankings" colorClass="text-amber-500" />
              <StoryGrid data={topRanked} loading={loading} />
            </section>

            {/* Sélection Pro Section */}
            <section id="pro">
              <SectionHeader title="Sélection NexusHub Pro" icon={Award} href="/pro-selection" colorClass="text-emerald-500" />
              <StoryGrid data={proStories} loading={loading} />
            </section>

            {/* Exploration Draft Section */}
            <section id="draft">
              <SectionHeader title="Exploration NexusHub Draft" icon={PenSquare} href="/draft-exploration" colorClass="text-orange-400" />
              <StoryGrid data={draftStories} loading={loading} />
            </section>

            {/* Nouveautés Section */}
            <section id="nouveautes">
              <SectionHeader title="Nouveautés" icon={Sparkles} href="/new-releases" colorClass="text-cyan-500" />
              <StoryGrid data={newReleases} loading={loading} />
            </section>

            {/* Community CTA */}
            <section className="bg-stone-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
              <div className="relative z-10 space-y-6">
                <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">Rejoignez la Révolution Panafricaine</h2>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                  Devenez acteur de la culture. Publiez vos œuvres, soutenez vos artistes préférés en AfriCoins et participez aux débats de la communauté.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Button asChild size="lg" className="rounded-full px-10 h-14 font-black text-lg">
                    <Link href="/submit">Publier mon œuvre</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 border-white/20 text-white hover:bg-white/5 backdrop-blur-sm">
                    <Link href="/forums">Accéder au Forum</Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
