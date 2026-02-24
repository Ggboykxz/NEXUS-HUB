'use client';

import { useState } from 'react';
import { artists } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Mic, Calendar, Trophy, Sparkles, Video, PlayCircle, 
  Users, Search, BrainCircuit, Star, ChevronRight, CheckCircle2, 
  MessageSquare, LayoutGrid, Clock, Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function MentorshipPage() {
  const [activeTab, setActiveTab] = useState<'matching' | 'masterclasses' | 'live'>('matching');
  const mentors = artists.filter(artist => artist.isMentor);

  const masterclasses = [
    {
      title: "L'art du Storyboarding Panafricain",
      author: "Jelani Adebayo",
      duration: "45 min",
      thumbnail: "https://picsum.photos/seed/master1/600/400",
      category: "Narration"
    },
    {
      title: "Colorisation Digitale : Teintes Sahéliennes",
      author: "Amina Diallo",
      duration: "1h 15",
      thumbnail: "https://picsum.photos/seed/master2/600/400",
      category: "Technique"
    },
    {
      title: "Vivre de son Art via les AfriCoins",
      author: "Kwame Osei",
      duration: "30 min",
      thumbnail: "https://picsum.photos/seed/master3/600/400",
      category: "Business"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Programme Elite 2.0</Badge>
        <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 gold-resplendant">Académie de Mentorat Nexus</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto italic font-light">
          "Un pont entre les légendes confirmées et la nouvelle vague créative. Progressez avec l'IA, apprenez des maîtres et obtenez votre certification."
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center mb-12">
        <div className="bg-muted/50 p-1 rounded-2xl border border-border/50 flex flex-wrap justify-center gap-1">
          <Button 
            variant={activeTab === 'matching' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('matching')}
            className="rounded-xl px-6 gap-2 font-bold text-xs"
          >
            <BrainCircuit className="h-4 w-4" /> Matching IA
          </Button>
          <Button 
            variant={activeTab === 'masterclasses' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('masterclasses')}
            className="rounded-xl px-6 gap-2 font-bold text-xs"
          >
            <PlayCircle className="h-4 w-4" /> Masterclasses
          </Button>
          <Button 
            variant={activeTab === 'live' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('live')}
            className="rounded-xl px-6 gap-2 font-bold text-xs"
          >
            <Video className="h-4 w-4" /> Ateliers Live
          </Button>
        </div>
      </div>

      {/* Tab: AI Matching */}
      {activeTab === 'matching' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-primary/10 bg-primary/[0.02] shadow-2xl p-8 rounded-[2rem]">
              <div className="space-y-6">
                <div className="bg-primary/10 p-4 rounded-2xl w-fit"><Zap className="h-8 w-8 text-primary" /></div>
                <h2 className="text-2xl font-display font-bold">Matching Intelligent</h2>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  Notre IA analyse votre style, vos thèmes et votre rythme de publication pour vous suggérer le mentor idéal.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Affinité de Style</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Disponibilité Synchronisée</span>
                  </div>
                </div>
                <Button className="w-full h-12 rounded-xl font-black bg-primary text-black gold-shimmer">Lancer l'Analyse IA</Button>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-display font-bold flex items-center gap-2 px-2">
                <Users className="h-5 w-5 text-primary" /> Mentors Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentors.map((mentor) => (
                  <Link key={mentor.id} href={`/artiste/${mentor.id}`}>
                    <Card className="group hover:border-primary/30 transition-all duration-500 bg-card/50 rounded-2xl overflow-hidden border-border/50">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-20 w-20 border-2 border-primary/20 ring-4 ring-transparent group-hover:ring-primary/10 transition-all">
                            <AvatarImage src={mentor.avatar.imageUrl} alt={mentor.name} />
                            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Badge className="absolute -bottom-1 -right-1 bg-emerald-500 text-white border-2 border-background p-1"><CheckCircle2 className="h-3 w-3" /></Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg truncate font-display">{mentor.name}</h4>
                            <Badge variant="outline" className="text-[8px] uppercase border-emerald-500/30 text-emerald-500">Certifié</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 font-light italic mb-3">"{mentor.bio}"</p>
                          <div className="flex gap-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase">Action</Badge>
                            <Badge className="bg-cyan-500/10 text-cyan-500 border-none text-[9px] font-black uppercase">Lore</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab: Masterclasses */}
      {activeTab === 'masterclasses' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {masterclasses.map((cls, idx) => (
              <Card key={idx} className="group overflow-hidden rounded-[2rem] border-none shadow-xl bg-card/50 hover:shadow-2xl transition-all">
                <div className="relative aspect-video">
                  <Image src={cls.thumbnail} alt={cls.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <PlayCircle className="h-8 w-8 text-black fill-current" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-primary text-black font-black uppercase text-[10px]">{cls.category}</Badge>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {cls.duration}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-display leading-tight">{cls.title}</CardTitle>
                  <CardDescription className="text-xs font-bold text-primary italic">par {cls.author}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest gap-2 hover:bg-primary/5 hover:text-primary">
                    Regarder Maintenant <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Live Workshops */}
      {activeTab === 'live' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-stone-900 rounded-[3rem] p-12 overflow-hidden relative border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Video className="h-48 w-48 text-primary" /></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <Badge className="bg-rose-500 text-white border-none animate-pulse mb-4">EN DIRECT : CE SOIR À 20H00</Badge>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-white gold-resplendant">Atelier Live Hebdo</h2>
                  <p className="text-stone-400 text-lg font-light leading-relaxed italic">
                    "Session de dessin en direct avec Amina Diallo. Apprenez à créer des visages expressifs pour vos personnages de Webtoon."
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center flex-1">
                    <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-[10px] font-black text-white uppercase">Q&A Live</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center flex-1">
                    <Star className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-white uppercase">Critique</p>
                  </div>
                </div>
                <Button className="h-14 px-10 rounded-full font-black text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/20">
                  Rejoindre le Workshop
                </Button>
              </div>
              <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl bg-black">
                <Image src="https://picsum.photos/seed/liveart/800/800" alt="Live Session" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-rose-500 flex items-center justify-center animate-ping opacity-20" />
                  <div className="absolute h-16 w-16 rounded-full bg-rose-500 flex items-center justify-center">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certification Footer */}
      <section className="mt-24 pt-16 border-t border-border/50 text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,168,67,0.2)]">
          <Award className="h-12 w-12 text-primary" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-display font-black">Certification NexusHub</h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            Validez vos acquis avec nos maîtres. Obtenez le badge officiel de certification et augmentez vos chances d'être sélectionné pour le programme **NexusHub Originals**.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Storytelling</div>
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Webtoon Design</div>
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Marketing Art</div>
          </div>
        </div>
      </section>
    </div>
  );
}
