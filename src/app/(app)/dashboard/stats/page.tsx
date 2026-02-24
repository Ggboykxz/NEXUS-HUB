'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { stories } from '@/lib/data';
import { TrendingUp, Wallet, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Mock data types
type ChapterView = { name: string; vues: number };
type ChapterViewsData = { [storyId: string]: ChapterView[] };

// Mock data, in a real app this would come from an API
const revenueData = [
  { month: 'Jan', total: 120, dons: 40, abonnements: 60, africoins: 20 },
  { month: 'Fev', total: 180, dons: 60, abonnements: 90, africoins: 30 },
  { month: 'Mar', total: 240, dons: 70, abonnements: 120, africoins: 50 },
  { month: 'Avr', total: 210, dons: 50, abonnements: 110, africoins: 50 },
  { month: 'Mai', total: 310, dons: 80, abonnements: 150, africoins: 80 },
  { month: 'Juin', total: 350, dons: 100, abonnements: 180, africoins: 70 },
];

const subscriberData = [
  { month: 'Jan', abonnés: 500 },
  { month: 'Fev', abonnés: 550 },
  { month: 'Mar', abonnés: 620 },
  { month: 'Avr', abonnés: 680 },
  { month: 'Mai', abonnés: 750 },
  { month: 'Juin', abonnés: 820 },
];

const chapterViewsData: ChapterViewsData = {
  '1': [
    { name: 'Chap 1', vues: 4000 },
    { name: 'Chap 2', vues: 3000 },
    { name: 'Chap 3', vues: 2000 },
  ],
  '3': [
    { name: 'Chap 1', vues: 8000 },
    { name: 'Chap 2', vues: 7500 },
    { name: 'Chap 3', vues: 6000 },
    { name: 'Chap 4', vues: 4000 },
  ],
};


export default function StatsDashboardPage() {
  const router = useRouter();
  const artistId = '1';
  const myStories = stories.filter(story => story.artistId === artistId);
  const [selectedStoryId, setSelectedStoryId] = useState<string>(myStories[0]?.id || '');

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.total, 0);
  const totalSubscribers = subscriberData[subscriberData.length - 1].abonnés;
  const totalViews = myStories.reduce((acc, story) => acc + story.views, 0);

  // Simplified read-through rate calculation
  const getReadThroughRate = (storyId: string): string => {
    const storyData = chapterViewsData[storyId];
    if (!storyData || storyData.length < 2) return 'N/A';
    const firstChapterViews = storyData[0].vues;
    const lastChapterViews = storyData[storyData.length - 1].vues;
    if (firstChapterViews === 0) return '0%';
    return `${((lastChapterViews / firstChapterViews) * 100).toFixed(0)}%`;
  }
  
  const currentChapterViews = chapterViewsData[selectedStoryId] || [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <TrendingUp className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-display">Statistiques</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Suivez les performances de vos œuvres et l'engagement de votre communauté.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="self-end sm:self-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'atelier
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux (6 mois)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue}€</div>
            <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">+70 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalViews / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">+10k ce mois-ci</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de lecture (Orisha)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getReadThroughRate('1')}</div>
            <p className="text-xs text-muted-foreground">Ratio de lecteurs du dernier / premier chapitre</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenus par source</CardTitle>
            <CardDescription>Revenus mensuels des 6 derniers mois.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="dons" stackId="a" fill="hsl(var(--chart-1))" name="Dons" radius={[4, 4, 0, 0]} />
                <Bar dataKey="abonnements" stackId="a" fill="hsl(var(--chart-2))" name="Abonnements" />
                <Bar dataKey="africoins" stackId="a" fill="hsl(var(--chart-3))" name="AfriCoins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Évolution des abonnés</CardTitle>
            <CardDescription>Nombre total d'abonnés sur 6 mois.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="abonnés" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
       <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle>Performance par chapitre</CardTitle>
                    <CardDescription>Nombre de vues pour chaque chapitre d'une œuvre.</CardDescription>
                </div>
                <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Sélectionnez une œuvre" />
                    </SelectTrigger>
                    <SelectContent>
                        {myStories.map(story => (
                             <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={350}>
                <BarChart data={currentChapterViews}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        cursor={{ fill: 'hsl(var(--muted))' }}
                    />
                    <Bar dataKey="vues" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
