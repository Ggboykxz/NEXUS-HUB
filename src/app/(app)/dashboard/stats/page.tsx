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
  Coins, ArrowUpRight, BrainCircuit, Timer, Flame, Loader2, Brush
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import Link from 'next/link';

export default function AdvancedStatsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('all');

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
            setSelectedStoryId('all');
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- AGGREGATIONS ---
  const totals = useMemo(() => {
    return stories.reduce((acc, s) => ({
      views: acc.views + (s.views || 0),
      likes: acc.likes + (s.likes || 0),
      chapters: acc.chapters + (s.chapterCount || 0)
    }), { views: 0, likes: 0, chapters: 0 });
  }, [stories]);

  const chartData = useMemo(() => {
    // Top 5 stories by views for the pie chart
    return stories
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((s, i) => ({
        name: s.title,
        value: s.views,
        color: ['#D4A843', '#10b981', '#3b82f6', '#f43f5e', '#64748b'][i]
      }));
  }, [stories]);

  // Mocked historical data (would normally come from an analytics collection)
  const revenueData = [
    { month: 'Jan', total: 120, dons: 40, abonnements: 60 },
    { month: 'Fev', total: 180, dons: 60, abonnements: 90 },
    { month: 'Mar', total: 240, dons: 70, abonnements: 120 },
    { month: 'Avr', total: 210, dons: 50, abonnements: 110 },
    { month: 'Mai', total: 310, dons: 80, abonnements: 150 },
    { month: 'Juin', total: 350, dons: 100, abonnements: 180 },
  ];

  const dropOffData = [
    { depth: '0%', users: 100 },
    { depth: '20%', users: 95 },
    { depth: '40%', users: 88 },
    { depth: '60%', users: 82 },
    { depth: '80%', users: 65 }, 
    { depth: '100%', users: 60 },
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
                        <span className="font-black ml-2">{((story.value / totals.views) * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border/50 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5"><Timer className="h-24 w-24" /></div>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" /> Heatmap de Lecture
                </CardTitle>
                <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
                    <SelectTrigger className="w-[180px] h-8 text-[10px] uppercase font-black">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les œuvres</SelectItem>
                        {stories.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <CardDescription>Analyse du point de décrochage moyen par chapitre.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropOffData}>
                    <XAxis dataKey="depth" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                        {dropOffData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index > 3 ? '#ef4444' : '#D4A843'} opacity={entry.users / 100} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-4">
            <p className="text-[10px] text-muted-foreground flex items-center gap-2 italic">
                <AlertCircle className="h-3 w-3 text-orange-500" /> 
                Alerte : Chute de 17% entre 60% et 80% du scroll. Vérifiez le rythme narratif de cette section.
            </p>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 bg-primary/[0.02] shadow-2xl overflow-hidden flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                    <BrainCircuit className="h-6 w-6 text-black" />
                </div>
                <div>
                    <CardTitle className="text-xl font-display font-black text-primary">Best Performer AI</CardTitle>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Analyse par Genkit & Gemini</p>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="p-6 bg-background rounded-3xl border border-primary/10 shadow-inner">
                <h4 className="text-lg font-black mb-2">{bestStory?.title}</h4>
                <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-emerald-500 text-white border-none">Top Performance</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary">Viralité ++</Badge>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-light italic">
                    "L'IA a détecté une corrélation forte entre le design de vos personnages et le taux de partage au Gabon. Capitalisez sur ce style pour vos prochains chapitres."
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Action Recommandée</p>
                    <p className="text-xs font-bold">Développer le lore culturel</p>
                </div>
                <div className="p-4 bg-background rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Optimisation Mobile</p>
                    <p className="text-xs font-bold">Maintenir ce format de scroll</p>
                </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild className="w-full h-12 rounded-2xl bg-primary text-black font-black gold-shimmer">
                <Link href={`/dashboard/creations/${bestStory?.id}`}>Gérer cette œuvre <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}