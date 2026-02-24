'use client';

import { useState, use, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, Sparkles, CheckCircle2, ChevronRight, 
  ArrowLeft, MessageSquare, Loader2, Save, Send, Users, 
  Globe, Info, Mic, Wand2, RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translateContent } from '@/ai/flows/translation-flow';

export default function TranslationStudioPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  const [panels, setPanels] = useState([
    { id: 1, original: "Hé toi ! Qu'est-ce que tu fais sur les terres sacrées des Orishas ?", translated: "", x: 20, y: 15 },
    { id: 2, original: "Je ne savais pas... Je cherche juste mon chemin vers le village.", translated: "", x: 60, y: 40 }
  ]);

  const handleAiTranslate = async (index: number) => {
    setIsTranslating(true);
    try {
      const result = await translateContent({
        text: panels[index].original,
        targetLang: activeLang as any,
        context: "Une scène de rencontre tendue dans un temple sacré."
      });
      
      const newPanels = [...panels];
      newPanels[index].translated = result.translatedText;
      setPanels(newPanels);
      
      toast({
        title: "Traduction IA réussie",
        description: result.culturalNotes || "Nuances préservées.",
      });
    } catch (e) {
      toast({ title: "Erreur IA", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    toast({ title: "Modifications enregistrées", description: "Votre travail a été sauvegardé dans le cloud Nexus." });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="space-y-2">
          <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2">
            <ArrowLeft className="h-4 w-4" /> Retour à l'œuvre
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <Languages className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-display tracking-tight">Studio de Traduction</h1>
          </div>
          <p className="text-muted-foreground text-lg italic font-light">"Exportez votre univers au-delà des frontières linguistiques."</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} className="rounded-full px-8 h-12 border-primary/20 text-primary">
            <Save className="mr-2 h-4 w-4" /> Sauvegarder
          </Button>
          <Button className="rounded-full bg-primary text-black font-black px-8 h-12 gold-shimmer">
            <Send className="mr-2 h-4 w-4" /> Publier la version
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* VIEWPORT TRADUCTION */}
        <div className="space-y-6">
          <Card className="border-none bg-stone-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[600px]">
            <div className="absolute top-0 left-0 right-0 h-14 bg-black/40 backdrop-blur-md border-b border-white/5 z-10 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black uppercase tracking-widest px-3">Mode Édition Bulles</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-stone-300">Cible : {activeLang === 'sw' ? 'Swahili' : activeLang === 'ha' ? 'Hausa' : 'Anglais'}</span>
                </div>
              </div>
            </div>

            <div className="p-12 flex justify-center">
              <div className="relative aspect-[2/3] w-full max-w-[500px] rounded-xl overflow-hidden shadow-2xl border-4 border-stone-800 bg-stone-800">
                <Image src="https://picsum.photos/seed/trans1/800/1200" alt="Page de BD" fill className="object-cover opacity-40" />
                
                {/* BULLES INTERACTIVES */}
                {panels.map((p, i) => (
                  <div 
                    key={p.id}
                    className="absolute p-4 bg-white rounded-[2rem] shadow-xl border-2 border-primary/20 max-w-[180px] animate-in zoom-in-95 duration-500"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <p className="text-[10px] text-black font-medium leading-tight">
                      {p.translated || <span className="text-stone-400 italic">En attente de traduction...</span>}
                    </p>
                    <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-primary/20" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* SIDEBAR ÉDITEUR */}
        <aside className="space-y-6">
          <Tabs defaultValue="dialogues" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl h-12 border border-border/50">
              <TabsTrigger value="dialogues" className="rounded-xl font-bold text-xs uppercase">Dialogues</TabsTrigger>
              <TabsTrigger value="team" className="rounded-xl font-bold text-xs uppercase">Équipe</TabsTrigger>
            </TabsList>

            <TabsContent value="dialogues" className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Wand2 className="h-4 w-4" /> Panneaux ({panels.length})
                </h3>
                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase">Réinitialiser</Button>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {panels.map((panel, idx) => (
                    <Card key={panel.id} className="bg-card/50 border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all space-y-4 group">
                      <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-black text-stone-500 tracking-widest">Original (FR)</Label>
                        <p className="text-xs text-foreground/80 italic line-clamp-2">"{panel.original}"</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[9px] uppercase font-black text-emerald-500 tracking-widest">Traduction ({activeLang.toUpperCase()})</Label>
                          <Button 
                            onClick={() => handleAiTranslate(idx)} 
                            disabled={isTranslating}
                            variant="ghost" 
                            size="sm" 
                            className="h-6 gap-1.5 px-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          >
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
                          placeholder="Écrire la traduction ici..."
                          className="min-h-[80px] bg-background/50 border-none rounded-xl text-xs font-medium"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team" className="pt-4">
              <Card className="bg-emerald-500/[0.02] border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                <div className="bg-emerald-500/10 p-3 rounded-2xl w-fit mx-auto">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
                <h4 className="font-bold text-emerald-500">Collaborateurs</h4>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "Invitez un traducteur certifié NexusHub pour réviser et valider vos versions étrangères."
                </p>
                <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-xl font-bold text-xs h-10">
                  Chercher un Traducteur
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* FOOTER INFO */}
      <section className="mt-16 p-8 rounded-[2.5rem] bg-muted/30 border border-border/50 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          <Info className="h-8 w-8 text-stone-400" />
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "NexusHub ne remplace pas l'humain. Notre IA de traduction est un outil d'assistance qui préserve les idiomes culturels, mais une relecture par un natif ou un traducteur certifié est fortement recommandée pour les œuvres Elite."
          </p>
        </div>
      </section>
    </div>
  );
}
