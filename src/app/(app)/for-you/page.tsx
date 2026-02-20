'use client';

import { useState, useEffect } from 'react';
import { stories, type Story } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { BookHeart, Sparkles, ArrowLeft, Heart, Zap, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/language-provider';
import { Badge } from '@/components/ui/badge';

export default function ForYouPage() {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<Story[]>([]);
  const [isPreferenceBased, setIsPreferenceBased] = useState(false);

  useEffect(() => {
    const prefs = localStorage.getItem('preferredGenres');
    let list: Story[] = [];
    
    if (prefs) {
      try {
        const preferredGenres = JSON.parse(prefs) as string[];
        list = stories.filter(s => preferredGenres.includes(s.genre));
        if (list.length > 0) setIsPreferenceBased(true);
      } catch (e) {
        console.error("Error parsing preferences", e);
      }
    }

    if (list.length === 0) {
      // Fallback: Random shuffle or curated high views
      list = [...stories].sort(() => 0.5 - Math.random());
    }
    setRecommendations(list);
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <header className="mb-16 relative p-12 rounded-[2.5rem] bg-primary/[0.03] border border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookHeart className="text-primary h-8 w-8" />
              </div>
              <Badge className="bg-primary text-white border-none uppercase tracking-[0.2em] font-black text-[10px]">
                Algorithme Nexus
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              {t('home.for_you_title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic">
              {isPreferenceBased 
                ? "Basé sur vos genres préférés et vos lectures passées. Une sélection de récits qui résonnent avec votre âme de lecteur." 
                : "Les œuvres incontournables sélectionnées par notre équipe éditoriale pour vous faire découvrir la richesse du Hub."}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-2xl border">
              <Heart className="h-5 w-5 text-destructive" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Favoris</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-2xl border">
              <History className="h-5 w-5 text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Historique</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-2xl border">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Tendances</span>
            </div>
          </div>
        </div>
      </header>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {recommendations.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground italic">Préparation de votre sélection personnalisée...</p>
        </div>
      )}
      
      <section className="mt-24 p-8 md:p-12 rounded-[2.5rem] bg-stone-900 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="max-w-2xl relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold font-display leading-tight">Affinez votre sélection</h2>
              </div>
              <p className="text-lg text-stone-400 leading-relaxed font-light">
                  Plus vous lisez et interagissez avec les œuvres, plus NexusHub apprend à connaître vos goûts uniques. Votre bibliothèque n'est pas qu'une liste, c'est le reflet de votre voyage créatif sur le continent.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full px-8 font-bold">
                    <Link href="/stories">Explorer tout le catalogue</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white/20 text-white hover:bg-white/10">
                    <Link href="/rankings">Voir les classements</Link>
                </Button>
              </div>
          </div>
      </section>
    </div>
  );
}
