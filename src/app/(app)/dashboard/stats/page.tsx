'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, 
  CartesianGrid, Area, AreaChart, Cell, Pie, PieChart 
} from 'recharts';
import { 
  TrendingUp, Wallet, Users, BookOpen, ArrowLeft, Globe, 
  Target, Zap, Sparkles, MapPin, AlertCircle, ChevronRight, 
  Coins, ArrowUpRight, BrainCircuit, Timer, Flame, Loader2, Brush,
  Layout, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { Story, Chapter } from '@/lib/types';
import Link from 'next/link';

export default function AdvancedStatsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const q = query(collection(db, 'stories'), where('artistId', '==', user.uid));
          const snap = await getDocs(q);
          const fetchedStories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
          setStories(fetchedStories);
          if (fetchedStories.length > 0) {
            setSelectedStoryId(fetchedStories[0].id);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch chapters when a story is selected
  useEffect(() => {
    async function fetchChapters() {
      if (selectedStoryId === 'all' || !selectedStoryId) {
        setChapters([]);
        setSelectedChapterId('');
        return;
      }
      setLoadingChapters(true);
      try {
        const q = query(collection(db, 'stories', selectedStoryId, 'chapters'), orderBy('chapterNumber', 'asc'));
        const snap = await getDocs(q);
        const fetchedChapters = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        setChapters(fetchedChapters);
        if (fetchedChapters.length > 0) {
          setSelectedChapterId(fetchedChapters[fetchedChapters.length - 1].id); // Latest by default
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChapters(false);
      }
    }
    fetchChapters();
  }, [selectedStoryId]);

  // Transform pageStats into Recharts data
  const pageRetentionData = useMemo(() => {
    const activeChapter = chapters.find(c => c.id === selectedChapterId);
    if (!activeChapter || !activeChapter.pageStats) return [];

    return Object.entries(activeChapter.pageStats).map(([idx, stats]: any) => ({
      page: `Planche ${parseInt(idx) + 1}`,
      views: stats.views || 0,
      index: parseInt(idx)
    })).sort((a, b) => a.index - b.index);
  }, [chapters, selectedChapterId]);

  // Detect drop-offs
  const dropOffThreshold = 0.15; // 15% drop
  const processedData = useMemo(() => {
    return pageRetentionData.map((d, i, arr) => {
      if (i === 0) return { ...d, isDropOff: false };
      const prevViews = arr[i - 1].views;
      const dropOff = prevViews > 0 ? (prevViews - d.views) / prevViews : 0;
      return { ...d, isDropOff: dropOff > dropOffThreshold };
    });
  }, [pageRetentionData]);

  // --- AGGREGATIONS ---
  const totals = useMemo(() => {
    return stories.reduce((acc, s) => ({
      views: acc.views + (s.views || 0),
      likes: acc.likes + (s.likes || 0),
      chapters: acc.chapters + (s.chapterCount || 0)
    }), { views: 0, likes: 0, chapters: 0 });
  }, [stories]);

  const chartData = useMemo(() => {
    return stories
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((s, i) => ({
        name: s.title,
        value: s.views,
        color: ['#D4A843', '#10b981', '#3b82f6', '#f43f5e', '#64748b'][i]
      }));
  }, [stories]);

  const revenueData = [
    { month: 'Jan', total: 120, dons: 40, abonnements: 60 },
    { month: 'Fev', total: 180, dons: 60, abonnements: 90 },
    { month: 'Mar', total: 240, dons: 70, abonnements: 120 },
    { month: 'Avr', total: 210, dons: 50, abonnements: 110 },
    { month: 'Mai', total: 310, dons: 80, abonnements: 150 },
    { month: 'Juin', total: 350, dons: 100, abonnements: 180 },
  ];

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Calcul des indices de performance...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-24 text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 opacity-20">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-black text-white tracking-tighter">Pas encore de données</h1>
          <p className="text-stone-500 max-w-md mx-auto italic font-light leading-relaxed">
            "Votre impact commencera à être mesuré dès que vous publierez votre premier récit. Le monde attend vos premières lignes."
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full px-12 h-16 font-black text-xl bg-primary text-black gold-shimmer">
          <Link href="/submit">Créer mon œuvre</Link>
        </Button>
      </div>
    );
  }

  const bestStory = [...stories].sort((a, b) => b.views - a.views)[0];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
                <Target className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-display tracking-tighter">Analytique de Légende</h1>
          </div>
          <p className="text-muted-foreground text-lg font-light italic">
            Visualisez votre impact culturel et optimisez votre croissance avec l'IA Nexus.
          </p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'Atelier
            </Button>
            <Button className="rounded-full bg-primary text-black font-black shadow-lg shadow-primary/20">
                <Zap className="mr-2 h-4 w-4" /> Exporter PDF
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <Card className="bg-stone-900 border-none text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Coins className="h-16 w-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Solde AfriCoins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1">{(currentUser?.afriCoins || 0).toLocaleString()} <span className="text-sm">🪙</span></div>
            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Gérés en direct
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Vues Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1">{formatStat(totals.views)}</div>
            <p className="text-xs text-muted-foreground font-medium">Accumulées sur {stories.length} œuvres</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1">{formatStat(totals.likes)}</div>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Épisodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1 text-primary group-hover:scale-105 transition-transform">{totals.chapters}</div>
            <p className="text-[9px] text-muted-foreground italic">Fréquence : Mensuelle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 mb-12">
        <Card className="lg:col-span-2 border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl font-bold font-display">Croissance des Revenus</CardTitle>
                <CardDescription>Évolution mensuelle par source de monétisation.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary uppercase">Simulé</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorDons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(v) => `${v}€`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                />
                <Area type="monotone" dataKey="dons" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorDons)" strokeWidth={3} />
                <Area type="monotone" dataKey="abonnements" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-display">Répartition des Vues</CardTitle>
            <CardDescription>Top 5 de vos œuvres les plus lues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3">
                {chartData.map((story) => (
                    <div key={story.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: story.color }} />
                            <span className="font-medium truncate">{story.name}</span>
                        </div>
                        <span className="font-black ml-2">{((story.value / (totals.views || 1)) * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 mb-12">
        {/* RETENTION PAR PLANCHE SECTION */}
        <Card className="lg:col-span-2 border-border/50 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5"><Layout className="h-24 w-24" /></div>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" /> Rétention par planche
                  </CardTitle>
                  <CardDescription>Détectez les moments où vos lecteurs décrochent.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
                      <SelectTrigger className="w-[160px] h-8 text-[10px] uppercase font-black bg-white/5 border-white/10">
                          <SelectValue placeholder="Œuvre" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-white/10">
                          {stories.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Select value={selectedChapterId} onValueChange={setSelectedChapterId} disabled={loadingChapters}>
                      <SelectTrigger className="w-[120px] h-8 text-[10px] uppercase font-black bg-white/5 border-white/10">
                          <SelectValue placeholder="Épisode" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-white/10">
                          {chapters.map(c => <SelectItem key={c.id} value={c.id}>Ep. {c.chapterNumber}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            {loadingChapters ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/20" /></div>
            ) : processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData}>
                      <XAxis dataKey="page" axisLine={false} tickLine={false} tick={{fontSize: 9}} hide />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'black', border: '1px solid #333', borderRadius: '8px' }}
                      />
                      <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                          {processedData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isDropOff ? '#ef4444' : '#D4A843'} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 italic text-sm">
                <Info className="h-8 w-8 mb-2 opacity-20" />
                Aucune donnée de vue par planche pour cet épisode.
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-4">
            <p className="text-[10px] text-muted-foreground flex items-center gap-2 italic">
                <AlertCircle className="h-3 w-3 text-orange-500" /> 
                Les barres <span className="text-rose-500 font-bold">rouges</span> indiquent une perte d'audience supérieure à 15% par rapport à la planche précédente.
            </p>
          </CardFooter>
        </Card>

        {/* AI INSIGHTS CARD */}
        <Card className="border-primary/20 bg-primary/[0.02] shadow-2xl overflow-hidden flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                    <BrainCircuit className="h-6 w-6 text-black" />
                </div>
                <div>
                    <CardTitle className="text-xl font-display font-black text-primary">Nexus Insights AI</CardTitle>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Optimisation de Rétention</p>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="p-6 bg-background rounded-3xl border border-primary/10 shadow-inner">
                <h4 className="text-lg font-black mb-2">{bestStory?.title}</h4>
                <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-emerald-500 text-white border-none">Stable</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary">Fidélité ++</Badge>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-light italic">
                    "L'IA a détecté que votre prologue retient 85% de l'audience jusqu'à la fin. C'est un score excellent. Le pic de décrochage sur l'épisode 3 suggère une introduction de personnage trop dense."
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Point Critique</p>
                    <p className="text-xs font-bold">Planche #12 (Ep.3)</p>
                </div>
                <div className="p-4 bg-background rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Recommandation</p>
                    <p className="text-xs font-bold">Aérer les dialogues</p>
                </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild className="w-full h-12 rounded-2xl bg-primary text-black font-black gold-shimmer">
                <Link href={`/dashboard/creations/${bestStory?.id}`}>Éditer l'œuvre <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
