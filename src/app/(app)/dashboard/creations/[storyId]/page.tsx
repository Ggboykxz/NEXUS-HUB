'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, BrainCircuit, TrendingUp, Plus, 
  ChevronRight, Eye, Heart, Wand2, Share2, 
  Globe, Clock, Loader2, Download, CheckCircle2, 
  FileArchive, PenSquare, Calendar, Zap, LayoutGrid,
  Settings2, BarChart3, Cloud, Trash2, ArrowUpRight, Layers
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

/**
 * L'Atelier : Le centre de commande d'une série.
 * Interface professionnelle et interactive pour les créateurs.
 */
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
      toast({ title: "Sauvegarde terminée", description: "L'archive ZIP a été générée." });
    } catch (e) {
      toast({ title: "Erreur lors de l'archivage", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-950"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!story) return null;

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12 animate-in fade-in duration-1000">
      {/* COMMAND CENTER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 bg-stone-900/50 p-10 md:p-16 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Cloud className="h-80 w-80 text-primary" /></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 w-full">
          <div className="relative h-64 w-48 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-background ring-2 ring-primary/20 shrink-0 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
          </div>
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge className="bg-primary text-black font-black text-[9px] uppercase tracking-widest px-4 py-1">CENTRE DE COMMANDE</Badge>
              <Badge variant={story.isPublished ? "default" : "secondary"} className={cn("text-[9px] uppercase font-black px-4 py-1", story.isPublished ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]")}>
                {story.isPublished ? 'Live on Hub' : 'Brouillon privé'}
              </Badge>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter text-white drop-shadow-2xl">{story.title}</h1>
              <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-stone-500 text-xs font-bold uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"><LayoutGrid className="h-4 w-4 text-primary" /> {story.format}</span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"><Globe className="h-4 w-4 text-emerald-500" /> {story.genre}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:flex-col gap-3 w-full md:w-auto shrink-0 relative z-10">
            <Button asChild size="lg" className="flex-1 md:flex-none rounded-2xl h-14 bg-primary text-black font-black px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-all gold-shimmer">
              <Link href={`/read/${story.id}`}><Eye className="mr-3 h-5 w-5 fill-current" /> Aperçu Immersion</Link>
            </Button>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 rounded-2xl h-14 border-white/10 text-white hover:bg-white/5 gap-3 px-6">
                <Link href={`/dashboard/creations/${storyId}/edit`}><Settings2 className="h-5 w-5" /> Paramètres</Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/10 transition-all">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* IA SUITE TOOLS */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2.5 rounded-2xl"><BrainCircuit className="h-6 w-6 text-primary" /></div>
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white">Suite Narrative IA</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Analyse Éditoriale", icon: Wand2, desc: "Analyse du rythme, des dialogues et détection de clichés.", href: "editorial", color: "text-primary bg-primary/10" },
                { title: "Studio Traduction", icon: Languages, desc: "Exportez vos chapitres en 5+ langues africaines.", href: "translate", color: "text-emerald-500 bg-emerald-500/10" }
              ].map((tool, i) => (
                <Link key={i} href={`/dashboard/creations/${storyId}/${tool.href}`} className="group">
                  <Card className="h-full bg-stone-900/50 border-white/5 rounded-[2.5rem] hover:border-primary/30 transition-all duration-500 p-8 space-y-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity"><tool.icon className="h-24 w-24" /></div>
                    <div className={cn("p-4 rounded-2xl w-fit transition-transform group-hover:scale-110", tool.color)}>
                      <tool.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black font-display text-white group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-xs text-stone-500 italic leading-relaxed">{tool.desc}</p>
                    </div>
                    <div className="flex items-center text-[10px] font-black uppercase text-primary pt-4 border-t border-white/5">
                      Lancer l'assistant <ChevronRight className="h-3 w-3 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* SAGA ARCHIVES */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2.5 rounded-2xl"><Layers className="h-6 w-6 text-emerald-500" /></div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white">Archives de la Saga</h2>
              </div>
              <Badge variant="outline" className="border-white/10 text-stone-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">{chapters.length} chapitres</Badge>
            </div>
            
            <div className="space-y-4">
              {chapters.map((chap) => (
                <div key={chap.id} className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-stone-900/30 border border-white/5 hover:border-primary/20 transition-all group shadow-xl backdrop-blur-sm">
                  <div className="h-16 w-16 rounded-2xl bg-stone-950 flex items-center justify-center font-display font-black text-2xl text-stone-700 group-hover:text-primary transition-colors border border-white/5 shadow-inner">
                    {chap.chapterNumber}
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                    <p className="font-bold text-xl text-white truncate">{chap.title}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4">
                      <p className="text-[10px] text-stone-500 font-black uppercase flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> {chap.publishedAt ? new Date((chap.publishedAt as any).seconds * 1000).toLocaleDateString() : 'En attente'}
                      </p>
                      <Badge className={cn("text-[8px] font-black uppercase px-3 h-5 border-none", chap.isPremium ? "bg-amber-500 text-black" : "bg-emerald-500 text-white")}>
                        {chap.isPremium ? 'Premium' : 'Public'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => handleDownloadChapter(chap)} disabled={!!downloadingId} variant="outline" className="h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 gap-3 font-black text-[10px] uppercase px-6">
                      {downloadingId === chap.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Download className="h-4 w-4 text-primary" />} Archivage
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-stone-950 text-stone-500 hover:text-primary hover:bg-primary/5 transition-all border border-white/5">
                      <Link href={`/read/${story.id}?chapter=${chap.id}`}><Eye className="h-5 w-5" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button asChild className="w-full h-24 rounded-[3rem] bg-stone-950 border-2 border-dashed border-white/10 text-stone-600 hover:text-primary hover:border-primary/50 transition-all font-display font-black text-2xl gap-6 group">
                <Link href={`/dashboard/creations/${story.id}/add-chapter`}>
                  <div className="bg-primary/5 p-3 rounded-2xl group-hover:scale-110 transition-transform"><Plus className="h-8 w-8 text-primary" /></div>
                  Écrire le prochain épisode
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <aside className="space-y-10 sticky top-24">
          <Card className="bg-stone-950 border-none rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-6 transition-transform duration-1000"><BarChart3 className="h-64 w-64 text-primary" /></div>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-display font-black text-primary uppercase tracking-widest">Performance</h3>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">Lectures Totales</p>
                  <span className="text-[10px] text-emerald-500 font-bold">+12%</span>
                </div>
                <p className="text-5xl font-black tracking-tighter">{(story.views / 1000).toFixed(1)}k</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">Engagement Fan</p>
                  <span className="text-[10px] text-primary font-bold">+5%</span>
                </div>
                <p className="text-5xl font-black tracking-tighter">{(story.likes / 1000).toFixed(1)}k</p>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full mt-12 rounded-2xl border-white/10 text-white h-14 text-xs font-black uppercase tracking-widest gap-3 hover:bg-white/5">
              <Link href="/dashboard/stats"><ArrowUpRight className="h-4 w-4" /> Analyse Profonde</Link>
            </Button>
          </Card>

          <Card className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl shadow-inner"><FileArchive className="h-6 w-6 text-emerald-500" /></div>
              <h4 className="font-black text-white text-sm uppercase tracking-widest">Nexus Cloud Vault</h4>
            </div>
            <p className="text-xs text-stone-500 italic leading-relaxed font-light">
              "Toutes vos planches sont cryptées et répliquées sur nos serveurs. Vos archives sont en sécurité, accessibles uniquement par vous."
            </p>
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Backup Triple-Point Actif</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
