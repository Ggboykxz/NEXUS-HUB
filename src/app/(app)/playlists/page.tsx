'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, PlusCircle, Globe, Lock, Loader2, Star, Sparkles, ChevronRight, Bookmark } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { Playlist } from '@/lib/types';

export default function MyPlaylistsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const queryClient = useQueryClient();

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: myPlaylists = [], isLoading: fetchingPlaylists } = useQuery({
    queryKey: ['my-playlists', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const q = query(
        collection(db, 'playlists'), 
        where('ownerId', '==', currentUser!.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Playlist));
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      await addDoc(collection(db, 'playlists'), {
        title: newName,
        description: newDesc,
        isPublic,
        ownerId: currentUser.uid,
        storyIds: [],
        storyCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-playlists'] });
      toast({ title: "Playlist créée !", description: "Votre nouvelle collection est prête." });
      setNewName('');
      setNewDesc('');
      setIsPublic(false);
    },
    onError: () => toast({ title: "Erreur", description: "Impossible de créer la playlist.", variant: "destructive" })
  });

  if (authLoading) return <div className="flex justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-24 text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-2xl">
          <ListMusic className="h-10 w-10 text-primary opacity-40" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">Mes Playlists</h1>
          <p className="text-stone-400 max-w-md mx-auto font-light italic leading-relaxed">"Créez des collections d'œuvres personnalisées et organisez votre voyage au travers des sables du temps."</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => openAuthModal('gérer vos playlists')} size="lg" className="h-16 px-12 rounded-full font-black text-lg bg-primary text-black gold-shimmer">
            Se connecter
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full font-bold border-white/10 text-white hover:bg-white/5">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-16">
      <header className="relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <ListMusic className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Collections Personnalisées</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">
              Mes <br/><span className="gold-resplendant">Playlists</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Organisez vos coups de cœur par thème, mood ou auteur. Partagez vos listes avec la communauté ou gardez votre jardin secret."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-12">
                    <PlusCircle className="mr-2 h-5 w-5" /> Nouvelle Playlist
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2rem] p-10 max-w-md">
                  <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <ListMusic className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-3xl font-display font-black gold-resplendant">Initialiser la Liste</DialogTitle>
                    <DialogDescription className="text-stone-400 italic">"Chaque collection commence par une intention."</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Nom de la collection</Label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Lectures du Sahel" className="h-12 bg-white/5 border-white/10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Description (optionnel)</Label>
                      <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Quelques mots sur cette sélection..." className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl italic font-light" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Rendre publique</Label>
                        <p className="text-[10px] text-stone-500">Visible par vos abonnés.</p>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onClick={() => createMutation.mutate()} disabled={!newName.trim() || createMutation.isPending} className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg gold-shimmer">
                        {createMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Créer la Playlist"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">{myPlaylists.length}</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Playlists</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">100%</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Inspiré</p>
            </div>
          </div>
        </div>
      </header>

      {fetchingPlaylists ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Consultation de vos archives...</p>
        </div>
      ) : myPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
          {myPlaylists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.id}`} className="group">
              <Card className="h-full bg-card/50 border-border/50 rounded-[2.5rem] hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col hover:shadow-2xl">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                      <Bookmark className="h-6 w-6" />
                    </div>
                    {playlist.isPublic ? <Globe className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-stone-600" />}
                  </div>
                  <CardTitle className="text-2xl font-display font-black group-hover:text-primary transition-colors leading-tight">{playlist.title}</CardTitle>
                  <CardDescription className="text-xs italic font-light line-clamp-2 mt-2 leading-relaxed">"{playlist.description || "Pas de description pour cette légende."}"</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 mt-auto">
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest">{playlist.storyCount} œuvres</span>
                    <Button variant="ghost" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/10 hover:text-primary">
                      Explorer <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 animate-in zoom-in-95 duration-700 space-y-8">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
            <Sparkles className="h-10 w-10 text-stone-500" />
          </div>
          <p className="text-stone-500 font-light italic mb-8 max-w-xs mx-auto leading-relaxed">"Votre sanctuaire est encore vierge. Commencez par créer une playlist pour vos futurs coups de cœur."</p>
        </div>
      )}
    </div>
  );
}
