'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, MessageSquare, BookOpen, UserCheck, PlusCircle, Send, 
  Loader2, Info, Shield, Crown
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  increment,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.clubId as string;

  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('discussions');
  const [newPostText, setNewPostText] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // 1. FETCHING DATA
  const { data: club, isLoading: loadingClub } = useQuery({ 
    queryKey: ['club-details', clubId], 
    queryFn: async () => {
      const docRef = doc(db, 'readingClubs', clubId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as any : null;
    },
    enabled: !!clubId,
  });

  const { data: members = [], isLoading: loadingMembers } = useQuery({ 
    queryKey: ['club-members', clubId], 
    queryFn: async () => {
      const membersRef = collection(db, 'readingClubs', clubId, 'members');
      const q = query(membersRef, orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    },
    enabled: !!clubId,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({ 
    queryKey: ['club-posts', clubId], 
    queryFn: async () => {
      const postsRef = collection(db, 'readingClubs', clubId, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    },
    enabled: !!clubId,
  });

  const isMember = useMemo(() => {
    if (!currentUser || !members) return false;
    return members.some(m => m.userId === currentUser.uid);
  }, [members, currentUser]);

  // 2. MUTATIONS
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        openAuthModal('rejoindre ce club');
        throw new Error('Auth required');
      }
      if (isMember) return;

      const memberRef = doc(db, 'readingClubs', clubId, 'members', currentUser.uid);
      const clubRef = doc(db, 'readingClubs', clubId);

      await setDoc(memberRef, { 
        userId: currentUser.uid, 
        userName: currentUser.displayName || 'Voyageur', 
        userPhoto: currentUser.photoURL || '',
        joinedAt: serverTimestamp(),
        role: 'member'
      });
      await updateDoc(clubRef, { membersCount: increment(1) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-details', clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-members', clubId] });
      toast({ title: "Bienvenue dans le cercle !" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" })
  });

  const postMutation = useMutation({
    mutationFn: async (text: string) => {
        if (!currentUser || !isMember) {
            openAuthModal('commenter dans le club');
            throw new Error('Auth or membership required');
        }

        const postsRef = collection(db, 'readingClubs', clubId, 'posts');
        await addDoc(postsRef, {
            text: text,
            authorId: currentUser.uid,
            authorName: currentUser.displayName || 'Anonyme',
            authorPhoto: currentUser.photoURL || '',
            createdAt: serverTimestamp()
        });
    },
    onSuccess: () => {
        setNewPostText('');
        queryClient.invalidateQueries({ queryKey: ['club-posts', clubId] });
    },
    onError: (e: any) => toast({ title: "Erreur d'envoi", description: e.message, variant: "destructive" })
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostText.trim()) {
        postMutation.mutate(newPostText.trim());
    }
  }
  
  if (loadingClub) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!club) {
    return <div className="text-center py-40">Club non trouvé.</div>;
  }

  return (
    <div className="pb-24">
      {/* --- HEADER --- */}
      <header className="relative h-[400px] lg:h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          <Image src={club.image || 'https://picsum.photos/seed/club-header/1600/900'} alt={club.name} fill className="object-cover" />
          <div className="container mx-auto max-w-7xl px-6 relative z-20 h-full flex flex-col justify-end pb-12">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                  <div className="flex items-start gap-6">
                      <Avatar className="h-24 w-24 border-4 border-background ring-4 ring-primary/20 shadow-xl shrink-0">
                          <AvatarImage src={`https://picsum.photos/seed/logo${club.id}/200/200`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">{club.name.slice(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 pt-4">
                          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">{club.name}</h1>
                          <p className="text-stone-300 italic max-w-2xl text-sm">"{club.description}"</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                      <Badge className="text-[10px] uppercase font-black tracking-widest bg-primary/10 border border-primary/20 text-primary px-3 py-1">{club.category}</Badge>
                      <div className="flex items-center gap-2"><Users className="h-4 w-4 text-stone-400" /><span className="font-bold text-white">{club.membersCount}</span></div>
                      {isMember ? (
                          <Button variant="secondary" className="rounded-full h-12 px-6 font-black" disabled>
                            <UserCheck className="h-4 w-4 mr-2"/> Membre
                          </Button>
                      ) : (
                          <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="rounded-full h-12 px-6 font-black bg-primary text-black gold-shimmer">
                              {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2"/>} Rejoindre
                          </Button>
                      )}
                  </div>
              </div>
          </div>
      </header>

      {/* --- TABS & CONTENT --- */}
      <main className="container mx-auto max-w-7xl px-6 mt-12">
          <div className="border-b border-white/10 mb-8">
              <div className="flex items-center gap-2">
                  {[
                      { id: 'discussions', label: 'Discussions', icon: MessageSquare },
                      { id: 'members', label: 'Membres', icon: Users },
                      { id: 'works', label: 'Œuvres du Club', icon: BookOpen },
                  ].map(tab => (
                      <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all",
                            activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'
                        )} >
                          <tab.icon className="h-4 w-4"/>
                          {tab.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* --- TAB PANELS --- */}
          <div>
              {activeTab === 'discussions' && (
                  <div className="max-w-3xl mx-auto space-y-8">
                      {isMember && (
                          <form onSubmit={handlePostSubmit} className="flex items-start gap-4">
                              <Avatar className="mt-1">
                                  <AvatarImage src={currentUser?.photoURL || ''} />
                                  <AvatarFallback>{currentUser?.displayName?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="w-full space-y-3">
                                  <Textarea 
                                    value={newPostText} 
                                    onChange={e => setNewPostText(e.target.value)}
                                    placeholder="Partagez vos pensées avec le cercle..."
                                    className="bg-card/50 border-white/10 rounded-xl min-h-[80px]"
                                    rows={3}
                                  />
                                  <Button type="submit" disabled={postMutation.isPending || !newPostText.trim()} className="h-10 px-5 float-right font-black rounded-lg text-xs">
                                    {postMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3 w-3 mr-2"/>} Publier
                                  </Button>
                              </div>
                          </form>
                      )}
                      
                      {loadingPosts ? (
                          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                      ) : posts.length > 0 ? (
                          <div className="space-y-6">
                              {posts.map(post => (
                                  <div key={post.id} className="flex items-start gap-4">
                                      <Avatar>
                                          <AvatarImage src={post.authorPhoto} />
                                          <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                                      </Avatar>
                                      <div className="bg-card/30 p-4 rounded-xl rounded-tl-none w-full">
                                          <div className="flex items-baseline justify-between">
                                              <p className="font-bold text-white text-sm">{post.authorName}</p>
                                              <p className="text-xs text-stone-500">{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: fr }) : '...'}</p>
                                          </div>
                                          <p className="text-stone-300 text-sm mt-1 whitespace-pre-wrap">{post.text}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-20 bg-stone-900/30 rounded-xl border-2 border-dashed border-white/5">
                              <Info className="h-8 w-8 text-stone-600 mx-auto mb-2"/>
                              <p className="text-stone-500 font-medium">Aucune discussion pour le moment.</p>
                              {isMember && <p className="text-stone-600 text-sm">Soyez le premier à lancer le débat !</p>}
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'members' && (
                  <div>
                      {loadingMembers ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {members.map(member => (
                                <Card key={member.id} className="bg-card/50 text-center p-6 rounded-2xl">
                                    <Avatar className="h-20 w-20 mx-auto border-4 border-background shadow-lg">
                                        <AvatarImage src={member.userPhoto} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{member.userName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <h4 className="font-bold text-white mt-4 truncate">{member.userName}</h4>
                                    {member.role === 'owner' ? (
                                        <Badge className="mt-2 bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] font-bold"><Crown className="h-3 w-3 mr-1"/> Fondateur</Badge>
                                    ) : (
                                        <Badge variant="outline" className="mt-2 text-stone-400 border-white/10 text-[9px] font-bold"><Shield className="h-3 w-3 mr-1"/> Membre</Badge>
                                    )}
                                </Card>
                            ))}
                        </div>
                      )}
                  </div>
              )}

              {activeTab === 'works' && (
                  <div className="text-center py-20 bg-stone-900/30 rounded-xl border-2 border-dashed border-white/5">
                      <Info className="h-8 w-8 text-stone-600 mx-auto mb-2"/>
                      <p className="text-stone-500 font-medium">Bientôt disponible.</p>
                      <p className="text-stone-600 text-sm">Les œuvres sélectionnées par le club apparaîtront ici.</p>
                  </div>
              )}
          </div>
      </main>
    </div>
  );
}
