'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, 
  CartesianGrid, Area, AreaChart, Cell, Pie, PieChart 
} from 'recharts';
import { stories } from '@/lib/data';
import { 
  TrendingUp, Wallet, Users, BookOpen, ArrowLeft, Globe, 
  Target, Zap, Sparkles, MapPin, AlertCircle, ChevronRight, 
  Coins, ArrowUpRight, BrainCircuit, Timer, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// --- MOCK DATA FOR ADVANCED ANALYTICS ---
const revenueData = [
  { month: 'Jan', total: 120, dons: 40, abonnements: 60, africoins: 20 },
  { month: 'Fev', total: 180, dons: 60, abonnements: 90, africoins: 30 },
  { month: 'Mar', total: 240, dons: 70, abonnements: 120, africoins: 50 },
  { month: 'Avr', total: 210, dons: 50, abonnements: 110, africoins: 50 },
  { month: 'Mai', total: 310, dons: 80, abonnements: 150, africoins: 80 },
  { month: 'Juin', total: 350, dons: 100, abonnements: 180, africoins: 70 },
];

const geoData = [
  { name: 'Gabon', value: 45, color: '#D4A843' },
  { name: 'Sénégal', value: 20, color: '#10b981' },
  { name: 'Nigeria', value: 15, color: '#3b82f6' },
  { name: 'France', value: 10, color: '#f43f5e' },
  { name: 'Autres', value: 10, color: '#64748b' },
];

const dropOffData = [
  { depth: '0%', users: 100 },
  { depth: '20%', users: 95 },
  { depth: '40%', users: 88 },
  { depth: '60%', users: 82 },
  { depth: '80%', users: 65 }, 
  { depth: '100%', users: 60 },
];

export default function AdvancedStatsPage() {
  const router = useRouter();
  const artistId = '1';
  const myStories = stories.filter(story => story.artistId === artistId);
  const [selectedStoryId, setSelectedStoryId] = useState<string>(myStories[0]?.id || '1');

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.total, 0);
  
  const bestChapter = {
    title: "Chapitre 12 : L'Éveil de Shango",
    growth: "+45%",
    reason: "L'IA a détecté une corrélation forte entre le design du nouveau personnage et le taux de partage sur les réseaux sociaux au Gabon."
  };

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
            <div className="text-4xl font-black mb-1">12,450 <span className="text-sm">🪙</span></div>
            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +12% ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Lecteurs Uniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1">84.2k</div>
            <p className="text-xs text-muted-foreground font-medium">85% via mobile (Low-Data)</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Taux de Rétention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1">72%</div>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '72%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Prévision Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-1 text-primary group-hover:scale-105 transition-transform">~450€</div>
            <p className="text-[9px] text-muted-foreground italic">Basé sur votre tendance de croissance</p>
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
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">DONS</Badge>
                <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500">SUBS</Badge>
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
            <CardTitle className="text-xl font-bold font-display">Géographie des Fans</CardTitle>
            <CardDescription>Top pays par audience active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={geoData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {geoData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3">
                {geoData.map((country) => (
                    <div key={country.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: country.color }} />
                            <span className="font-medium">{country.name}</span>
                        </div>
                        <span className="font-black">{country.value}%</span>
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
                        {myStories.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
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
                <h4 className="text-lg font-black mb-2">{bestChapter.title}</h4>
                <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-emerald-500 text-white border-none">{bestChapter.growth} Engagement</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary">Viralité ++</Badge>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-light italic">
                    "{bestChapter.reason}"
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Action Recommandée</p>
                    <p className="text-xs font-bold">Introduire plus de lore culturel au Chap. 15</p>
                </div>
                <div className="p-4 bg-background rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Optimisation Mobile</p>
                    <p className="text-xs font-bold">Réduire le texte des bulles (-15%)</p>
                </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button className="w-full h-12 rounded-2xl bg-primary text-black font-black gold-shimmer">
                Appliquer les conseils IA <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
