'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, BookOpen, Activity, Award, Flag, 
  CheckCircle2, XCircle, ChevronRight, Loader2, 
  Search, ShieldCheck, Clock, TrendingUp, AlertTriangle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, limit, orderBy, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. STATS FETCHING
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // In a real app, these would come from an aggregation doc or Cloud Function
      const usersSnap = await getDocs(collection(db, 'users'));
      const storiesSnap = await getDocs(collection(db, 'stories'));
      return {
        totalUsers: usersSnap.size,
        totalStories: storiesSnap.size,
        dau: Math.floor(usersSnap.size * 0.45) // Mocked DAU
      };
    }
  });

  // 2. PENDING PRO ARTISTS
  const { data: pendingArtists = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pending-pro-artists'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'artist_draft'), limit(20));
      const snap = await getDocs(q);
      // Logic: filter those with 5k+ views (assuming we have a field for this or query their stories)
      // Here we simulate artists needing validation
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as any));
    }
  });

  // 3. REPORTS QUEUE
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const q = query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  // 4. LATEST SIGNUPS
  const { data: latestUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['latest-signups'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as any));
    }
  });

  const validateProMutation = useMutation({
    mutationFn: async ({ uid, approve }: { uid: string, approve: boolean }) => {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { 
        role: approve ? 'artist_pro' : 'artist_draft',
        isCertified: approve,
        updatedAt: serverTimestamp()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-pro-artists'] });
      toast({ 
        title: variables.approve ? "Artiste promu !" : "Candidature refusée", 
        variant: variables.approve ? "default" : "destructive" 
      });
    }
  });

  const resolveReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const ref = doc(db, 'reports', reportId);
      await updateDoc(ref, { status: 'resolved', resolvedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast({ title: "Signalement traité" });
    }
  });

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-1000">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter">Nexus Core Dashboard</h1>
          <p className="text-stone-500 italic mt-1">Supervision de l'écosystème panafricain.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 h-11 text-xs font-bold uppercase tracking-widest gap-2">
            <Activity className="h-4 w-4 text-emerald-500" /> Live Logs
          </Button>
          <Button className="rounded-xl h-11 bg-primary text-black font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
            Export Global Report
          </Button>
        </div>
      </div>

      {/* 1. STATS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Membres Totaux", val: stats?.totalUsers || 0, icon: Users, color: "text-primary" },
          { label: "Récits Publics", val: stats?.totalStories || 0, icon: BookOpen, color: "text-emerald-500" },
          { label: "Voyageurs Actifs / 24h", val: stats?.dau || 0, icon: TrendingUp, color: "text-blue-500" },
        ].map((s, i) => (
          <Card key={i} className="border-white/5 bg-stone-900/50 p-8 rounded-[2rem] overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl bg-white/5", s.color)}>
                <s.icon className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[8px]">+12%</Badge>
            </div>
            <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.2em] mb-1">{s.label}</p>
            <p className="text-4xl font-black text-white">{loadingStats ? '---' : s.val.toLocaleString()}</p>
          </Card>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* 2. PENDING VALIDATIONS */}
        <section id="validations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-black uppercase tracking-tighter flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" /> Validations Pro
            </h2>
            <Badge className="bg-primary/10 text-primary border-none">{pendingArtists.length} en attente</Badge>
          </div>
          
          <div className="space-y-4">
            {loadingPending ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-stone-800" /></div>
            ) : pendingArtists.length > 0 ? pendingArtists.map((artist: any) => (
              <Card key={artist.uid} className="bg-stone-900/30 border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-white/5">
                    <AvatarImage src={artist.photoURL} />
                    <AvatarFallback>{artist.displayName?.slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{artist.displayName}</h4>
                    <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest">
                      <Clock className="h-3 w-3 inline mr-1" /> Inscrit le {new Date(artist.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="bg-white/5 text-stone-400 text-[8px]">5.2k Vues</Badge>
                      <Badge variant="secondary" className="bg-white/5 text-stone-400 text-[8px]">12 Chapitres</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => validateProMutation.mutate({ uid: artist.uid, approve: true })}
                      disabled={validateProMutation.isPending}
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => validateProMutation.mutate({ uid: artist.uid, approve: false })}
                      disabled={validateProMutation.isPending}
                      size="sm" 
                      variant="outline" 
                      className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl h-9"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="p-12 text-center text-stone-600 italic text-sm">Aucun nouvel artiste n'a encore atteint les sommets.</div>
            )}
          </div>
        </section>

        {/* 3. REPORTS QUEUE */}
        <section id="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-black uppercase tracking-tighter flex items-center gap-3">
              <Flag className="h-5 w-5 text-rose-500" /> File de Modération
            </h2>
            <Badge className="bg-rose-500/10 text-rose-500 border-none">{reports.length} alertes</Badge>
          </div>

          <div className="space-y-4">
            {loadingReports ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-stone-800" /></div>
            ) : reports.length > 0 ? reports.map((report: any) => (
              <Card key={report.id} className="bg-rose-500/[0.02] border-rose-500/10 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-rose-500/10 p-3 rounded-2xl"><AlertTriangle className="h-5 w-5 text-rose-500" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-rose-500 text-white border-none text-[8px] uppercase">{report.reason}</Badge>
                      <span className="text-[9px] text-stone-600 font-bold uppercase">Il y a {formatDistanceToNow(report.createdAt?.toDate ? report.createdAt.toDate() : new Date(), { locale: fr })}</span>
                    </div>
                    <p className="text-sm font-bold text-white">Signalé : <span className="text-rose-400">ID #{report.targetId.slice(0,8)}</span></p>
                    <p className="text-xs text-stone-500 italic">"Type : {report.type}"</p>
                    <div className="pt-4 flex gap-2">
                      <Button onClick={() => resolveReportMutation.mutate(report.id)} size="sm" className="bg-white/5 border border-white/10 text-white hover:bg-emerald-500 hover:text-black rounded-xl text-[10px] uppercase font-black px-4">Marquer résolu</Button>
                      <Button variant="ghost" size="sm" className="text-stone-500 hover:text-white rounded-xl text-[10px] uppercase font-black px-4">Détails</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="p-12 text-center text-emerald-500/40 italic text-sm">Le Hub est calme. Aucune anomalie détectée.</div>
            )}
          </div>
        </section>
      </div>

      {/* 4. LATEST SIGNUPS TABLE */}
      <section id="users" className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-display font-black uppercase tracking-tighter">Registre des Voyageurs</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
            <input placeholder="Filtrer..." className="pl-9 h-10 rounded-xl bg-white/5 border border-white/5 text-xs w-64" />
          </div>
        </div>

        <Card className="border-white/5 bg-stone-900/30 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-500">Voyageur</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-500">Destinée</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-500">Inscrit le</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-500">Coins</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingUsers ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-stone-800 rounded w-full" /></td>
                  </tr>
                )) : latestUsers.map((user: any) => (
                  <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-white/10">
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback>{user.displayName?.slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm">{user.displayName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="outline" className={cn(
                        "text-[8px] uppercase px-2 py-0.5",
                        user.role === 'admin' ? "border-rose-500 text-rose-500" : 
                        user.role?.includes('artist') ? "border-primary text-primary" : "border-stone-600 text-stone-500"
                      )}>{user.role || 'Voyageur'}</Badge>
                    </td>
                    <td className="px-8 py-5 text-xs text-stone-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-black text-sm text-emerald-500">{user.afriCoins} 🪙</td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="ghost" size="icon" className="text-stone-600 hover:text-white"><ChevronRight className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
