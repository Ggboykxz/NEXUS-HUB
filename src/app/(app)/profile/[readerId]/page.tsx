'use client';

import { use, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryCard } from '@/components/story-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Ban, Heart, ListMusic, Lock, Globe, Users, 
  BookOpen, Sparkles, Flame, Trophy, ShieldCheck, 
  MessageSquare, Settings as SettingsIcon, Share2, Plus, 
  CheckCircle2, History, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { UserProfile, Story, LibraryEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ReaderProfilePage(props: { params: Promise<{ readerId: string }> }) {
  const params = use(props.params);
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [userLibrary, setUserLibrary] = useState<LibraryEntry[]>([]);
  const [favoriteStories, setFavoriteStories] = useState<Story[]>([]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const docRef = doc(db, 'users', params.readerId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          
          // Check if it's my profile
          onAuthStateChanged(auth, (user) => {
            setIsMe(user?.uid === params.readerId);
          });

          // Fetch Library
          const libSnap = await getDocs(query(collection(db, 'users', params.readerId, 'library'), limit(10)));
          const libEntries = libSnap.docs.map(d => d.data() as LibraryEntry);
          setUserLibrary(libEntries);

          // Fetch Stories details for library
          if (libEntries.length > 0) {
            const storyIds = libEntries.map(e => e.storyId);
            const storiesSnap = await getDocs(query(collection(db, 'stories'), where('id', 'in', storyIds)));
            const storiesList = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
            setFavoriteStories(storiesList);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [params.readerId]);

  const handleFollow = () => {
    if (!auth.currentUser) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour suivre ce lecteur.", variant: "destructive" });
      return;
    }
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Abonnement retiré" : "Nouvel abonnement !",
      description: isFollowing ? `Vous ne suivez plus ${profile?.displayName}.` : `Vous suivez désormais les aventures de ${profile?.displayName}.`,
    });
  };

  if (loading) {
    return <div className="flex justify-center py-32"><div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!profile) {
    return <div className="container py-32 text-center">Profil introuvable.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 1. HERO HEADER DU PROFIL */}
      <header className="relative py-16 bg-stone-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative">
              <Avatar className="h-40 w-40 border-4 border-background ring-4 ring-primary shadow-2xl">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">{profile.displayName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {profile.isCertified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-stone-950 shadow-xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-display font-black text-white tracking-tighter">{profile.displayName}</h1>
                  <Badge variant="secondary" className="bg-white/5 text-stone-400 border-white/10 uppercase text-[9px] font-black tracking-widest px-3">
                    {profile.role === 'reader' ? 'Lecteur Légendaire' : 'Artiste Créateur'}
                  </Badge>
                </div>
                <p className="text-stone-400 font-light italic text-lg leading-relaxed max-w-xl">
                  "{profile.bio || "Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin."}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-stone-500 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {profile.subscribersCount} abonnés</span>
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-500" /> {profile.readingStats?.chaptersRead || 0} chapitres lus</span>
                <span className="flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> {profile.readingStreak?.currentCount || 0}j de streak</span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                {isMe ? (
                  <Button asChild className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-11">
                    <Link href="/settings"><SettingsIcon className="mr-2 h-4 w-4" /> Gérer mon Profil</Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollow}
                      variant={isFollowing ? 'secondary' : 'default'} 
                      className={cn("rounded-full px-10 font-black h-11 transition-all", isFollowing ? "bg-white/5 text-white" : "bg-primary text-black gold-shimmer")}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </Button>
                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-white/10 text-white hover:bg-white/10">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-white/10 text-white hover:bg-white/10">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTENU PRINCIPAL PAR ONGLETS */}
      <main className="container max-w-6xl mx-auto px-6 py-12">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-12 border border-border/50 max-w-2xl">
            <TabsTrigger value="library" className="rounded-xl px-8 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <BookOpen className="h-4 w-4" /> Vitrine
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl px-8 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <History className="h-4 w-4" /> Activité
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl px-8 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Zap className="h-4 w-4" /> Talent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-12 animate-in fade-in duration-700">
            {/* EN DIRECT */}
            {profile.preferences?.privacy?.showCurrentReading && (
              <section className="bg-primary/[0.03] border border-primary/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><PlayCircle className="h-32 w-32 text-primary" /></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="text-center md:text-left space-y-2">
                    <Badge className="bg-primary text-black animate-pulse uppercase tracking-[0.2em] font-black text-[8px] px-3">LIT ACTUELLEMENT</Badge>
                    <h3 className="text-2xl font-display font-black">L'immersion continue</h3>
                    <p className="text-stone-500 text-sm italic font-light">"Découvrez la série qui passionne {profile.displayName} en ce moment."</p>
                  </div>
                  <div className="flex-1 flex justify-center md:justify-end">
                    {favoriteStories[0] && (
                      <Link href={getStoryUrl(favoriteStories[0])} className="group">
                        <div className="bg-background/50 border border-border/50 p-4 rounded-3xl flex items-center gap-4 hover:border-primary/30 transition-all shadow-xl backdrop-blur-md">
                          <div className="relative h-20 w-14 rounded-xl overflow-hidden shadow-lg shrink-0">
                            <Image src={favoriteStories[0].coverImage.imageUrl} alt="Current" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors">{favoriteStories[0].title}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Chapitre 12 en cours...</p>
                          </div>
                          <Button size="icon" variant="ghost" className="rounded-full text-primary h-10 w-10 bg-primary/10 group-hover:scale-110 transition-transform"><Plus className="h-5 w-5" /></Button>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* BIBLIOTHÈQUE PARTAGÉE */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-black flex items-center gap-3">
                  <Heart className="h-6 w-6 text-rose-500 fill-rose-500" /> Coups de Cœur
                </h3>
                <Link href="/library" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Voir tout le catalogue ({userLibrary.length})</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                {favoriteStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
              {favoriteStories.length === 0 && (
                <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border/50">
                  <p className="text-muted-foreground italic font-light">Aucune œuvre dans la vitrine pour le moment.</p>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="activity" className="animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { type: 'like', text: 'a aimé "Chroniques d\'Orisha"', time: 'Il y a 2h', icon: Heart, color: 'text-rose-500' },
                { type: 'read', text: 'a terminé le chapitre 15 de "Cyber-Reines"', time: 'Hier', icon: BookOpen, color: 'text-emerald-500' },
                { type: 'comment', text: 'a partagé une théorie sur le forum', time: 'Il y a 2 jours', icon: MessageSquare, color: 'text-primary' },
              ].map((act, i) => (
                <Card key={i} className="bg-card/50 border-border/50 rounded-2xl hover:border-primary/20 transition-all group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-xl bg-white/5", act.color)}><act.icon className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground"><span className="font-black">{profile.displayName}</span> {act.text}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{act.time}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="animate-in fade-in duration-700">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-stone-900 border-none rounded-[2rem] p-8 shadow-xl text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-2xl w-fit mx-auto"><Trophy className="h-8 w-8 text-primary" /></div>
                <h4 className="text-sm font-black uppercase text-stone-500 tracking-widest">Niveau Nexus</h4>
                <p className="text-4xl font-black text-white">42</p>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">650 / 1000 XP</p>
              </Card>

              <Card className="bg-stone-900 border-none rounded-[2rem] p-8 shadow-xl text-center space-y-4">
                <div className="bg-emerald-500/10 p-4 rounded-2xl w-fit mx-auto"><Zap className="h-8 w-8 text-emerald-500" /></div>
                <h4 className="text-sm font-black uppercase text-stone-500 tracking-widest">Engagement</h4>
                <p className="text-4xl font-black text-white">Top 5%</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Lecteur de la Semaine</p>
              </Card>

              <Card className="bg-stone-900 border-none rounded-[2rem] p-8 shadow-xl text-center space-y-4">
                <div className="bg-orange-500/10 p-4 rounded-2xl w-fit mx-auto"><Sparkles className="h-8 w-8 text-orange-500" /></div>
                <h4 className="text-sm font-black uppercase text-stone-500 tracking-widest">Affinité</h4>
                <p className="text-4xl font-black text-white">Afro-Futur</p>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Genre Préféré</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PlayCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
}
