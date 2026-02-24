'use client';

import { useState, use } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Users, Image as ImageIcon, Vote, 
  ChevronRight, Heart, Share2, AlertTriangle, 
  Sparkles, Flame, Plus, Trophy, MapPin, Eye, Zap, Info
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ClubDetailPage(props: { params: Promise<{ clubId: string }> }) {
  const params = use(props.params);
  const [activeTab, setActiveTab] = useState('discussions');

  const club = {
    id: params.clubId,
    name: "Le Sanctuaire d'Orisha",
    description: "L'espace d'élite pour les fans des Chroniques d'Orisha. Décryptage, théories et art.",
    memberCount: 1245,
    coverImage: "https://picsum.photos/seed/club-hero/1200/400",
    storyId: "1",
    artistName: "Jelani Adebayo"
  };

  const discussions = [
    { id: 'd1', title: "Trahison de Shango : Était-ce prévu ?", author: "Amina42", replies: 124, likes: 45, chapter: 15, isSpoiler: true },
    { id: 'd2', title: "Signification des tatouages sur le dos d'Oba", author: "Kwame_Art", replies: 56, likes: 82, chapter: 12, isSpoiler: false },
    { id: 'd3', title: "Prédiction arc final : Qui va mourir ?", author: "TheoryKing", replies: 340, likes: 12, chapter: 20, isSpoiler: true }
  ];

  const fanArts = [
    { id: 'f1', url: "https://picsum.photos/seed/fanart1/400/400", author: "ZoeDraws", likes: 150 },
    { id: 'f2', url: "https://picsum.photos/seed/fanart2/400/400", author: "Koffi_Sketches", likes: 89 },
    { id: 'f3', url: "https://picsum.photos/seed/fanart3/400/400", author: "AbidjanCreative", likes: 230 }
  ];

  const currentPoll = {
    question: "Quelle divinité va s'éveiller au prochain chapitre ?",
    options: [
      { id: 'o1', text: "Shango (Foudre)", votes: 45 },
      { id: 'o2', text: "Oshun (Eau)", votes: 30 },
      { id: 'o3', text: "Eshu (Chaos)", votes: 25 }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-950">
      {/* 1. CLUB HERO SECTION */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image src={club.coverImage} alt={club.name} fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-20 w-20 border-4 border-primary shadow-2xl">
                  <AvatarImage src="https://picsum.photos/seed/clublogo/200/200" />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div>
                  <Badge className="bg-emerald-500 text-white border-none mb-2">Club Officiel</Badge>
                  <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-none tracking-tighter gold-resplendant">{club.name}</h1>
                </div>
              </div>
              <div className="flex items-center gap-6 text-stone-400 text-sm font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {club.memberCount} membres</span>
                <span className="flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Actif maintenant</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button size="lg" className="flex-1 md:flex-none rounded-full px-10 font-black h-12 gold-shimmer bg-primary text-black">Rejoint</Button>
              <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-white/20 text-white"><Share2 className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* LEFT CONTENT: TABS */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white/5 p-1 rounded-2xl h-14 mb-8 border border-white/5">
                <TabsTrigger value="discussions" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <MessageSquare className="h-4 w-4" /> Débats
                </TabsTrigger>
                <TabsTrigger value="fanarts" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  <ImageIcon className="h-4 w-4" /> Fan Arts
                </TabsTrigger>
                <TabsTrigger value="polls" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <Vote className="h-4 w-4" /> Sondages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discussions" className="space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold font-display flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Dernières Théories</h3>
                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-white/10 text-white h-9"><Plus className="h-4 w-4" /> Nouveau Sujet</Button>
                </div>
                {discussions.map((d) => (
                  <Card key={d.id} className="bg-card/50 border-border/50 rounded-2xl hover:border-primary/30 transition-all group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[8px] uppercase font-black border-primary/20 text-primary px-2">Chapitre {d.chapter}</Badge>
                            {d.isSpoiler && <Badge className="bg-rose-500/10 text-rose-500 border-none text-[8px] px-2 font-black uppercase tracking-tighter">Spoiler</Badge>}
                          </div>
                          <h4 className="text-xl font-bold font-display group-hover:text-primary transition-colors leading-tight">{d.title}</h4>
                          <div className="flex items-center gap-4 text-xs pt-3 border-t border-white/5">
                            <span className="flex items-center gap-1.5 font-bold text-stone-500"><MessageSquare className="h-3.5 w-3.5 text-primary" /> {d.replies}</span>
                            <span className="flex items-center gap-1.5 font-bold text-stone- stone-500"><Heart className="h-3.5 w-3.5 text-rose-500" /> {d.likes}</span>
                            <span className="ml-auto text-[10px] font-medium text-stone-600">Posté par <span className="text-white">{d.author}</span></span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-stone-700 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="fanarts" className="animate-in fade-in duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fanArts.map((f) => (
                        <div key={f.id} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-white/5">
                            <Image src={f.url} alt="FanArt" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <p className="text-[10px] font-black uppercase text-white">par {f.author}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                                    <span className="text-[10px] font-bold text-white">{f.likes}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-stone-600 hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
                        <div className="bg-white/5 p-4 rounded-full"><Plus className="h-6 w-6" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ajouter un Art</span>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="polls" className="animate-in fade-in duration-500 space-y-6">
                <Card className="bg-stone-900 border-primary/10 rounded-[2rem] overflow-hidden shadow-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-orange-500/10 p-2 rounded-lg"><Vote className="h-6 w-6 text-orange-500" /></div>
                        <h3 className="text-xl font-bold font-display text-white">{currentPoll.question}</h3>
                    </div>
                    <div className="space-y-6">
                        {currentPoll.options.map((opt) => (
                            <div key={opt.id} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                    <span className="text-stone-300">{opt.text}</span>
                                    <span className="text-primary">{opt.votes}%</span>
                                </div>
                                <Progress value={opt.votes} className="h-3 bg-white/5 rounded-full" />
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-8 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-primary hover:text-black">Voter maintenant</Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT SIDEBAR: INFOS & MEMBERS */}
          <aside className="space-y-8">
            <Card className="border-none bg-stone-900 rounded-[2rem] p-8 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5"><Info className="h-24 w-24" /></div>
                <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
                    <Zap className="h-4 w-4" /> À propos de l'œuvre
                </h4>
                <div className="flex gap-4 mb-6">
                    <div className="relative h-24 w-16 rounded-lg overflow-hidden shadow-lg border border-white/5">
                        <Image src="https://picsum.photos/seed/story1/200/300" alt="Cover" fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h5 className="font-bold text-white">Chroniques d'Orisha</h5>
                        <p className="text-xs text-stone-500">par {club.artistName}</p>
                        <Button asChild variant="link" className="p-0 h-auto text-primary text-[10px] font-black uppercase"><Link href={`/webtoon-hub/les-chroniques-d-orisha`}>Voir l'œuvre <ChevronRight className="h-3 w-3" /></Link></Button>
                    </div>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed italic font-light">"{club.description}"</p>
            </Card>

            <Card className="border-none bg-stone-900 rounded-[2rem] p-8 shadow-xl">
                <h4 className="text-sm font-black uppercase text-emerald-500 mb-6 tracking-widest">Top Contributeurs</h4>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white/5"><AvatarImage src={`https://picsum.photos/seed/user${i}/100/100`} /></Avatar>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white">Sage_Numérique_{i}</p>
                                <p className="text-[9px] text-emerald-500 uppercase font-black">2.4k points d'influence</p>
                            </div>
                            {i === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
                        </div>
                    ))}
                </div>
                <Button variant="ghost" className="w-full mt-6 text-[9px] font-black uppercase text-stone-500">Voir tous les membres</Button>
            </Card>

            <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 text-center">
                <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-bold text-white mb-2">Charte du Club</h4>
                <p className="text-[10px] text-stone-500 leading-relaxed">Respectez les sections spoiler. Soyez bienveillants. Pas de promotion externe sans accord.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
