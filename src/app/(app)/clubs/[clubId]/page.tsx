'use client';

import { useState, use, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Users, Image as ImageIcon, Vote, 
  ChevronRight, Heart, Share2, AlertTriangle, 
  Sparkles, Flame, Plus, Trophy, MapPin, Eye, Zap, Info, Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

export default function ClubDetailPage(props: { params: Promise<{ clubId: string }> }) {
  const params = use(props.params);
  const [activeTab, setActiveTab] = useState('discussions');
  const [club, setClub] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [fanArts, setFanArts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clubRef = doc(db, 'readingClubs', params.clubId);
    
    const unsubClub = onSnapshot(clubRef, (snap) => {
      if (snap.exists()) setClub({ id: snap.id, ...snap.data() });
      setLoading(false);
    });

    const qDisc = query(collection(db, 'readingClubs', params.clubId, 'discussions'), orderBy('createdAt', 'desc'), limit(20));
    const unsubDisc = onSnapshot(qDisc, (snap) => {
      setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qArts = query(collection(db, 'readingClubs', params.clubId, 'fanArts'), orderBy('createdAt', 'desc'), limit(12));
    const unsubArts = onSnapshot(qArts, (snap) => {
      setFanArts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubClub(); unsubDisc(); unsubArts(); };
  }, [params.clubId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-950">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
    </div>
  );

  if (!club) return <div className="text-center py-32 text-stone-500 italic">Cercle introuvable.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-stone-950">
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image src={club.image || "https://picsum.photos/seed/club/1200/400"} alt={club.name} fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-20 w-20 border-4 border-primary shadow-2xl">
                  <AvatarImage src={`https://picsum.photos/seed/logo${club.id}/200/200`} />
                  <AvatarFallback>{club.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Badge className="bg-emerald-500 text-white border-none mb-2">Club Actif</Badge>
                  <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-none tracking-tighter gold-resplendant">{club.name}</h1>
                </div>
              </div>
              <div className="flex items-center gap-6 text-stone-400 text-sm font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {club.membersCount} membres</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button size="lg" className="flex-1 md:flex-none rounded-full px-10 font-black h-12 gold-shimmer bg-primary text-black">Rejoindre</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white/5 p-1 rounded-2xl h-14 mb-8 border border-white/5">
                <TabsTrigger value="discussions" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <MessageSquare className="h-4 w-4" /> Débats
                </TabsTrigger>
                <TabsTrigger value="fanarts" className="rounded-xl px-6 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  <ImageIcon className="h-4 w-4" /> Fan Arts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discussions" className="space-y-4 animate-in fade-in duration-500">
                {discussions.length > 0 ? discussions.map((d) => (
                  <Card key={d.id} className="bg-card/50 border-border/50 rounded-2xl hover:border-primary/30 transition-all group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        <div className="space-y-3 flex-1">
                          <h4 className="text-xl font-bold font-display group-hover:text-primary transition-colors leading-tight">{d.title}</h4>
                          <div className="flex items-center gap-4 text-xs pt-3 border-t border-white/5">
                            <span className="text-[10px] font-medium text-stone-600">Posté par <span className="text-white">{d.authorName}</span></span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-stone-700 mt-1 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="py-20 text-center text-stone-600 italic">Aucun débat n'a encore été lancé.</div>
                )}
              </TabsContent>

              <TabsContent value="fanarts" className="animate-in fade-in duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fanArts.length > 0 ? fanArts.map((f) => (
                        <div key={f.id} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-white/5">
                            <Image src={f.url} alt="FanArt" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <p className="text-[10px] font-black uppercase text-white">par {f.authorName}</p>
                            </div>
                        </div>
                    )) : (
                      <div className="col-span-full py-20 text-center text-stone-600 italic border-2 border-dashed border-white/5 rounded-3xl">Aucun fan-art partagé.</div>
                    )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-8">
            <Card className="border-none bg-stone-900 rounded-[2rem] p-8 shadow-xl overflow-hidden relative">
                <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
                    <Zap className="h-4 w-4" /> À propos
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed italic font-light">"{club.description || "Un sanctuaire pour les lecteurs de NexusHub."}"</p>
            </Card>

            <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 text-center">
                <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-bold text-white mb-2">Charte du Club</h4>
                <p className="text-[10px] text-stone-500 leading-relaxed">Soyez bienveillants. Pas de promotion externe sans accord des Gardiens.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
