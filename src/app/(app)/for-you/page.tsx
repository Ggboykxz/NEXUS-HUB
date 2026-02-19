'use client';

import { useState, useEffect } from 'react';
import { stories, type Story } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { BookHeart, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/language-provider';

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
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <BookHeart className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-display">{t('home.for_you_title')}</h1>
            <p className="text-lg text-muted-foreground">
              {isPreferenceBased 
                ? "Basé sur vos genres préférés et vos lectures passées." 
                : "Les œuvres incontournables sélectionnées par notre équipe."}
            </p>
          </div>
        </div>
      </div>

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
      
      <section className="mt-24 p-8 md:p-12 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="max-w-2xl relative z-10">
              <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2 text-primary">
                  <Sparkles className="h-6 w-6" /> Affinez votre sélection
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-8">
                  Plus vous lisez et ajoutez d'œuvres à vos favoris, plus NexusHub apprend à connaître vos goûts pour vous proposer des récits qui vous transportent. Votre hub créatif évolue avec vous.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/stories">Explorer tout le catalogue</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                    <Link href="/rankings">Voir les classements</Link>
                </Button>
              </div>
          </div>
      </section>
    </div>
  );
}
