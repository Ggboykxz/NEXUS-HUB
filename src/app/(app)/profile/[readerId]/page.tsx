'use client';

import { use, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, BookOpen, Sparkles, Flame, Trophy, ShieldCheck, 
  MessageSquare, Settings as SettingsIcon, Share2, Plus, 
  History, Zap, Lock, EyeOff, Loader2, Globe, ArrowRight,
  TrendingUp, Star, Award, Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy, documentId, onSnapshot } from 'firebase/firestore';
import type { UserProfile, Story, LibraryEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ReaderProfilePage(props: { params: Promise<{ readerId: string }> }) {
  const params = use(props.params);
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [libraryEntries, setLibraryEntries] = useState<LibraryEntry[]>([]);
  const [displayStories, setDisplayStories] = useState<(Story & { progress?: number })[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  useEffect(() => {
    let unsubProfile: () => void;

    async function init() {
      const userRef = doc(db, 'users', params.readerId);
      
      unsubProfile = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const userData = snap.data() as UserProfile;
          setProfile(userData);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });

      onAuthStateChanged(auth, (user) => {
        setIsMe(user?.uid === params.readerId);
      });
    }

    init();
    return () => unsubProfile?.();
  }, [params.readerId]);

  useEffect(() => {
    if (!profile) return;

    const canSeeLibrary = profile.preferences?.privacy?.showHistory || isMe;
    
    if (canSeeLibrary) {
      setLoadingLibrary(true);
      const libRef = collection(db, 'users', params.readerId, 'library');
      const qLib = query(libRef, orderBy('lastReadAt', 'desc'), limit(10));
      
      const unsubLib = onSnapshot(qLib, async (libSnap) => {
        const entries = libSnap.docs.map(d => d.data() as LibraryEntry);
        setLibraryEntries(entries);

        if (entries.length > 0) {
          const storyIds = entries.map(e => e.storyId);
          const storiesRef = collection(db, 'stories');
          const qStories = query(storiesRef, where(documentId(), 'in', storyIds.slice(0, 10)));
          const storiesSnap = await getDocs(qStories);
          
          const fetchedStories = storiesSnap.docs.map(d => {
            const storyData = { id: d.id, ...d.data() } as Story;
            const entry = entries.find(e => e.storyId === d.id);
            return { ...storyData, progress: entry?.progress || 0 };
          });

          const sortedStories = fetchedStories.sort((a, b) => {
            const indexA = storyIds.indexOf(a.id);
            const indexB = storyIds.indexOf(b.id);
            return indexA - indexB;
          });

          setDisplayStories(sortedStories);
        } else {
          setDisplayStories([]);
        }
        setLoadingLibrary(false);
      });

      return () => unsubLib();
    }
  }, [profile, isMe, params.readerId]);

  const handleFollow = () => {
    if (!auth.currentUser) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour suivre ce voyageur.", variant: "destructive" });
      return;
    }
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Abonnement retiré" : "Nouvel abonnement !",
      description: isFollowing ? `Vous ne suivez plus ${profile?.displayName}.` : `Vous suivez désormais les aventures de ${profile?.displayName}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Accès au Sanctuaire...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-32 text-center space-y-6">
        <div className="bg-white/5 p-6 rounded-full w-fit mx-auto border border-white/10">
          <EyeOff className="h-12 w-12 text-stone-700" />
        </div>
        <h2 className="text-3xl font-display font-black text-white">Profil Introuvable</h2>
        <p className="text-stone-500 italic max-w-sm mx-auto">"Ce voyageur semble avoir disparu dans les sables du temps."</p>
        <Button asChild variant="outline" className="rounded-full border-primary text-primary">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  const isLibraryPublic = profile.preferences?.privacy?.showHistory || isMe;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. BANNER & AVATAR HERO */}
      <header className="relative group">
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <Image 
            src={profile.bannerURL || "https://picsum.photos/seed/nexus-banner/1200/400"} 
            alt="Banner" 
            fill 
            className="object-cover opacity-40 transition-transform duration-[10000ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
        </div>

        <div className="container max-w-6xl mx-auto px-6 relative -mt-32 md:-mt-40 z-10">
          <div className="flex flex-col md:flex-row items-end gap-8 md:gap-12">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <Avatar className="h-40 w-40 md:h-52 md:w-52 border-[6px] border-background ring-4 ring-primary/20 shadow-2xl transition-transform duration-700 hover:scale-105">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} className="object-cover" />
                <AvatarFallback className="bg-stone-900 text-primary text-5xl font-black">{profile.displayName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {profile.isCertified && (
                <div className="absolute bottom-2 right-2 bg-primary text-black p-2 rounded-full border-4 border-background shadow-xl">
                  <ShieldCheck className="h-6 w-6 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left pb-4 md:pb-8 space-y-6 w-full">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter gold-resplendant">{profile.displayName}</h1>
                  <Badge className={cn(
                    "uppercase tracking-widest text-[9px] font-black px-3 py-1 border-none",
                    profile.role?.includes('artist') ? "bg-orange-500 text-black" : "bg-emerald-500 text-white"
                  )}>
                    {profile.role?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-stone-400 font-light italic text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
                  "{profile.bio || "Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin."}"
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {isMe ? (
                  <Button asChild size="lg" className="rounded-full px-10 font-black bg-primary text-black gold-shimmer h-14 shadow-xl shadow-primary/20">
                    <Link href="/settings"><SettingsIcon className="mr-2 h-5 w-5" /> Gérer mon Sanctuaire</Link>
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleFollow}
                      variant={isFollowing ? 'secondary' : 'default'} 
                      size="lg"
                      className={cn("rounded-full px-12 font-black h-14 transition-all", isFollowing ? "bg-white/5 text-white border-white/10" : "bg-primary text-black gold-shimmer")}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </Button>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/5 backdrop-blur-md">
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. STATS BAR */}
      <section className="container max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Niveau Nexus', val: profile.level || 1, icon: Trophy, color: 'text-primary' },
            { label: 'Abonnés', val: profile.subscribersCount || 0, icon: Users, color: 'text-emerald-500' },
            { label: 'Chapitres', val: profile.readingStats?.chaptersRead || 0, icon: BookOpen, color: 'text-blue-500' },
            { label: 'Streak', val: (profile.readingStreak?.currentCount || 0) + 'j', icon: Flame, color: 'text-orange-500' },
          ].map((stat, i) => (
            <Card key={i} className="bg-stone-900/30 border-white/5 rounded-3xl p-6 hover:bg-stone-900/50 transition-all text-center space-y-2">
              <div className={cn("bg-white/5 p-2 rounded-xl w-fit mx-auto mb-2", stat.color)}><stat.icon className="h-5 w-5" /></div>
              <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.val}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. TABS CONTENT */}
      <main className="container max-w-6xl mx-auto px-6">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/50 max-w-md mx-auto mb-16 w-full flex">
            <TabsTrigger value="library" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <BookOpen className="h-4 w-4" /> Vitrine
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <History className="h-4 w-4" /> Journal
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <Zap className="h-4 w-4" /> Talent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-16 animate-in fade-in duration-700">
            {profile.preferences?.privacy?.showCurrentReading && libraryEntries[0] && (
              <section className="bg-primary/[0.03] border border-primary/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><History className="h-64 w-64 text-primary" /></div>
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="text-center md:text-left space-y-4">
                    <Badge className="bg-primary text-black animate-pulse uppercase tracking-[0.2em] font-black text-[9px] px-4 py-1">LIT ACTUELLEMENT</Badge>
                    <h3 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">Immersion en cours</h3>
                    <p className="text-stone-400 italic font-light max-w-sm">"Découvrez la série qui passionne {profile.displayName} en ce moment."</p>
                  </div>
                  <div className="flex-1 flex justify-center md:justify-end">
                    <Link href={`/read/${libraryEntries[0].storyId}`} className="group/card w-full max-w-md">
                      <div className="bg-stone-950 border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-8 hover:border-primary/30 transition-all shadow-2xl backdrop-blur-md">
                        <div className="relative h-32 w-24 rounded-2xl overflow-hidden shadow-lg shrink-0 border border-white/5">
                          <Image src={libraryEntries[0].storyCover} alt="Current" fill className="object-cover group-hover/card:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <h4 className="font-display font-black text-xl text-white group-hover/card:text-primary transition-colors truncate">{libraryEntries[0].storyTitle}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-stone-500">
                              <span>Progression</span>
                              <span className="text-primary">{libraryEntries[0].progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" style={{ width: `${libraryEntries[0].progress}%` }} />
                            </div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full text-primary h-12 w-12 bg-primary/10 shrink-0 group-hover/card:scale-110 transition-transform"><ArrowRight className="h-6 w-6" /></Button>
                      </div>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-10">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-display font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                  <Heart className="h-6 w-6 text-rose-500 fill-rose-500" /> Coups de Cœur
                </h3>
              </div>

              {!isLibraryPublic ? (
                <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center gap-4">
                  <Lock className="h-12 w-12 text-stone-700 opacity-20" />
                  <p className="text-stone-500 italic font-light">"Ce voyageur garde ses archives secrètes."</p>
                </div>
              ) : displayStories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                  {displayStories.map(story => (
                    <StoryCard key={story.id} story={story} progress={story.progress} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
                  <Sparkles className="h-12 w-12 text-stone-700 mx-auto opacity-20" />
                  <p className="text-stone-500 italic font-light">"Aucune œuvre dans cette vitrine pour le moment."</p>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="activity" className="animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { type: 'like', text: 'a aimé "Le Secret des Orishas"', time: 'Il y a 2h', icon: Heart, color: 'text-rose-500' },
                { type: 'read', text: 'a débloqué l\'épisode 12 de "Cyber-Reines"', time: 'Hier', icon: BookOpen, color: 'text-emerald-500' },
                { type: 'comment', text: 'a rejoint le club "Les Veilleurs du Sahel"', time: 'Il y a 3 jours', icon: MessageSquare, color: 'text-primary' },
              ].map((act, i) => (
                <Card key={i} className="bg-stone-900/50 border-white/5 rounded-3xl hover:border-primary/20 transition-all group shadow-xl">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className={cn("p-4 rounded-2xl bg-white/5 transition-transform group-hover:scale-110 shadow-inner", act.color)}><act.icon className="h-6 w-6" /></div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-stone-300"><span className="font-black text-white">{profile.displayName}</span> {act.text}</p>
                      <p className="text-[10px] text-stone-600 uppercase font-black tracking-widest mt-2 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {act.time}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Oracle de l\'Encre', level: 'Niveau 4', icon: Award, color: 'text-primary', desc: 'A commenté plus de 50 chapitres.' },
                { label: 'Mécène de Légende', level: 'Or', icon: Zap, color: 'text-amber-500', desc: 'A soutenu 10 artistes avec des AfriCoins.' },
                { label: 'Voyageur Assidu', level: '30j', icon: TrendingUp, color: 'text-emerald-500', desc: 'Plus longue série de lecture ininterrompue.' },
              ].map((badge, i) => (
                <Card key={i} className="bg-stone-950 border-white/5 rounded-[2.5rem] p-10 text-center space-y-6 group hover:border-primary/20 transition-all shadow-2xl">
                  <div className={cn("p-6 rounded-[2.5rem] w-fit mx-auto transition-transform group-hover:scale-110 bg-white/5 shadow-inner", badge.color)}>
                    <badge.icon className="h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-display font-black text-white">{badge.label}</h4>
                    <Badge variant="outline" className="text-[9px] uppercase border-white/10 text-stone-500">{badge.level}</Badge>
                  </div>
                  <p className="text-sm text-stone-500 italic font-light leading-relaxed">"{badge.desc}"</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
