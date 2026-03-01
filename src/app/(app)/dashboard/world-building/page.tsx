'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, Map, Sparkles, Film, Palette, Layers, Zap, Landmark, 
  ScrollText, Mic, Accessibility, MessageSquareQuote, Newspaper, 
  ArrowRight, Loader2, Save, BookOpen, AlertCircle, CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function WorldBuildingPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [loadingStories, setLoadingStories] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Auth & Stories Fetch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const q = query(collection(db, 'stories'), where('artistId', '==', user.uid));
          const snap = await getDocs(q);
          const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setMyStories(fetched);
          if (fetched.length > 0) setSelectedStoryId(fetched[0].id);
        } catch (e) {
          console.error(e);
        }
      }
      setLoadingStories(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Notes for Selected Story
  useEffect(() => {
    async function fetchNotes() {
      if (!currentUser || !selectedStoryId || selectedStoryId === 'none') return;
      setLoadingNotes(true);
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'worldBuilding', selectedStoryId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setNotes(snap.data() as Record<string, string>);
        } else {
          setNotes({});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingNotes(false);
      }
    }
    fetchNotes();
  }, [currentUser, selectedStoryId]);

  // 3. Auto-save with Debounce
  const saveNotes = useCallback(async (updatedNotes: Record<string, string>) => {
    if (!currentUser || !selectedStoryId || selectedStoryId === 'none') return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'worldBuilding', selectedStoryId);
      await setDoc(docRef, {
        ...updatedNotes,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, selectedStoryId]);

  const handleNoteChange = (categoryId: string, value: string) => {
    const newNotes = { ...notes, [categoryId]: value };
    setNotes(newNotes);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(newNotes);
    }, 2000);
  };

  const templates = [
    {
      id: "geography",
      title: "Géographie & Topographie",
      icon: Map,
      description: "Structures de cités-états côtières, royaumes désertiques ou citadelles de haute altitude.",
      tags: ["Climat", "Architecture", "Ressources"]
    },
    {
      id: "magic",
      title: "Systèmes de Magie",
      icon: Zap,
      description: "Inspirations basées sur les forces élémentaires, le culte des ancêtres ou les énergies cosmiques.",
      tags: ["Dogon", "Yoruba", "Mysticisme"]
    },
    {
      id: "social",
      title: "Structures Sociales",
      icon: Landmark,
      description: "Lignages matrilinéaires, systèmes de castes, ou confédérations nomades.",
      tags: ["Politique", "Tradition", "Hiérarchie"]
    },
    {
      id: "lore",
      title: "Langues & Folklore",
      icon: ScrollText,
      description: "Outils pour créer des dialectes uniques et intégrer des proverbes et contes oraux.",
      tags: ["Linguistique", "Mythes", "Oralité"]
    }
  ];

  const cinemaInspirations = [
    {
      title: "L'Esthétique Futuriste",
      reference: "Black Panther (Ryan Coogler)",
      description: "Mélange de haute technologie et de textures traditionnelles (vibranium, motifs adinkra).",
      imageUrl: "https://images.unsplash.com/photo-1609804213568-19c806540d6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      imageHint: "afrofuturism high tech"
    },
    {
      title: "Le Mysticisme Onirique",
      reference: "Atlantique (Mati Diop)",
      description: "Utilisation de la lumière et du décor pour créer une ambiance fantastique et mélancolique.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      imageHint: "mystic ocean night"
    },
    {
      title: "L'Épopée Historique",
      reference: "La Noire de... (Ousmane Sembène)",
      description: "Force du cadre et symbolisme profond dans la narration visuelle.",
      imageUrl: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      imageHint: "historical african cinematography"
    }
  ];

  if (loadingStories) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 bg-stone-950 min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Invoquer l'Atelier...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Globe className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-display">Atelier de World Building</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Bâtissez des univers cohérents et immersifs. Vos notes sont sauvegardées automatiquement dans les archives de NexusHub.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex flex-col gap-1.5 min-w-[240px]">
              <label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Lié à l'œuvre</label>
              <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
                <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-xl font-bold text-white shadow-xl">
                  <SelectValue placeholder="Choisir un projet" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-white/10">
                  {myStories.map(s => (
                    <SelectItem key={s.id} value={s.id} className="font-medium">{s.title}</SelectItem>
                  ))}
                  {myStories.length === 0 && <SelectItem value="none" disabled>Aucune œuvre trouvée</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
                <Button asChild variant="outline" className="rounded-xl h-12 border-white/10 text-white">
                    <Link href="/blog"><Newspaper className="mr-2 h-4 w-4" /> Blog</Link>
                </Button>
                <Button asChild className="rounded-xl h-12 bg-primary text-black font-black gold-shimmer shadow-xl shadow-primary/20">
                    <Link href="/dashboard/creations">Mon Atelier</Link>
                </Button>
            </div>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 border border-border/50">
            <TabsTrigger value="templates" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <Layers className="h-4 w-4" /> Grimoires de l'Univers
            </TabsTrigger>
            <TabsTrigger value="inspiration" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <Film className="h-4 w-4" /> Inspiration Ciné
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Accessibility className="h-4 w-4" /> Accessibilité
            </TabsTrigger>
            <TabsTrigger value="assets" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <Palette className="h-4 w-4" /> Bibliothèque
            </TabsTrigger>
          </TabsList>

          <div className="hidden md:flex items-center gap-3">
            {isSaving ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none animate-pulse gap-2 px-4 py-1.5 rounded-full uppercase text-[9px] font-black">
                <Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde Nexus en cours...
              </Badge>
            ) : (
              <Badge variant="outline" className="border-white/10 text-stone-500 gap-2 px-4 py-1.5 rounded-full uppercase text-[9px] font-black">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Archives Synchronisées
              </Badge>
            )}
          </div>
        </div>

        <TabsContent value="templates" className="space-y-8 animate-in fade-in duration-700">
          {!selectedStoryId || selectedStoryId === 'none' ? (
            <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 space-y-8">
              <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                <BookOpen className="h-10 w-10 text-stone-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Atelier Vierge</h3>
                <p className="text-stone-500 italic max-w-sm mx-auto leading-relaxed">"Sélectionnez ou créez une œuvre pour commencer à bâtir les fondations de son univers."</p>
              </div>
              <Button asChild variant="outline" className="rounded-full px-12 h-14 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase text-xs tracking-widest transition-all">
                <Link href="/submit">Lancer un projet</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {templates.map((template) => (
                <Card key={template.id} className="group border-none bg-card/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-primary/10 p-3 rounded-2xl transition-transform group-hover:scale-110">
                        <template.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-white/5 text-stone-500 border-none text-[8px] font-black uppercase tracking-widest px-2">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-display font-black text-white">{template.title}</CardTitle>
                    <CardDescription className="text-xs text-stone-500 italic mt-1 leading-relaxed">"{template.description}"</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="relative">
                      <Textarea 
                        value={notes[template.id] || ''}
                        onChange={(e) => handleNoteChange(template.id, e.target.value)}
                        placeholder="Consignez vos recherches ici... (La sauvegarde est automatique)"
                        className="min-h-[250px] bg-background/50 border-none rounded-2xl p-6 text-base font-light italic leading-relaxed focus-visible:ring-primary shadow-inner text-white placeholder:text-stone-700"
                      />
                      {loadingNotes && (
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inspiration" className="space-y-12 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cinemaInspirations.map((item, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-xl bg-stone-900/50 rounded-[2.5rem] group hover:shadow-primary/5 transition-all">
                <div className="relative aspect-video">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-[5000ms] group-hover:scale-110"
                    data-ai-hint={item.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-primary text-black border-none font-black text-[9px] uppercase tracking-widest px-3">{item.reference}</Badge>
                  </div>
                </div>
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-display font-black text-white group-hover:text-primary transition-colors">{item.title}</CardTitle>
                  <p className="text-xs text-stone-400 leading-relaxed font-light italic mt-2">
                    {item.description}
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Button variant="ghost" className="px-0 h-auto text-primary font-black text-[10px] uppercase tracking-widest hover:bg-transparent hover:gap-3 transition-all">
                    Explorer l'esthétique <Sparkles className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-10 border-none bg-emerald-500/[0.03] rounded-[3rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Mic className="h-48 w-48 text-emerald-500" /></div>
                    <div className="bg-emerald-500/10 p-4 rounded-3xl w-fit mb-8 shadow-inner">
                        <Mic className="h-10 w-10 text-emerald-500" />
                    </div>
                    <CardTitle className="text-3xl font-display font-black text-emerald-500 mb-4">Voice-to-Text pour Scénaristes</CardTitle>
                    <p className="text-stone-400 leading-relaxed mb-10 text-lg font-light italic">
                        "Un outil révolutionnaire permettant aux créateurs en situation de handicap (moteur ou visuel) de rédiger leurs scénarios, dialogues et descriptions d'univers par la voix. Support multilingue inclus."
                    </p>
                    <Button onClick={() => toast({title: "Microphone activé", description: "Prêt pour la dictée vocale..."})} className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20">
                        Lancer l'Assistant Vocal
                    </Button>
                </Card>

                <Card className="p-10 border-none bg-primary/[0.03] rounded-[3rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:-rotate-12 transition-transform duration-1000"><Languages className="h-48 w-48 text-primary" /></div>
                    <div className="bg-primary/10 p-4 rounded-3xl w-fit mb-8 shadow-inner">
                        <MessageSquareQuote className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-display font-black text-primary mb-4">Traduction Culturelle Assistée</CardTitle>
                    <p className="text-stone-400 leading-relaxed mb-10 text-lg font-light italic">
                        "Traduisez vos univers en Swahili, Wolof ou Yoruba tout en préservant les nuances culturelles et les expressions idiomatiques. Un pont entre les régions du continent."
                    </p>
                    <Button variant="outline" className="w-full h-14 rounded-xl border-primary text-primary hover:bg-primary hover:text-black font-black text-lg shadow-xl shadow-primary/10 transition-all">
                        Accéder au Traducteur
                    </Button>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="assets" className="animate-in fade-in duration-700">
          <Card className="p-20 text-center border-2 border-dashed border-white/5 bg-stone-900/30 rounded-[3.5rem] space-y-8">
            <div className="mx-auto bg-primary/10 rounded-full p-8 w-fit mb-6 shadow-xl">
              <Palette className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-display font-black text-white">Bibliothèque d'Assets Visuels</CardTitle>
              <CardDescription className="max-w-md mx-auto italic text-lg">
                "Retrouvez bientôt une collection de palettes de couleurs inspirées du Sahel et des savanes, ainsi qu'une banque de motifs géométriques traditionnels."
              </CardDescription>
            </div>
            <Button className="h-12 px-10 rounded-full font-black text-xs uppercase tracking-widest" disabled>Bientôt disponible dans le Grimoire</Button>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="mt-20 p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex items-center gap-6">
        <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-500/80 leading-relaxed italic font-medium">
          Note de l'Éditeur : "Un univers cohérent est la clé de la fidélisation des lecteurs. Prenez le temps de détailler votre world building avant de lancer votre premier chapitre. L'IA Nexus analysera ces notes pour vous suggérer des directions narratives pertinentes."
        </p>
      </section>
    </div>
  );
}