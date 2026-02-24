'use client';

import { useState, useMemo, useEffect } from 'react';
import { stories, artists } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  PlusCircle, ArrowLeft, CalendarIcon, UploadCloud, FilePen, Trash2, 
  MoreHorizontal, Users, History, CheckCircle2, AlertCircle, 
  Layers, ShieldCheck, Clock, Split, Zap, Filter, Eye, Settings2, Sparkles, LayoutGrid,
  Coins, MessageSquare, ChevronRight, UserPlus, SlidersHorizontal, BarChart3, Bot, Languages, Wand2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { creativeAssistant } from '@/ai/flows/creative-assistant-flow';
import { translateContent } from '@/ai/flows/translation-flow';

export default function ManageStoryPage({ params: propsParams }: { params: Promise<{ storyId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [resolvedParams, setResolvedParams] = useState<{ storyId: string } | null>(null);

  // AI Assistant States
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    propsParams.then(setResolvedParams);
  }, [propsParams]);

  if (!resolvedParams) return null;

  const story = stories.find(s => s.id === resolvedParams.storyId) as any;
  if (!story) notFound();

  const artist = artists.find(a => a.id === story.artistId);

  const handleAISuggestion = async (type: 'dialogue' | 'synopsis' | 'brainstorm') => {
    setIsAiLoading(true);
    try {
      const result = await creativeAssistant({
        type,
        context: `Série: ${story.title}. Genre: ${story.genre}.`,
        content: aiPrompt,
        tone: 'héroïque'
      });
      setAiResult(result);
    } catch (e) {
      toast({ title: "Erreur IA", description: "L'oracle numérique est temporairement indisponible.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="group rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'atelier
        </Button>
        <div className="flex gap-2">
            <Button onClick={() => setIsAIOpen(true)} variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 text-primary bg-primary/5 hover:bg-primary/10">
                <Bot className="h-4 w-4" /> Assistant IA Nexus
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-2 border-emerald-500/20 text-emerald-500">
                <ShieldCheck className="h-4 w-4" /> Mode Production
            </Button>
        </div>
      </div>

      {/* STORY HEADER */}
      <Card className="border-none bg-stone-900 shadow-2xl overflow-hidden relative rounded-[2rem]">
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="relative w-48 h-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5">
                <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
                <div className="absolute -bottom-3 -right-3">
                    <Badge className="bg-primary text-black border-none px-3 py-1 shadow-lg font-black text-[10px] uppercase">{story.format}</Badge>
                </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter gold-resplendant">{story.title}</h1>
                <p className="text-stone-400 font-light italic">"{story.description.slice(0, 150)}..."</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5 h-11" asChild>
                    <Link href={`/webtoon-hub/${story.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Voir comme un lecteur</Link>
                </Button>
                <Button onClick={() => setIsAIOpen(true)} className="rounded-xl h-11 px-6 bg-primary text-black font-bold gap-2">
                    <Sparkles className="h-4 w-4" /> Optimiser avec l'IA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* TABS */}
      <Tabs defaultValue="chapters" className="mt-12">
        <TabsList className="bg-muted/30 p-1 rounded-2xl border border-white/5 h-12 mb-8">
            <TabsTrigger value="chapters" className="rounded-xl px-6 gap-2 font-black text-xs uppercase">Chapitres</TabsTrigger>
            <TabsTrigger value="co-creation" className="rounded-xl px-6 gap-2 font-black text-xs uppercase">Co-création</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl px-6 gap-2 font-black text-xs uppercase">Performances</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters">
            <Card className="bg-stone-900/50 border-none rounded-3xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="pl-8 py-6 uppercase text-[10px] font-black text-stone-500 tracking-widest">Épisode</TableHead>
                            <TableHead className="uppercase text-[10px] font-black text-stone-500 tracking-widest">Statut</TableHead>
                            <TableHead className="uppercase text-[10px] font-black text-stone-500 tracking-widest">IA Insight</TableHead>
                            <TableHead className="text-right pr-8 uppercase text-[10px] font-black text-stone-500 tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {story.chapters.map((chapter: any) => (
                            <TableRow key={chapter.id} className="group border-white/5 hover:bg-white/[0.02]">
                                <TableCell className="pl-8 py-6 font-bold text-white">{chapter.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">{chapter.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-cyan-500 text-[10px] font-black">
                                        <CheckCircle2 className="h-3 w-3" /> RYTHME OPTIMAL
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <Button variant="ghost" size="icon" className="text-stone-500 hover:text-primary"><FilePen className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </TabsContent>
      </Tabs>

      {/* AI ASSISTANT DIALOG */}
      <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
        <DialogContent className="sm:max-w-[600px] bg-stone-950 border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-500 to-primary" />
            <div className="p-8 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl"><Bot className="h-8 w-8 text-primary" /></div>
                    <div>
                        <h2 className="text-2xl font-display font-black text-white">Assistant IA Nexus</h2>
                        <p className="text-stone-400 text-xs italic">Propulsé par Genkit & Gemini 2.5 Flash</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black text-primary tracking-widest">Votre requête ou texte original</Label>
                    <Textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ex: Reformule ce dialogue pour qu'il soit plus dramatique..." 
                        className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl text-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handleAISuggestion('dialogue')} disabled={isAiLoading} variant="outline" className="text-[10px] font-black h-10 gap-2 border-white/10 rounded-xl">
                            <Languages className="h-3.5 w-3.5 text-cyan-500" /> DIALOGUES
                        </Button>
                        <Button onClick={() => handleAISuggestion('synopsis')} disabled={isAiLoading} variant="outline" className="text-[10px] font-black h-10 gap-2 border-white/10 rounded-xl">
                            <Wand2 className="h-3.5 w-3.5 text-emerald-500" /> SYNOPSIS
                        </Button>
                        <Button onClick={() => handleAISuggestion('brainstorm')} disabled={isAiLoading} variant="outline" className="text-[10px] font-black h-10 gap-2 border-white/10 rounded-xl">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> IDÉES
                        </Button>
                    </div>
                </div>

                {isAiLoading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4 animate-pulse">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">L'IA forge vos idées...</p>
                    </div>
                )}

                {aiResult && !isAiLoading && (
                    <Card className="bg-primary/5 border-primary/20 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase text-primary">Suggestions de l'Oracle</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {aiResult.suggestions.map((s: string, i: number) => (
                                    <div key={i} className="bg-black/40 p-3 rounded-xl border border-white/5 text-sm text-stone-200 leading-relaxed italic">
                                        "{s}"
                                    </div>
                                ))}
                            </div>
                            <Separator className="bg-primary/10" />
                            <p className="text-[10px] text-stone-500 leading-relaxed font-light">{aiResult.explanation}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-3">
                    <Button onClick={() => setIsAIOpen(false)} variant="ghost" className="flex-1 rounded-xl text-stone-500 font-bold">Fermer</Button>
                    {aiResult && <Button className="flex-1 rounded-xl bg-primary text-black font-black">Appliquer</Button>}
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
