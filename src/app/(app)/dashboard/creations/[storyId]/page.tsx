'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brush, Languages, BrainCircuit, TrendingUp, Plus, 
  Settings, ChevronRight, Eye, Heart, Star, LayoutGrid,
  FileText, Wand2, Share2, Globe, Clock, Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function StoryDashboardPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      try {
        const snap = await getDoc(doc(db, 'stories', storyId));
        if (snap.exists()) {
          const data = snap.data() as Story;
          
          // Ownership Check (Défense en profondeur côté client)
          if (data.artistId !== user.uid) {
            router.push('/dashboard/creations');
            toast({ 
              title: "Accès refusé", 
              description: "Vous n'êtes pas l'auteur de cette légende.",
              variant: "destructive" 
            });
            return;
          }
          
          setStory({ id: snap.id, ...data } as Story);
        } else {
          router.push('/dashboard/creations');
        }
      } catch (error) {
        console.error("Error fetching story:", error);
        router.push('/dashboard/creations');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [storyId, router, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase tracking-widest text-[10px]">Ouverture de l'Atelier...</p>
      </div>
    );
  }

  if (!story) return <div className="text-center py-32">Œuvre introuvable.</div>;

  const tools = [
    { 
      title: "IA Éditoriale", 
      icon: BrainCircuit, 
      desc: "Analyse de rythme, clichés et dialogues.", 
      href: `/dashboard/creations/${storyId}/editorial`,
      color: "text-primary bg-primary/10"
    },
    { 
      title: "Traduction", 
      icon: Languages, 
      desc: "Exportez votre univers en plusieurs langues.", 
      href: `/dashboard/creations/${storyId}/translate`,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    { 
      title: "World Building", 
      icon: Globe, 
      desc: "Gérez vos notes et templates d'univers.", 
      href: `/dashboard/world-building`,
      color: "text-blue-500 bg-blue-500/10"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-background ring-2 ring-primary/20">
            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-black font-black text-[8px] uppercase tracking-widest px-3">GESTION ÉDITORIALE</Badge>
              <Badge variant="outline" className="text-[8px] uppercase">{story.format}</Badge>
            </div>
            <h1 className="text-4xl font-display font-black tracking-tighter">{story.title}</h1>
            <p className="text-muted-foreground text-sm italic mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Dernière mise à jour : {new Date(story.updatedAt as any).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button asChild className="flex-1 md:flex-none rounded-full px-8 font-black"><Link href={`/read/${storyId}`}><Eye className="mr-2 h-4 w-4" /> Voir l'œuvre</Link></Button>
          <Button variant="outline" className="rounded-full h-10 w-10 p-0"><Settings className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-6">
            <h2 className="text-xl font-display font-black uppercase tracking-widest flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" /> Outils de Création
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {tools.map((tool, i) => (
                <Link key={i} href={tool.href} className="group">
                  <Card className="h-full bg-card/50 border-border/50 rounded-3xl hover:border-primary/30 transition-all duration-500 overflow-hidden group-hover:shadow-2xl">
                    <CardContent className="p-8 space-y-4">
                      <div className={cn("p-3 rounded-2xl w-fit transition-transform group-hover:scale-110", tool.color)}>
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black font-display group-hover:text-primary transition-colors">{tool.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{tool.desc}</p>
                      </div>
                      <div className="flex items-center text-[10px] font-black uppercase text-primary pt-2">
                        Ouvrir l'atelier <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-black uppercase tracking-widest">Chapitres Récents</h2>
              <Button variant="ghost" size="sm" className="text-primary font-black text-[10px] uppercase tracking-widest">Gérer tout ({story.chapterCount})</Button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all cursor-pointer group">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center font-black text-stone-500 group-hover:text-primary transition-colors border border-border/50">
                    {i}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Chapitre {i} : Le commencement</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Publié le 12 Janvier 2026</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Actif</Badge>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full h-14 border-dashed rounded-2xl text-muted-foreground hover:text-primary hover:border-primary/50 gap-2">
                <Link href={`/dashboard/creations/${storyId}/add-chapter`}>
                  <Plus className="h-4 w-4" /> Ajouter un chapitre
                </Link>
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <Card className="border-none bg-stone-950 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="h-32 w-32" /></div>
            <h3 className="text-lg font-display font-black text-primary mb-6 tracking-widest">Performance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Lectures</p>
                <p className="text-2xl font-black">{Math.floor(story.views / 1000)}k</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Favoris</p>
                <p className="text-2xl font-black">{Math.floor(story.likes / 1000)}k</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-8 rounded-xl border-white/10 text-white hover:bg-white/10 h-11 text-xs font-bold uppercase tracking-widest">
              <Link href="/dashboard/stats">Analytics Détaillés</Link>
            </Button>
          </Card>

          <Card className="border-border/50 bg-card/50 rounded-[2.5rem] p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Prochaine Étape</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-xs font-bold mb-1">Optimisation IA</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">"L'analyse de rythme suggère de dynamiser le chapitre 4 avant publication."</p>
              </div>
              <Button className="w-full rounded-xl bg-primary text-black font-black h-11 text-xs">Corriger avec l'IA</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
