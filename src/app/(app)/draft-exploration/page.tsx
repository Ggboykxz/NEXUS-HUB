'use client';

import { stories, artists } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { PenSquare, Sparkles, Rocket, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DraftExplorationPage() {
  const draftStories = stories.filter(s => {
    const artist = artists.find(a => a.id === s.artistId);
    return !artist?.isMentor;
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 relative p-12 rounded-[2.5rem] bg-orange-500/[0.03] border border-orange-500/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-orange-500/10 p-2 rounded-lg">
                <PenSquare className="text-orange-500 h-8 w-8" />
              </div>
              <Badge className="bg-orange-500 text-white border-none uppercase tracking-[0.2em] font-black text-[10px]">
                Nouveaux Talents
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              Exploration <span className="text-orange-500">NexusHub Draft</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic">
              "Le terrain de jeu de la créativité libre. Découvrez les pépites de demain et aidez les nouveaux auteurs à forger leurs légendes."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-background/50 backdrop-blur-md p-6 rounded-3xl border border-orange-500/10 text-center">
              <p className="text-3xl font-black text-orange-500">{draftStories.length}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Séries Draft</p>
            </div>
            <div className="bg-background/50 backdrop-blur-md p-6 rounded-3xl border border-orange-500/10 text-center">
              <p className="text-3xl font-black text-orange-500">100%</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Libre</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {draftStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {draftStories.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed rounded-3xl">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground italic">Aucune œuvre draft pour le moment. Soyez le premier à publier !</p>
        </div>
      )}

      <section className="mt-24 p-12 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="bg-white rounded-full p-4 w-fit mx-auto shadow-xl">
            <Rocket className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-display font-bold">Votre œuvre mérite d'être lue</h2>
          <p className="text-lg text-muted-foreground">
            L'espace Draft est conçu pour supprimer toutes les barrières entre vous et votre public. Publiez vos planches, recevez des avis constructifs et progressez jusqu'au statut Pro.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-100 p-3 rounded-2xl"><Users className="h-6 w-6 text-orange-600" /></div>
              <span className="font-bold text-sm">Feedback Direct</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-100 p-3 rounded-2xl"><Sparkles className="h-6 w-6 text-orange-600" /></div>
              <span className="font-bold text-sm">Visibilité Immédiate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-100 p-3 rounded-2xl"><PenSquare className="h-6 w-6 text-orange-600" /></div>
              <span className="font-bold text-sm">Mentorat Possible</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
