'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PlusCircle, 
  ChevronDown, 
  Search, 
  Flame, 
  Star, 
  MessageSquare, 
  Eye, 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Users, 
  Trophy, 
  Newspaper, 
  Crown, 
  ShieldAlert, 
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ForumsHubPage() {
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeRegion, setActiveRegion] = useState('Toute l\'Afrique');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newThread, setNewThread] = useState({
    title: '',
    category: 'Salon de l\'Encre',
    content: '',
    isSpoiler: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['forum-threads-list'],
    queryFn: async () => {
      const q = query(
        collection(db, 'forumThreads'),
        orderBy('createdAt', 'desc'),
        limit(30)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const handleCreateThread = async () => {
    if (!currentUser) {
      openAuthModal('créer un sujet');
      return;
    }

    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast({ title: "Données manquantes", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const threadRef = await addDoc(collection(db, 'forumThreads'), {
        title: newThread.title.trim(),
        category: newThread.category,
        content: newThread.content.trim(),
        isSpoiler: newThread.isSpoiler,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Voyageur Anonyme',
        authorPhoto: currentUser.photoURL || '',
        authorKarma: 0,
        views: 0,
        replies: 0,
        isPinned: false,
        isPremium: false,
        createdAt: serverTimestamp()
      });

      queryClient.invalidateQueries({ queryKey: ['forum-threads-list'] });
      setIsCreateOpen(false);
      setNewThread({ title: '', category: 'Salon de l\'Encre', content: '', isSpoiler: false });
      
      toast({ title: "Sujet publié !", description: "Votre discussion est maintenant en ligne." });
      router.push(`/forums/${threadRef.id}`);
    } catch (e: any) {
      toast({ title: "Erreur", description: "Impossible de publier le sujet.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'salon', title: 'Salon de l\'Encre', icon: Palette, desc: 'Critiques constructives et retours techniques entre artistes.', color: 'text-primary' },
    { id: 'marche', title: 'Marché des Talents', icon: Users, desc: 'Trouvez vos futurs co-créateurs (Scénaristes, Colos).', color: 'text-emerald-500' },
    { id: 'defi', title: 'Défi Hebdomadaire', icon: Trophy, desc: 'Un prompt, une semaine, une communauté de créateurs.', color: 'text-amber-500' },
    { id: 'actu', title: 'Actualités BD Afrique', icon: Newspaper, desc: 'Festivals, sorties et événements majeurs du continent.', color: 'text-cyan-500' },
  ];

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative py-16 px-6 overflow-hidden border-b border-primary/10 bg-stone-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">NexusHub Forums 2.0</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter gold-resplendant">
              L'Espace des <br/> Narrateurs Africains
            </h1>
            <p className="text-lg text-stone-400 font-light max-w-2xl leading-relaxed italic">
              Échangez, collaborez et progressez. Rejoignez plus de 50 000 passionnés de la culture panafricaine.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => !currentUser && openAuthModal('créer une discussion')} size="lg" className="rounded-full px-8 font-black shadow-xl shadow-primary/20 gold-shimmer bg-primary text-black">
                    <PlusCircle className="mr-2 h-5 w-5" /> Nouveau Sujet
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-2xl">
                  <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-3xl font-display font-black gold-resplendant">Lancer un Débat</DialogTitle>
                    <DialogDescription className="text-stone-400 italic">"Votre parole éclaire la communauté. Soyez bienveillant."</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Titre de la discussion</Label>
                      <Input 
                        value={newThread.title} 
                        onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                        placeholder="Ex: Quelle mythologie pour un futur Cyberpunk ?" 
                        className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Catégorie</Label>
                        <Select value={newThread.category} onValueChange={(val) => setNewThread({...newThread, category: val})}>
                          <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                            <SelectValue placeholder="Choisir un salon" />
                          </SelectTrigger>
                          <SelectContent className="bg-stone-900 border-white/10">
                            {sections.map(s => <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold">Contenu Spoiler</Label>
                          <p className="text-[8px] text-stone-500 uppercase font-black">Masquer le texte par défaut</p>
                        </div>
                        <Switch 
                          checked={newThread.isSpoiler} 
                          onCheckedChange={(val) => setNewThread({...newThread, isSpoiler: val})} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Message</Label>
                      <Textarea 
                        value={newThread.content}
                        onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                        placeholder="Développez votre pensée..." 
                        className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl italic font-light p-6" 
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      onClick={handleCreateThread} 
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg gold-shimmer"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Publier le sujet"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10">
                <Link href="#rules">Règles de Vie</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">124k</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Messages</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">8.2k</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Collaborations</p>
            </div>
            <div className="col-span-2 bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
              <div className="bg-primary/20 p-2 rounded-xl"><Star className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Système de Karma Actif</p>
                <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Gagnez des points en aidant la communauté</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUB-FORUMS NAVIGATION */}
      <section className="py-12 container max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {sections.map((section) => (
            <Card key={section.id} className="group hover:border-primary/30 transition-all duration-500 bg-card/50 cursor-pointer overflow-hidden border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className={cn("p-3 rounded-2xl w-fit transition-transform group-hover:scale-110", section.color, "bg-current/10")}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display tracking-tight group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{section.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Voir section</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. FILTERS & CONTENT */}
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-1/4 space-y-10">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">Filtres de l'Espace</h4>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Chercher dans les débats..." className="pl-9 h-11 rounded-xl bg-muted/30 border-none text-xs" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-11 rounded-xl border-border/50 bg-background/50 hover:bg-muted text-xs font-bold">
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {activeRegion}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl shadow-2xl">
                    {['Toute l\'Afrique', 'Gabon 🇬🇦', 'Sénégal 🇸🇳', 'Nigeria 🇳🇬', 'Côte d\'Ivoire 🇨🇮'].map(r => (
                      <DropdownMenuItem key={r} onClick={() => setActiveRegion(r)} className="text-xs font-medium cursor-pointer rounded-lg">{r}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Card className="border-none bg-stone-900 text-white p-6 rounded-[2rem] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="h-20 w-20" /></div>
              <h4 className="text-sm font-black uppercase text-primary mb-4 tracking-widest">Top Contributeurs</h4>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={`https://picsum.photos/seed/user${i}/100/100`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Voyageur_{i}</p>
                      <p className="text-[9px] text-emerald-500 font-black uppercase">Karma : {5000 - i*1000}</p>
                    </div>
                    {i === 1 && <Badge className="bg-primary text-black border-none text-[8px] h-4">ORACLE</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          <div className="lg:flex-1 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 mb-8">
                  <TabsTrigger value="all" className="rounded-xl px-6 font-bold text-xs uppercase">Tous les sujets</TabsTrigger>
                  <TabsTrigger value="trending" className="rounded-xl px-6 font-bold text-xs uppercase gap-2"><Flame className="h-4 w-4 text-orange-500" /> Tendances</TabsTrigger>
                  <TabsTrigger value="premium" className="rounded-xl px-6 font-bold text-xs uppercase gap-2"><Crown className="h-4 w-4 text-amber-500" /> Premium</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-card/50 border-border/50 rounded-2xl p-6">
                    <div className="flex gap-6 items-start">
                      <Skeleton className="h-12 w-12 rounded-full hidden md:block" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : threads.length > 0 ? (
                threads.map((thread) => (
                  <Link key={thread.id} href={`/forums/${thread.id}`} className="block group">
                    <Card className="transition-all duration-300 hover:shadow-2xl hover:border-primary/30 bg-card/50 border-border/50 rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex gap-6 items-start">
                          <div className="hidden md:flex flex-col items-center gap-1 w-16">
                            <Avatar className="h-12 w-12 border shadow-md group-hover:ring-2 ring-primary transition-all">
                              <AvatarImage src={thread.authorPhoto} />
                              <AvatarFallback className="font-bold">{thread.author?.slice(0,2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-[8px] font-black text-primary uppercase mt-1">Karma: {thread.authorKarma || '---'}</span>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-2">{thread.category}</Badge>
                              {thread.isPremium && <Badge className="bg-amber-500 text-black border-none text-[9px] font-black px-2 uppercase"><Crown className="h-3 w-3 mr-1 inline" /> Premium</Badge>}
                            </div>
                            <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors leading-tight">{thread.title}</h3>
                            <div className="flex items-center gap-4 text-muted-foreground text-xs pt-2 border-t border-border/30">
                              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {thread.replies || 0}</span>
                              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {thread.views || 0}</span>
                              <span className="ml-auto text-[10px] font-bold italic">Posté par {thread.author} &bull; {thread.createdAt?.toDate ? thread.createdAt.toDate().toLocaleDateString() : 'Récemment'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
                  <p className="text-stone-500 italic">"Les sables du forum sont calmes... Soyez le premier à lancer un débat !"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. RULES SECTION */}
      <section id="rules" className="py-24 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="container max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-black leading-tight text-white gold-resplendant">Code de Conduite <br/> NexusHub</h2>
            <div className="space-y-6">
              {[
                { icon: ShieldAlert, title: "Bienveillance Absolue", text: "Les critiques doivent être constructives. Le harcèlement est banni instantanément." },
                { icon: AlertTriangle, title: "Respect des Spoilers", text: "Utilisez les balises spoiler pour ne pas gâcher l'immersion des autres lecteurs." },
                { icon: CheckCircle2, title: "Propriété Intellectuelle", text: "Le plagiat est strictement interdit. Respectez les créations originales." },
              ].map((rule, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl h-fit"><rule.icon className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{rule.title}</h4>
                    <p className="text-stone-400 text-sm leading-relaxed">{rule.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="bg-white/5 border-white/10 p-8 rounded-[3rem] text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto shadow-2xl">
              <AlertTriangle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Un problème ?</h3>
            <p className="text-stone-400 text-sm italic">"Les Gardiens et les Sages veillent sur le Hub. Si vous rencontrez un comportement inapproprié, signalez-le."</p>
            <Button variant="outline" className="w-full h-12 rounded-2xl border-white/20 text-white font-bold hover:bg-white/10">
              Signaler un abus
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
