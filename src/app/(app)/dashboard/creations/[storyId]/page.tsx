'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brush, Languages, BrainCircuit, TrendingUp, Plus, 
  Settings, ChevronRight, Eye, Heart, Star, LayoutGrid,
  FileText, Wand2, Share2, Globe, Clock, Loader2, Download,
  CheckCircle2, FileArchive, PenSquare
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      try {
        const snap = await getDoc(doc(db, 'stories', storyId));
        if (snap.exists()) {
          const data = snap.data() as Story;
          
          if (data.artistId !== user.uid) {
            router.push('/dashboard/creations');
            toast({ 
              title: "Accès refusé", 
              description: "Vous n'êtes pas l'auteur de cette légende.",
              variant: "destructive" 
            });
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
        console.error("Error fetching story:", error);
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
      
      toast({
        title: "Initialisation de l'archive",
        description: `Préparation du téléchargement de l'épisode ${chapter.chapterNumber}...`
      });

      const downloadPromises = chapter.pages.map(async (page, idx) => {
        const response = await fetch(page.imageUrl);
        const blob = await response.blob();
        const urlPart = page.imageUrl.split('?')[0];
        const ext = urlPart.split('.').pop() || 'jpg';
        const fileName = `page_${(idx + 1).toString().padStart(3, '0')}.${ext}`;
        folder?.file(fileName, blob);
      });

      await Promise.all(downloadPromises);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      const safeTitle = story?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeTitle}_chapter_${chapter.chapterNumber}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "Téléchargement terminé",
        description: `L'épisode ${chapter.chapterNumber} a été sauvegardé avec succès.`
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de générer l'archive ZIP.",
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase tracking-widest text-[10px]">Ouverture de l'Atelier...</p>
      </div>
    );
  }

  if (!story) return <div className="text-center py-32">Œuvre introuvable.</div>;

  const tools = [
    { 
      title: "IA Éditoriale", 
      icon: BrainCircuit, 
      desc: "Analyse de rythme, clichés et dialogues.", 
      href: `/dashboard/creations/${storyId}/editorial`,
      color: "text-primary bg-primary/10"
    },
    { 
      title: "Traduction", 
      icon: Languages, 
      desc: "Exportez votre univers en plusieurs langues.", 
      href: `/dashboard/creations/${storyId}/translate`,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    { 
      title: "World Building", 
      icon: Globe, 
      desc: "Gérez vos notes et templates d'univers.", 
      href: `/dashboard/world-building`,
      color: "text-blue-500 bg-blue-500/10"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-background ring-2 ring-primary/20">
            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-black font-black text-[8px] uppercase tracking-widest px-3">GESTION ÉDITORIALE</Badge>
              <Badge variant="outline" className="text-[8px] uppercase border-white/10 text-stone-400">{story.format}</Badge>
            </div>
            <h1 className="text-4xl font-display font-black tracking-tighter text-white">{story.title}</h1>
            <p className="text-stone-500 text-sm italic mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Dernière mise à jour : {new Date(story.updatedAt as any).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button asChild variant="outline" className="flex-1 md:flex-none rounded-full px-6 font-black border-white/10 text-white hover:bg-white/5 h-12 gap-2 text-xs uppercase tracking-widest">
            <Link href={`/dashboard/creations/${storyId}/edit`}>
              <PenSquare className="h-4 w-4 text-primary" /> Modifier l'œuvre
            </Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none rounded-full px-8 font-black bg-white text-black hover:bg-stone-200 h-12">
            <Link href={`/read/${storyId}`}><Eye className="mr-2 h-4 w-4" /> Voir l'œuvre</Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-6">
            <h2 className="text-xl font-display font-black uppercase tracking-widest flex items-center gap-2 text-white">
              <Wand2 className="h-5 w-5 text-primary" /> Outils de Création
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {tools.map((tool, i) => (
                <Link key={i} href={tool.href} className="group">
                  <Card className="h-full bg-stone-900/50 border-white/5 rounded-3xl hover:border-primary/30 transition-all duration-500 overflow-hidden group-hover:shadow-2xl">
                    <CardContent className="p-8 space-y-4">
                      <div className={cn("p-3 rounded-2xl w-fit transition-transform group-hover:scale-110", tool.color)}>
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black font-display text-white group-hover:text-primary transition-colors">{tool.title}</h3>
                        <p className="text-xs text-stone-500 leading-relaxed mt-1">{tool.desc}</p>
                      </div>
                      <div className="flex items-center text-[10px] font-black uppercase text-primary pt-2">
                        Ouvrir l'atelier <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-white">Épisodes de la Saga</h2>
              <Badge variant="outline" className="border-white/10 text-stone-500 text-[10px] font-black">{chapters.length} chapitres</Badge>
            </div>
            
            <div className="space-y-3">
              {chapters.length > 0 ? chapters.map((chap) => (
                <div key={chap.id} className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-stone-900/30 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center font-display font-black text-stone-500 group-hover:text-primary transition-colors border border-white/5 shrink-0">
                    {chap.chapterNumber}
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="font-bold text-white text-base truncate">{chap.title}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-1">
                      <p className="text-[10px] text-stone-500 uppercase tracking-tighter flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {new Date(chap.publishedAt as any).toLocaleDateString()}
                      </p>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5",
                        chap.isPremium ? "bg-primary/10 text-primary border-primary/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {chap.isPremium ? 'Premium' : 'Gratuit'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      onClick={() => handleDownloadChapter(chap)}
                      disabled={downloadingId !== null}
                      variant="outline" 
                      className="h-10 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 font-black text-[9px] uppercase tracking-widest"
                    >
                      {downloadingId === chap.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Archivage...</>
                      ) : (
                        <><Download className="h-3.5 w-3.5 text-primary" /> Télécharger</>
                      )}
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-stone-500 hover:text-white">
                      <Link href={`/read/${storyId}?chapter=${chap.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                  <p className="text-stone-500 italic text-sm">"L'ardoise est vierge. Publiez votre premier chapitre."</p>
                </div>
              )}
              
              <Button asChild variant="outline" className="w-full h-16 border-dashed border-white/10 rounded-2xl text-stone-500 hover:text-primary hover:border-primary/50 gap-3 font-display font-black text-lg">
                <Link href={`/dashboard/creations/${storyId}/add-chapter`}>
                  <Plus className="h-5 w-5" /> Ajouter un Épisode
                </Link>
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <Card className="border-none bg-stone-950 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="h-32 w-32" /></div>
            <h3 className="text-lg font-display font-black text-primary mb-6 tracking-widest">Performances</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Lectures</p>
                <p className="text-2xl font-black">{Math.floor(story.views / 1000)}k</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Favoris</p>
                <p className="text-2xl font-black">{Math.floor(story.likes / 1000)}k</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-8 rounded-xl border-white/10 text-white hover:bg-white/10 h-11 text-xs font-bold uppercase tracking-widest">
              <Link href="/dashboard/stats">Accéder aux Analytics</Link>
            </Button>
          </Card>

          <Card className="border-white/5 bg-stone-900/50 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 p-2 rounded-lg"><FileArchive className="h-5 w-5 text-emerald-500" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Propriété Totale</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[11px] text-stone-400 italic leading-relaxed">
                "NexusHub respecte votre art. Utilisez le bouton de téléchargement sur chaque chapitre pour récupérer vos planches originales en ZIP à tout moment."
              </p>
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <p className="text-[9px] text-emerald-500 font-bold uppercase flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Archivage Sécurisé Actif
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Calendar(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>;
}

function ShieldCheck(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
}
