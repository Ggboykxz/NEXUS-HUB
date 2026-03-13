'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Sparkles, MessageSquare, Heart, Search, 
  PlusCircle, Trophy, Flame, ChevronRight, Filter, Globe, Lock,
  Loader2, Zap, Info, ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useToast } from '@/hooks/use-toast';

export default function ReadingClubsPage() {
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State for new club
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    storyId: '',
    isPrivate: false,
    category: 'Mythologie'
  });

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  // 1. Fetch Clubs from Firestore
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['reading-clubs-list'],
    queryFn: async () => {
      const q = query(
        collection(db, 'readingClubs'),
        orderBy('membersCount', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  // 2. Join Club Mutation
  const joinMutation = useMutation({
    mutationFn: async (clubId: string) => {
      if (!currentUser) {
        openAuthModal('rejoindre un club de lecture');
        throw new Error('Auth required');
      }

      const memberRef = doc(db, 'readingClubs', clubId, 'members', currentUser.uid);
      const clubRef = doc(db, 'readingClubs', clubId);

      // Check if already a member
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        toast({ title: "Déjà membre", description: "Vous faites déjà partie de ce cercle." });
        return;
      }

      await setDoc(memberRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Voyageur',
        userPhoto: currentUser.photoURL || '',
        joinedAt: serverTimestamp()
      });

      await updateDoc(clubRef, {
        membersCount: increment(1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-clubs-list'] });
      toast({ title: "Bienvenue dans le club !", description: "Vous pouvez maintenant participer aux débats." });
    }
  });

  // 3. Create Club Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        openAuthModal('créer votre propre club');
        throw new Error('Auth required');
      }

      const clubsRef = collection(db, 'readingClubs');
      const docRef = await addDoc(clubsRef, {
        name: newClub.name,
        description: newClub.description,
        storyId: newClub.storyId,
        isPrivate: newClub.isPrivate,
        category: newClub.category,
        ownerId: currentUser.uid,
        membersCount: 1, // The creator is the first member
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp(),
        image: `https://picsum.photos/seed/${Math.random()}/800/400`
      });

      // Add creator as member
      await setDoc(doc(db, 'readingClubs', docRef.id, 'members', currentUser.uid), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Créateur',
        userPhoto: currentUser.photoURL || '',
        role: 'owner',
        joinedAt: serverTimestamp()
      });

      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-clubs-list'] });
      setIsCreateOpen(false);
      setNewClub({ name: '', description: '', storyId: '', isPrivate: false, category: 'Mythologie' });
      toast({ title: "Club créé avec succès !", description: "Votre nouveau cercle est ouvert aux passionnés." });
    }
  });

  const filteredClubs = useMemo(() => clubs.filter((c: any) => {
    const searchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!searchMatch) return false;

    if (activeCategory === 'Tous') return true;
    
    if (activeCategory === 'Privés') {
        return c.isPrivate === true;
    }
    
    return c.category === activeCategory;
  }), [clubs, searchQuery, activeCategory]);

  const categories = [
    { name: "Tous", icon: Globe },
    { name: "Mythologie", icon: Sparkles },
    { name: "Afrofuturisme", icon: Flame },
    { name: "Action", icon: Zap },
    { name: "Privés", icon: Lock }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      {/* 1. HERO HEADER */}
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Clubs de Lecture Nexus</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              L'Expérience <br/><span className="gold-resplendant">Collective</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Ne lisez plus seul. Rejoignez des cercles de passionnés, participez aux débats de chapitre et votez pour l'avenir de vos héros."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => !currentUser && openAuthModal('créer un club')} size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-14 shadow-xl shadow-primary/20">
                    <PlusCircle className="mr-2 h-5 w-5" /> Créer un Club
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-lg">
                  <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-3xl font-display font-black gold-resplendant">Fonder un Cercle</DialogTitle>
                    <DialogDescription className="text-stone-400 italic">"Bâtissez une communauté autour des récits qui vous font vibrer."</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Nom du Club</Label>
                      <Input 
                        value={newClub.name} 
                        onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                        placeholder="Ex: Les Veilleurs d'Orisha" 
                        className="h-12 bg-white/5 border-white/10 rounded-xl" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Description</Label>
                      <Textarea 
                        value={newClub.description} 
                        onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                        placeholder="Quel est l'objectif de ce cercle ?" 
                        className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl italic font-light" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Catégorie</Label>
                        <Select value={newClub.category} onValueChange={(val) => setNewClub({...newClub, category: val})}>
                          <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                            <SelectValue placeholder="Genre" />
                          </SelectTrigger>
                          <SelectContent className="bg-stone-900 border-white/10">
                            <SelectItem value="Mythologie">Mythologie</SelectItem>
                            <SelectItem value="Afrofuturisme">Afrofuturisme</SelectItem>
                            <SelectItem value="Action">Action</SelectItem>
                            <SelectItem value="Histoire">Histoire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold">Privé</Label>
                          <p className="text-[8px] text-stone-500 uppercase">Sur invitation</p>
                        </div>
                        <Switch 
                          checked={newClub.isPrivate} 
                          onCheckedChange={(val) => setNewClub({...newClub, isPrivate: val})} 
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      onClick={() => createMutation.mutate()} 
                      disabled={createMutation.isPending || !newClub.name.trim()}
                      className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg gold-shimmer"
                    >
                      {createMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Initialiser le Cercle"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white font-bold h-14 px-10 hover:bg-white/10 backdrop-blur-md">
                <Link href="#how-it-works">Comment ça marche ?</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">{clubs.length}</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Clubs Actifs</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">12k</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Débats / jour</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SEARCH & FILTERS */}
      <section className="space-y-10">
        <div className="flex justify-between items-center">
             <h2 className="text-3xl font-display font-bold text-white">
                Explorer les Cercles <span className="text-stone-500 font-sans text-xl ml-2">({filteredClubs.length} clubs)</span>
             </h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50 overflow-x-auto w-full md:w-auto scrollbar-hide">
                {categories.map((cat) => (
                    <Button 
                      key={cat.name} 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveCategory(cat.name)}
                      className={cn(
                        "rounded-xl text-[10px] font-black uppercase tracking-tighter gap-2 whitespace-nowrap",
                        activeCategory === cat.name && "bg-primary text-black"
                      )}
                    >
                        <cat.icon className="h-3.5 w-3.5" /> {cat.name}
                    </Button>
                ))}
            </div>
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Chercher un club..." 
                    className="pl-9 h-12 rounded-2xl bg-muted/30 border-white/5 text-sm font-medium focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Consultation des cercles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClubs.map((club: any) => (
                  <Card key={club.id} className="h-full bg-card/50 border-border/50 rounded-[2.5rem] hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col">
                      <div className="h-32 bg-stone-900 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-black/40 z-10" />
                          <Image src={club.image || `https://picsum.photos/seed/${club.id}/400/200`} alt={club.name} fill className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-4 right-4 z-20">
                            {club.isPrivate ? <Badge className="bg-black/60 border-white/10 text-[8px] uppercase font-black"><Lock className="h-2 w-2 mr-1 inline" /> Privé</Badge> : <Badge className="bg-emerald-500/80 border-none text-white text-[8px] uppercase font-black">Public</Badge>}
                          </div>
                      </div>
                      <CardContent className="p-8 relative flex-1 flex flex-col">
                          <Avatar className="h-16 w-16 border-4 border-background absolute -top-8 left-8 shadow-2xl">
                              <AvatarImage src={`https://picsum.photos/seed/logo${club.id}/100/100`} />
                              <AvatarFallback className="bg-primary/10 text-primary font-black">{club.name.slice(0,1)}</AvatarFallback>
                          </Avatar>
                          <div className="pt-8 space-y-4 flex-1">
                              <div className="space-y-1">
                                  <h4 className="text-2xl font-display font-black text-white group-hover:text-primary transition-colors truncate leading-tight">{club.name}</h4>
                                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{club.category}</p>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed italic font-light line-clamp-2">"{club.description || "Aucune description pour ce sanctuaire."}"</p>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                  <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-stone-600" />
                                      <span className="text-xs font-black text-white">{club.membersCount} membres</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Actif récemment</span>
                              </div>
                          </div>
                      </CardContent>
                      <CardFooter className="p-8 pt-0">
                        <Button 
                          onClick={() => joinMutation.mutate(club.id)}
                          disabled={joinMutation.isPending}
                          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-primary hover:text-black transition-all gap-2"
                        >
                          {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlusCircle className="h-4 w-4" /> Rejoindre le Cercle</>}
                        </Button>
                      </CardFooter>
                  </Card>
              ))}

              {filteredClubs.length === 0 && (
                <div className="col-span-full text-center py-20 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-4">
                  <Info className="h-10 w-10 text-stone-700 mx-auto" />
                  <p className="text-stone-500 italic">"Aucun club ne correspond à votre recherche dans ces sables."</p>
                </div>
              )}
          </div>
        )}
      </section>

      {/* 4. SOCIAL VISION */}
      <section className="mt-24 p-12 rounded-[3rem] bg-stone-900 text-white relative overflow-hidden border border-white/5">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black gold-resplendant leading-tight">La Culture <br/> est un Partage</h2>
              <p className="text-stone-400 text-lg font-light leading-relaxed italic">
                "NexusHub ne se limite pas à la lecture. Nous bâtissons des ponts entre les esprits. Rejoignez des passionnés qui ont vos goûts, décryptez les théories les plus folles et progressez ensemble dans les mythes du continent."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: 'Salons Privés', text: 'Zéro distraction, juste vous et vos amis.' },
                { icon: Zap, text: 'Points de Karma collectifs.', title: 'Succès de Groupe' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-white/5 p-2 rounded-lg w-fit"><item.icon className="h-5 w-5 text-emerald-500" /></div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-[10px] text-stone-500 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
            <Image src="https://picsum.photos/seed/social-hub/800/800" alt="Social Hub" fill className="object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] max-w-xs scale-90 md:scale-100">
                <Users className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-white">Rejoignez 50k Passionnés</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
