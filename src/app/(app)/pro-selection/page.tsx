'use client';

import { stories, artists } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Award, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function ProSelectionPage() {
  const proStories = stories.filter(s => {
    const artist = artists.find(a => a.id === s.artistId);
    return artist?.role === 'artist_pro';
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 relative p-12 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Award className="text-emerald-500 h-8 w-8" />
              </div>
              <Badge className="bg-emerald-500 text-white border-none uppercase tracking-[0.2em] font-black text-[10px]">
                Elite du Hub
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              Sélection <span className="text-emerald-500">NexusHub Pro</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic">
              "L'excellence de la narration visuelle africaine. Des œuvres certifiées pour leur qualité narrative et leur maîtrise artistique exceptionnelle."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-background/50 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/10 text-center">
              <p className="text-3xl font-black text-emerald-500">{proStories.length}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Séries Pro</p>
            </div>
            <div className="bg-background/50 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/10 text-center">
              <p className="text-3xl font-black text-emerald-500">100%</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Qualité</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {proStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {proStories.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed rounded-3xl">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground italic">La sélection Pro arrive bientôt...</p>
        </div>
      )}

      <section className="mt-24 p-12 rounded-[2rem] bg-stone-950 text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-0" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold mb-6">Le standard Pro</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              Toutes les œuvres de cette section sont produites par des artistes ayant prouvé leur constance et leur maîtrise technique. En lisant ces séries, vous soutenez directement les piliers de la bande dessinée africaine moderne.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                <span className="font-bold">Validation éditoriale rigoureuse</span>
              </div>
              <div className="flex items-center gap-4">
                <Star className="h-6 w-6 text-emerald-500" />
                <span className="font-bold">Artistes mentors de la communauté</span>
              </div>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                <span className="font-bold">Contenu Premium exclusif</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1609804213568-19c806540d6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
              alt="Elite Art" 
              fill
              className="object-cover opacity-60" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}
