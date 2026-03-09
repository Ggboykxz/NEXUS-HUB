'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, BrainCircuit, TrendingUp, Plus, 
  ChevronRight, Eye, Heart, Wand2, Share2, 
  Globe, Clock, Loader2, Download, CheckCircle2, 
  FileArchive, PenSquare, Calendar, Zap, LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Story, Chapter } from '@/lib/types';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

export default function StoryDashboardPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'stories', storyId));
        if (snap.exists()) {
          const data = snap.data() as Story;
          if (data.artistId !== user.uid) {
            router.push('/dashboard/creations');
            toast({ title: "Accès refusé", variant: "destructive" });
            return;
          }
          setStory({ id: snap.id, ...data } as Story);

          const chaptersRef = collection(db, 'stories', storyId, 'chapters');
          const q = query(chaptersRef, orderBy('chapterNumber', 'asc'));
          const chaptersSnap = await getDocs(q);
          setChapters(chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter)));
        } else {
          router.push('/dashboard/creations');
        }
      } catch (error) {
        console.error(error);
        router.push('/dashboard/creations');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [storyId, router, toast]);

  const handleDownloadChapter = async (chapter: Chapter) => {
    if (downloadingId) return;
    setDownloadingId(chapter.id);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`chapter_${chapter.chapterNumber}`);
      toast({ title: "Archivage...", description: `Préparation de l'épisode ${chapter.chapterNumber}...` });

      const downloadPromises = chapter.pages.map(async (page, idx) => {
        const response = await fetch(page.imageUrl);
        const blob = await response.blob();
        const ext = page.imageUrl.split('?')[0].split('.').pop() || 'jpg';
        folder?.file(`page_${(idx + 1).toString().padStart(3, '0')}.${ext}`, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${story?.title.replace(/\s+/g, '_')}_Ch${chapter.chapterNumber}.zip`;
      link.click();
      toast({ title: "Terminé !", description: "L'archive a été sauvegardée." });
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-950"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!story) return null;

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12 animate-in fade-in duration-1000">
      {/* ATELIER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 bg-stone-900/50 p-8 md:p-12 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-64 w-64 text-primary" /></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="relative h-48 w-36 rounded-3xl overflow-hidden shadow-2xl border-4 border-background ring-2 ring-primary/20 shrink-0">
            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary text-black font-black text-[8px] uppercase tracking-widest px-3">ATELIER PRO</Badge>
              <Badge variant={story.isPublished ? "default" : "secondary"} className={cn("text-[8px] uppercase px-3", story.isPublished ? "bg-emerald-500" : "bg-amber-500 text-black")}>
                {story.isPublished ? 'En Ligne' : 'Brouillon'}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-white">{story.title}</h1>
            <div className="flex items-center gap-6 text-stone-500 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> {story.format}</span>
              <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> {story.genre}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto relative z-10">
          <Button asChild variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 border-white/10 text-white hover:bg-white/5 gap-2 px-8">
            <Link href={`/dashboard/creations/${storyId}/edit`}><PenSquare className="h-5 w-5" /> Éditer</Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none rounded-2xl h-14 bg-white text-black font-black px-10 shadow-xl hover:bg-stone-200">
            <Link href={`/read/${storyId}`}><Eye className="mr-2 h-5 w-5" /> Aperçu Public</Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* AI STUDIO TOOLS */}
          <section className="space-y-6">
            <h2 className="text-xl font-display font-black uppercase tracking-widest flex items-center gap-2 text-white">
              <BrainCircuit className="h-6 w-6 text-primary" /> Outils AI Studio
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Analyse Éditoriale", icon: Wand2, desc: "Rythme, dialogues et clichés.", href: "editorial", color: "text-primary bg-primary/10" },
                { title: "Studio Traduction", icon: Languages, desc: "Exportez vers 5+ langues.", href: "translate", color: "text-emerald-500 bg-emerald-500/10" }
              ].map((tool, i) => (
                <Link key={i} href={`/dashboard/creations/${storyId}/${tool.href}`} className="group">
                  <Card className="h-full bg-stone-900/50 border-white/5 rounded-[2.5rem] hover:border-primary/30 transition-all duration-500 p-8 space-y-4">
                    <div className={cn("p-4 rounded-2xl w-fit transition-transform group-hover:scale-110", tool.color)}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black font-display text-white group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-xs text-stone-500 italic mt-1 leading-relaxed">{tool.desc}</p>
                    </div>
                    <div className="flex items-center text-[10px] font-black uppercase text-primary pt-2">
                      Lancer l'assistant <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* CHAPTERS LIST */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-white">Saga des Épisodes</h2>
              <Badge variant="outline" className="border-white/10 text-stone-500 text-[10px] font-black px-3">{chapters.length} chapitres</Badge>
            </div>
            
            <div className="space-y-4">
              {chapters.map((chap) => (
                <div key={chap.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] bg-stone-900/30 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center font-display font-black text-xl text-stone-600 group-hover:text-primary transition-colors border border-white/5">
                    {chap.chapterNumber}
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="font-bold text-lg text-white truncate">{chap.title}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-1">
                      <p className="text-[10px] text-stone-500 font-bold uppercase flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> {chap.publishedAt ? new Date(chap.publishedAt as any).toLocaleDateString() : 'Brouillon'}
                      </p>
                      <Badge className={cn("text-[8px] font-black uppercase px-2 h-4", chap.isPremium ? "bg-primary/10 text-primary border-primary/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                        {chap.isPremium ? 'Premium' : 'Gratuit'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => handleDownloadChapter(chap)} disabled={!!downloadingId} variant="outline" className="h-11 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 font-black text-[9px] uppercase">
                      {downloadingId === chap.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-4 w-4 text-primary" />} Archivage
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-stone-500 hover:text-white hover:bg-white/5">
                      <Link href={`/read/${storyId}?chapter=${chap.id}`}><Eye className="h-5 w-5" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button asChild className="w-full h-20 rounded-[2rem] bg-stone-900 border-2 border-dashed border-white/10 text-stone-500 hover:text-primary hover:border-primary/50 transition-all font-display font-black text-xl gap-4">
                <Link href={`/dashboard/creations/${storyId}/add-chapter`}>
                  <div className="bg-primary/10 p-2 rounded-xl"><Plus className="h-6 w-6 text-primary" /></div>
                  Nouvel Épisode
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* PERFORMANCE SIDEBAR */}
        <aside className="space-y-10">
          <Card className="bg-stone-950 border-none rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="h-48 w-48 text-primary" /></div>
            <h3 className="text-xl font-display font-black text-primary mb-8 tracking-widest">Impact Réel</h3>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2"><Eye className="h-3 w-3 text-primary" /> Lectures Totales</p>
                <p className="text-4xl font-black">{(story.views / 1000).toFixed(1)}k</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2"><Heart className="h-3 w-3 text-rose-500" /> Favoris</p>
                <p className="text-4xl font-black">{(story.likes / 1000).toFixed(1)}k</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-10 rounded-xl border-white/10 text-white h-12 text-[10px] font-black uppercase tracking-[0.2em]">
              <Link href="/dashboard/stats">Accéder aux Analytics</Link>
            </Button>
          </Card>

          <Card className="bg-stone-900/50 border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl"><FileArchive className="h-6 w-6 text-emerald-500" /></div>
              <h4 className="font-black text-white text-sm uppercase">Sécurité Archives</h4>
            </div>
            <p className="text-xs text-stone-500 italic leading-relaxed">
              "Vos planches sont sauvegardées sur nos serveurs CDN mondiaux. Téléchargez vos archives originales à tout moment via l'outil d'archivage ZIP."
            </p>
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Backup Cloud Actif</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
