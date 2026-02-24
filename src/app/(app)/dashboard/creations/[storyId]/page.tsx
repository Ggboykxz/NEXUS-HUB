'use client';

import { useState, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  PlusCircle, ArrowLeft, CalendarIcon, UploadCloud, FilePen, Trash2, 
  MoreHorizontal, Users, History, CheckCircle2, AlertCircle, 
  Layers, ShieldCheck, Clock, Split, Zap, Filter, Eye, Settings2, Sparkles, LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import type { Chapter, Story } from '@/lib/types';

export default function ManageStoryPage({ params }: { params: { storyId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  
  // States pour les dialogues
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isABTestingOpen, setIsABTestingOpen] = useState(false);
  
  // Form Chapter States
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(true);
  const [selectedArc, setSelectedArc] = useState<string>('none');

  const story = stories.find(s => s.id === params.storyId) as any;
  if (!story) notFound();

  const artist = artists.find(a => a.id === story.artistId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Publié':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Publié</Badge>;
      case 'Programmé':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Programmé</Badge>;
      default:
        return <Badge variant="outline" className="opacity-60">Brouillon</Badge>;
    }
  };

  const handleAddChapter = () => {
    toast({
      title: scheduledDate ? "Chapitre programmé !" : "Chapitre sauvegardé",
      description: scheduledDate 
        ? `Sera publié le ${format(scheduledDate, 'PPP', { locale: fr })}.` 
        : "Votre nouveau chapitre est prêt dans vos brouillons.",
    });
    setIsAddChapterOpen(false);
    setScheduledDate(undefined);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="group rounded-full hover:bg-primary/5">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'atelier
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 text-primary">
                <ShieldCheck className="h-4 w-4" /> Mode Protection Actif
            </Button>
        </div>
      </div>

      {/* STORY HEADER & AB TESTING PREVIEW */}
      <Card className="border-none bg-stone-900 shadow-2xl overflow-hidden relative rounded-[2rem]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="relative group shrink-0">
                <div className="relative w-48 h-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-white/5">
                    <Image
                        src={story.coverImage.imageUrl}
                        alt={story.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="rounded-full font-bold" onClick={() => setIsABTestingOpen(true)}>
                            <Split className="mr-2 h-4 w-4" /> A/B Test Cover
                        </Button>
                    </div>
                </div>
                <div className="absolute -bottom-3 -right-3">
                    <Badge className="bg-primary text-black border-none px-3 py-1 shadow-lg font-black text-[10px] uppercase tracking-widest">{story.format}</Badge>
                </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter gold-resplendant">{story.title}</h1>
                    {story.isPremium && <Badge className="bg-amber-500 text-black border-none animate-pulse">PREMIUM</Badge>}
                </div>
                {artist && (
                    <div className="flex items-center gap-2 text-stone-400">
                        <span className="text-sm">Créé par</span>
                        <Link className="text-primary hover:text-primary/80 font-bold transition-colors" href={`/artiste/${artist.slug}`}>{artist.name}</Link>
                        <Separator orientation="vertical" className="h-3 bg-stone-700" />
                        <span className="text-xs uppercase font-black tracking-widest">{story.genre}</span>
                    </div>
                )}
              </div>

              <p className="text-base leading-relaxed text-stone-300 max-w-2xl font-light italic">"{story.description}"</p>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5 h-11" asChild>
                    <Link href={`/webtoon/${story.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Voir comme un lecteur</Link>
                </Button>
                <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5 h-11">
                    <Settings2 className="mr-2 h-4 w-4" /> Configuration Éditoriale
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* ADVANCED CONTENT TABS */}
      <Tabs defaultValue="chapters" className="mt-12 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 border-b border-white/5 pb-4">
            <TabsList className="bg-muted/30 p-1 rounded-2xl border border-white/5 h-12">
                <TabsTrigger value="chapters" className="rounded-xl px-6 gap-2 font-black text-xs uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-black">
                    <History className="h-4 w-4" /> Chapitres
                </TabsTrigger>
                <TabsTrigger value="arcs" className="rounded-xl px-6 gap-2 font-black text-xs uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-black">
                    <Layers className="h-4 w-4" /> Saisons & Arcs
                </TabsTrigger>
                <TabsTrigger value="team" className="rounded-xl px-6 gap-2 font-black text-xs uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-black">
                    <Users className="h-4 w-4" /> Équipe
                </TabsTrigger>
            </TabsList>

            <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto h-12 px-8 rounded-full font-black text-sm shadow-xl shadow-primary/20 gold-shimmer bg-primary text-black">
                        <PlusCircle className="mr-2 h-5 w-5" /> Publier un Chapitre
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-stone-950 rounded-[2rem] shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                    <DialogHeader className="p-8 bg-white/5">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-primary/10 p-3 rounded-2xl"><Zap className="h-6 w-6 text-primary" /></div>
                            <div>
                                <DialogTitle className="text-2xl font-display font-black text-white">Publication Avancée</DialogTitle>
                                <DialogDescription className="text-stone-400 font-light italic">Configurez votre nouvel épisode avec les outils Nexus Pro.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <ScrollArea className="max-h-[70vh] p-8">
                        <div className="grid gap-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Titre de l'épisode</Label>
                                    <Input placeholder="Ex: L'Éveil de la Prophétie" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Appartenance</Label>
                                    <Select value={selectedArc} onValueChange={setSelectedArc}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Hors Saison</SelectItem>
                                            <SelectItem value="s1">Saison 1 : Origines</SelectItem>
                                            <SelectItem value="s2">Saison 2 : La Guerre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Upload Multi-Format (PSD, PDF, JPG, WebP)</Label>
                                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer">
                                    <UploadCloud className="h-12 w-12 text-stone-600 group-hover:text-primary mb-4 transition-colors animate-bounce" />
                                    <p className="text-stone-300 mb-2 font-bold">Glissez vos fichiers ici</p>
                                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-6">NexusHub convertit automatiquement vos PSD et PDF en WebP HD.</p>
                                    <Button variant="secondary" size="sm" className="rounded-full h-9 px-6 font-black text-[10px] uppercase tracking-widest">Parcourir</Button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
                                    <CardHeader className="p-5 pb-2">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                            <Clock className="h-4 w-4 text-blue-400" /> Publication Programmée
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 space-y-4">
                                        <p className="text-[10px] text-stone-400 leading-relaxed italic">Définissez une heure précise de sortie. Nous gérons le fuseau horaire automatiquement.</p>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("w-full justify-start text-left h-10 rounded-xl bg-black/40 border-white/10 text-xs", !scheduledDate && "text-stone-500")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {scheduledDate ? format(scheduledDate, 'PPP HH:mm', { locale: fr }) : "Choisir date et heure"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-stone-900 border-white/10">
                                                <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus className="text-white" />
                                            </PopoverContent>
                                        </Popover>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all">
                                    <CardHeader className="p-5 pb-2">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Protection Piratage
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 space-y-4">
                                        <p className="text-[10px] text-stone-400 leading-relaxed italic">Appliquer un watermark automatique avec votre nom d'artiste sur chaque case.</p>
                                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                            <Label className="text-[10px] uppercase font-black text-stone-300">Activer Watermark</Label>
                                            <Switch checked={isWatermarkEnabled} onCheckedChange={setIsWatermarkEnabled} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-8 border-t border-white/5 flex gap-4">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-full text-stone-400 hover:text-white font-bold h-12 px-8">Brouillon</Button>
                        </DialogClose>
                        <Button onClick={handleAddChapter} className="flex-1 rounded-full h-12 font-black text-lg shadow-xl shadow-primary/20 gold-shimmer bg-primary text-black">
                            {scheduledDate ? 'Programmer la sortie' : 'Publier Maintenant'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <TabsContent value="chapters" className="space-y-8 animate-in fade-in duration-500">
            <Card className="border-none shadow-2xl bg-stone-900/50 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="w-[45%] pl-8 py-6 uppercase text-[10px] font-black tracking-[0.2em] text-stone-500">Titre & Note de version</TableHead>
                                <TableHead className="uppercase text-[10px] font-black tracking-[0.2em] text-stone-500">Saison</TableHead>
                                <TableHead className="uppercase text-[10px] font-black tracking-[0.2em] text-stone-500">Statut</TableHead>
                                <TableHead className="uppercase text-[10px] font-black tracking-[0.2em] text-stone-500">Version</TableHead>
                                <TableHead className="text-right pr-8 uppercase text-[10px] font-black tracking-[0.2em] text-stone-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {story.chapters.length > 0 ? story.chapters.map((chapter: any) => (
                            <TableRow key={chapter.id} className="group border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell className="pl-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border border-white/5">
                                            <Image src={story.coverImage.imageUrl} alt={chapter.title} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-base group-hover:text-primary transition-colors">{chapter.title}</div>
                                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium mt-1">Publié le {format(new Date(chapter.releaseDate), 'dd MMM yyyy', { locale: fr })}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-white/10 text-stone-400 font-bold text-[9px] uppercase">Saison 1</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(chapter.status)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="secondary" className="font-mono text-[9px] w-fit bg-blue-500/10 text-blue-400 border-none">{chapter.version || 'v1.0'}</Badge>
                                        <span className="text-[8px] text-stone-600 uppercase font-black tracking-tighter">Dernière révision</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-white/10 bg-stone-900 shadow-2xl">
                                            <DropdownMenuLabel className="text-[9px] uppercase font-black text-stone-500 px-3 py-2 tracking-widest">Options Avancées</DropdownMenuLabel>
                                            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs"><FilePen className="h-4 w-4 text-primary" /> Modifier le contenu</DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs"><History className="h-4 w-4 text-primary" /> Historique des révisions</DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs"><Clock className="h-4 w-4 text-primary" /> Reprogrammer la sortie</DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/5" />
                                            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"><Trash2 className="h-4 w-4" /> Supprimer définitivement</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Zap className="h-10 w-10 text-stone-700" />
                                            <p className="text-stone-500 italic text-sm">Prêt à entrer dans la légende ? <br/> Publiez votre premier chapitre.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="arcs" className="animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-dashed border-white/5 bg-transparent hover:border-primary/30 transition-all flex flex-col items-center justify-center p-12 group cursor-pointer rounded-[2rem]">
                    <div className="bg-primary/5 p-4 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                        <PlusCircle className="h-10 w-10 text-stone-700 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Nouvelle Saison / Arc</h3>
                    <p className="text-xs text-stone-500 mt-2 text-center">Groupez vos épisodes pour une meilleure expérience lecteur.</p>
                </Card>

                {['Saison 1 : Les Origines', 'Saison 2 : L\'Invasion'].map((arc, i) => (
                    <Card key={i} className="bg-stone-900 border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all">
                        <CardHeader className="p-6">
                            <div className="flex justify-between items-start">
                                <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-3">Saison {i+1}</Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500"><Settings2 className="h-4 w-4" /></Button>
                            </div>
                            <CardTitle className="text-xl font-display font-black text-white mt-4">{arc}</CardTitle>
                            <CardDescription className="text-xs text-stone-500">12 chapitres &bull; Arc en cours</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-6 pt-0">
                            <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs uppercase tracking-widest">Gérer les chapitres <ArrowLeft className="ml-2 h-3 w-3 rotate-180" /></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="team" className="animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-stone-900 border-white/5 rounded-[2rem] p-8">
                        <CardHeader className="p-0 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500/10 p-3 rounded-2xl"><ShieldCheck className="h-6 w-6 text-emerald-500" /></div>
                                <div>
                                    <CardTitle className="text-2xl font-display font-black text-white">Équipe de Production</CardTitle>
                                    <CardDescription>Gérez les droits d'accès de vos collaborateurs.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-primary">
                                        <AvatarImage src={artist?.avatar.imageUrl} />
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-black text-white">Vous</p>
                                        <p className="text-[10px] uppercase font-black text-primary tracking-widest">Directeur Créatif</p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500 text-black border-none font-black text-[9px] uppercase px-3">Propriétaire</Badge>
                            </div>

                            {/* Simulation collabs */}
                            <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border border-white/10 opacity-60">
                                        <AvatarFallback className="bg-stone-800 text-white">AM</AvatarFallback>
                                    </Avatar>
                                    <div className="opacity-60">
                                        <p className="font-bold text-white">Amina M.</p>
                                        <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Coloriste</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-600 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 mt-8">
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 border-white/10 hover:border-primary hover:bg-primary/5 transition-all font-black text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-primary">
                                <PlusCircle className="mr-2 h-5 w-5" /> Inviter un membre de l'équipe
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/10 rounded-[2rem] p-8">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Aide Pro</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="bg-primary/20 p-2 rounded-xl"><Sparkles className="h-4 w-4 text-primary" /></div>
                                <p className="text-xs leading-relaxed text-stone-300 font-light italic">"Le <strong>Versioning</strong> permet de corriger des fautes d'orthographe ou des erreurs de dessin sur un chapitre déjà publié sans perdre vos statistiques de lecture."</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="bg-primary/20 p-2 rounded-xl"><Layers className="h-4 w-4 text-primary" /></div>
                                <p className="text-xs leading-relaxed text-stone-300 font-light italic">"Groupez vos chapitres en <strong>Saisons</strong> pour permettre aux lecteurs de naviguer plus facilement dans votre univers complexe."</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>

      {/* A/B TESTING DIALOG */}
      <Dialog open={isABTestingOpen} onOpenChange={setIsABTestingOpen}>
        <DialogContent className="sm:max-w-[800px] bg-stone-950 border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-blue-500" />
            <div className="p-10 space-y-10">
                <div className="text-center space-y-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-none px-4 font-black uppercase tracking-widest text-[10px]">Expérience AI Nexus</Badge>
                    <h2 className="text-3xl font-display font-black text-white gold-resplendant">A/B Testing de Couverture</h2>
                    <p className="text-stone-400 text-sm max-w-lg mx-auto italic font-light">NexusHub diffusera les deux couvertures alternativement pour identifier celle qui génère le plus de clics.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-2xl">
                            <Image src={story.coverImage.imageUrl} alt="Variant A" fill className="object-cover" />
                            <div className="absolute top-4 left-4 bg-emerald-500 text-black font-black px-4 py-1 rounded-full text-xs">A (Actuelle)</div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-emerald-500 font-black text-lg">68% CTR</p>
                            <p className="text-[10px] uppercase font-bold text-stone-500">Performances Temps Réel</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border-4 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:border-primary/50 transition-all cursor-pointer">
                            <PlusCircle className="h-12 w-12 text-stone-700 group-hover:text-primary transition-colors" />
                            <p className="text-stone-500 font-bold mt-4">Uploader Variante B</p>
                            <div className="absolute top-4 left-4 bg-stone-800 text-stone-400 font-black px-4 py-1 rounded-full text-xs">B</div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-stone-600 font-black text-lg">--</p>
                            <p className="text-[10px] uppercase font-bold text-stone-500">En attente de données</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <Button onClick={() => setIsABTestingOpen(false)} className="rounded-full px-12 h-14 font-black text-lg bg-white/5 border border-white/10 text-white hover:bg-white/10">Fermer l'expérience</Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
