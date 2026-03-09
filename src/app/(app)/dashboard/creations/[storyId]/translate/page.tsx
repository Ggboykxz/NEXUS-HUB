
'use client';

import { useState, use, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, Sparkles, CheckCircle2, ChevronRight, 
  ArrowLeft, MessageSquare, Loader2, Save, Send, Users, 
  Globe, Info, Mic, Wand2, RefreshCcw, Check, Clock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translateContent } from '@/ai/flows/translation-flow';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Story, Chapter } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TranslationStudioPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeLang, setActiveLang] = useState('sw');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Simulation des bulles
  const [panels, setPanels] = useState([
    { id: 1, original: "Hé toi ! Qu'est-ce que tu fais sur les terres sacrées des Orishas ?", translated: "", x: 20, y: 15 },
    { id: 2, original: "Je ne savais pas... Je cherche juste mon chemin vers le village.", translated: "", x: 60, y: 40 }
  ]);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  // 1. Fetch Story & Chapters
  const { data: story } = useQuery<Story>({
    queryKey: ['story-trans', storyId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'stories', storyId));
      return { id: snap.id, ...snap.data() } as Story;
    }
  });

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['story-chapters-trans', storyId],
    queryFn: async () => {
      const q = query(collection(db, 'stories', storyId, 'chapters'), orderBy('chapterNumber', 'asc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
      if (data.length > 0 && !selectedChapterId) setSelectedChapterId(data[0].id);
      return data;
    }
  });

  // 2. Fetch existing translations for selected chapter
  const { data: existingTranslations = [], isLoading: loadingTrans } = useQuery({
    queryKey: ['chapter-translations', storyId, selectedChapterId],
    enabled: !!selectedChapterId,
    queryFn: async () => {
      const q = query(collection(db, 'stories', storyId, 'chapters', selectedChapterId, 'translations'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const submitTranslationMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !selectedChapterId) return;
      
      const transRef = collection(db, 'stories', storyId, 'chapters', selectedChapterId, 'translations');
      await addDoc(transRef, {
        language: activeLang,
        translatorId: currentUser.uid,
        translatorName: currentUser.displayName || 'Traducteur Nexus',
        content: panels,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-translations', storyId, selectedChapterId] });
      toast({ title: "Version soumise !", description: "L'auteur va maintenant réviser votre travail." });
    }
  });

  const handleAiTranslate = async (index: number) => {
    setIsTranslating(true);
    try {
      const result = await translateContent({
        text: panels[index].original,
        targetLang: activeLang as any,
        context: "Une scène de dialogue dans un webtoon africain."
      });
      
      const newPanels = [...panels];
      newPanels[index].translated = result.translatedText;
      setPanels(newPanels);
      
      toast({ title: "IA : Traduction effectuée", description: result.culturalNotes });
    } catch (e) {
      toast({ title: "Erreur IA", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const isOwner = currentUser?.uid === story?.artistId;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2">
            <ArrowLeft className="h-4 w-4" /> Retour à l'Atelier
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <Languages className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-display tracking-tight text-white">Studio de Traduction</h1>
          </div>
          <p className="text-stone-500 text-lg italic font-light">"Exportez votre univers au-delà des frontières linguistiques."</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
            <SelectTrigger className="h-12 w-48 bg-stone-900 border-white/10 rounded-xl text-white font-bold">
              <SelectValue placeholder="Épisode" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-white/10">
              {chapters.map(c => (
                <SelectItem key={c.id} value={c.id}>Épisode {c.chapterNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => submitTranslationMutation.mutate()} 
            disabled={submitTranslationMutation.isPending || !selectedChapterId}
            className="rounded-full bg-primary text-black font-black px-8 h-12 gold-shimmer shadow-xl shadow-primary/20"
          >
            {submitTranslationMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <><Send className="mr-2 h-4 w-4" /> Publier la version</>}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-12">
        <div className="space-y-8">
          <Card className="border-none bg-stone-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[600px] flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 right-0 h-14 bg-black/40 backdrop-blur-md border-b border-white/5 z-10 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black uppercase tracking-widest px-3">Mode Édition</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-stone-300">Langue cible : {activeLang.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-[2/3] w-full max-w-[450px] rounded-xl overflow-hidden shadow-2xl border-4 border-stone-800 bg-stone-800 my-20">
              <Image src="https://picsum.photos/seed/trans-preview/800/1200" alt="Page preview" fill className="object-cover opacity-40" />
              {panels.map((p) => (
                <div 
                  key={p.id}
                  className="absolute p-4 bg-white rounded-[2rem] shadow-xl border-2 border-primary/20 max-w-[180px] animate-in zoom-in-95 duration-500"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <p className="text-[10px] text-black font-medium leading-tight">
                    {p.translated || <span className="text-stone-400 italic">...</span>}
                  </p>
                  <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-primary/20" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-8">
          <Tabs defaultValue="dialogues" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl h-12 border border-border/50">
              <TabsTrigger value="dialogues" className="rounded-xl font-bold text-xs uppercase">Bulles</TabsTrigger>
              <TabsTrigger value="versions" className="rounded-xl font-bold text-xs uppercase">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="dialogues" className="space-y-4 pt-4 animate-in fade-in duration-500">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {panels.map((panel, idx) => (
                    <Card key={panel.id} className="bg-white/5 border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase font-black text-stone-500">Original (FR)</Label>
                        <p className="text-xs text-stone-300 italic">"{panel.original}"</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[9px] uppercase font-black text-emerald-500">Traduction</Label>
                          <Button onClick={() => handleAiTranslate(idx)} disabled={isTranslating} variant="ghost" size="sm" className="h-6 gap-1 px-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                            {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            <span className="text-[8px] font-black uppercase">IA</span>
                          </Button>
                        </div>
                        <Textarea 
                          value={panel.translated}
                          onChange={(e) => {
                            const newPanels = [...panels];
                            newPanels[idx].translated = e.target.value;
                            setPanels(newPanels);
                          }}
                          className="min-h-[80px] bg-black/40 border-none rounded-xl text-xs text-white"
                          placeholder="Saisissez la traduction..."
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="versions" className="space-y-4 pt-4 animate-in fade-in duration-500">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 px-2 mb-4">Historique</h3>
              {loadingTrans ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-stone-700" /></div>
              ) : existingTranslations.length > 0 ? (
                <div className="space-y-4">
                  {existingTranslations.map((trans: any) => (
                    <Card key={trans.id} className="bg-white/5 border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg"><Globe className="h-4 w-4 text-primary" /></div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{trans.language}</p>
                            <p className="text-[9px] text-stone-500">par {trans.translatorName}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-2">{trans.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                  <p className="text-[10px] text-stone-600 uppercase font-black">Aucune version</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Card className="bg-stone-900 border-none rounded-[2rem] p-8 space-y-4">
            <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Guide Qualité
            </h4>
            <p className="text-[10px] text-stone-400 italic leading-relaxed">
              "Vérifiez que les onomatopées sont adaptées à la langue cible pour une immersion totale."
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
