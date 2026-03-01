'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Book, Edit, ShieldCheck, Share2, LayoutGrid, Award, Eye, Star, History, Clock, Loader2, Coins } from 'lucide-react';
import { StoryCard } from '@/components/story-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs, runTransaction } from 'firebase/firestore';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ArtistDetailClientProps {
  artist: UserProfile;
  artistStories: Story[];
}

export default function ArtistDetailClient({ artist, artistStories }: ArtistDetailClientProps) {
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [liveSubscribersCount, setLiveSubscribersCount] = useState(artist.subscribersCount || 0);
  
  // Donation State
  const [selectedAmount, setSelectedAmount] = useState('10');
  const [isDonating, setIsDonating] = useState(false);

  // Activity State
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // 1. Dynamic Banner Logic
  const selectedGradient = useMemo(() => {
    const gradients = [
      { from: '#D4A843', to: '#000000' }, // Gold/Black
      { from: '#3b82f6', to: '#6366f1' }, // Blue/Purple
      { from: '#10b981', to: '#14b8a6' }, // Green/Teal
      { from: '#ef4444', to: '#f97316' }, // Red/Orange
      { from: '#6366f1', to: '#f43f5e' }, // Indigo/Rose
      { from: '#f59e0b', to: '#78350f' }, // Amber/Brown
    ];
    const hash = artist.displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }, [artist.displayName]);

  const initials = useMemo(() => {
    return artist.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [artist.displayName]);

  // 2. Monitor Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsOwnProfile(user?.uid === artist.uid);
    });
    return () => unsubscribeAuth();
  }, [artist.uid]);

  // 3. Monitor Subscription Status
  useEffect(() => {
    if (!currentUser || isOwnProfile) {
      setIsSubscribed(false);
      return;
    }

    const subRef = doc(db, 'users', currentUser.uid, 'subscriptions', artist.uid);
    const unsubscribeSubscription = onSnapshot(subRef, (docSnap) => {
      setIsSubscribed(docSnap.exists());
    }, (error) => {
      console.error("Subscription status listener error:", error);
    });

    return () => unsubscribeSubscription();
  }, [currentUser, artist.uid, isOwnProfile]);

  // 4. Monitor Artist Document for real-time subscribersCount update
  useEffect(() => {
    const artistRef = doc(db, 'users', artist.uid);
    const unsubscribeArtist = onSnapshot(artistRef, (docSnap) => {
      if (docSnap.exists()) {
        setLiveSubscribersCount(docSnap.data().subscribersCount || 0);
      }
    }, (error) => {
      console.error("Artist stats listener error:", error);
    });
    return () => unsubscribeArtist();
  }, [artist.uid]);

  // 5. Fetch Recent Activity (Chapters)
  useEffect(() => {
    async function fetchRecentActivity() {
      if (artistStories.length === 0) {
        setLoadingActivity(false);
        return;
      }

      try {
        const allChaptersPromises = artistStories.map(async (story) => {
          const chaptersRef = collection(db, 'stories', story.id, 'chapters');
          const q = query(chaptersRef, orderBy('publishedAt', 'desc'), limit(10));
          const snap = await getDocs(q);
          return snap.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            storyTitle: story.title,
            storyCover: story.coverImage.imageUrl,
            storySlug: story.slug
          }));
        });

        const chaptersResults = await Promise.all(allChaptersPromises);
        const flattened = chaptersResults.flat();
        
        const sorted = flattened.sort((a: any, b: any) => {
          const dateA = a.publishedAt?.toDate?.() || new Date(a.publishedAt);
          const dateB = b.publishedAt?.toDate?.() || new Date(b.publishedAt);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 10);

        setActivities(sorted);
      } catch (e) {
        console.error("Error fetching activity:", e);
      } finally {
        setLoadingActivity(false);
      }
    }

    fetchRecentActivity();
  }, [artistStories]);

  const handleSubscribeClick = async () => {
    if (!currentUser) {
      openAuthModal('suivre vos artistes préférés');
      return;
    }

    if (isOwnProfile) return;

    const subRef = doc(db, 'users', currentUser.uid, 'subscriptions', artist.uid);
    const artistRef = doc(db, 'users', artist.uid);

    try {
      if (isSubscribed) {
        await deleteDoc(subRef);
        await updateDoc(artistRef, {
          subscribersCount: increment(-1)
        });
        toast({
          title: "Abonnement annulé",
          description: `Vous ne suivez plus ${artist.displayName}.`,
        });
      } else {
        await setDoc(subRef, {
          artistId: artist.uid,
          artistName: artist.displayName,
          artistPhoto: artist.photoURL,
          subscribedAt: serverTimestamp()
        });
        await updateDoc(artistRef, {
          subscribersCount: increment(1)
        });

        const notifRef = collection(db, 'users', artist.uid, 'notifications');
        await addDoc(notifRef, {
          type: 'new_follower',
          fromUserId: currentUser.uid,
          fromDisplayName: currentUser.displayName || 'Un voyageur',
          fromPhoto: currentUser.photoURL || '',
          message: 'a commencé à vous suivre.',
          link: `/profile/${currentUser.uid}`,
          read: false,
          createdAt: serverTimestamp()
        });

        toast({
          title: "Abonné !",
          description: `Vous suivez désormais ${artist.displayName}.`,
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'abonnement.",
        variant: "destructive"
      });
    }
  };

  const handleDonation = async () => {
    if (!currentUser) {
      openAuthModal('soutenir directement les créateurs');
      return;
    }

    const amount = parseInt(selectedAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsDonating(true);
    const senderRef = doc(db, 'users', currentUser.uid);
    const artistRef = doc(db, 'users', artist.uid);
    const notifRef = doc(collection(db, 'users', artist.uid, 'notifications'));

    try {
      await runTransaction(db, async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        if (!senderDoc.exists()) throw "Profil expéditeur introuvable.";
        
        const senderCoins = senderDoc.data().afriCoins || 0;
        if (senderCoins < amount) {
          throw "Solde d'AfriCoins insuffisant. Veuillez recharger votre compte.";
        }

        transaction.update(senderRef, { afriCoins: senderCoins - amount });
        transaction.update(artistRef, { afriCoins: increment(amount) });
        
        transaction.set(notifRef, {
          type: 'donation',
          fromUserId: currentUser.uid,
          fromDisplayName: currentUser.displayName || 'Un voyageur',
          fromPhoto: currentUser.photoURL || '',
          message: `vous a envoyé ${amount} 🪙 pour soutenir votre art.`,
          amount: amount,
          read: false,
          createdAt: serverTimestamp()
        });
      });

      toast({
        title: "Merci pour votre générosité !",
        description: `Votre don de ${amount} 🪙 à ${artist.displayName} a été envoyé avec succès.`,
      });
    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Échec du don",
        description: typeof error === 'string' ? error : "Une erreur est survenue lors de la transaction.",
        variant: "destructive"
      });
    } finally {
      setIsDonating(false);
    }
  };

  const totalViews = artistStories.reduce((acc, story) => acc + story.views, 0);
  const totalLikes = artistStories.reduce((acc, story) => acc + story.likes, 0);
  const totalWorks = artistStories.length;

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="relative py-24 bg-stone-950 overflow-hidden border-b border-white/5">
        {/* Dynamic Banner Fallback */}
        <div 
          className="absolute inset-0 z-0 transition-all duration-1000 opacity-40"
          style={{ background: `linear-gradient(135deg, ${selectedGradient.from}, ${selectedGradient.to})` }}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
            <span className="text-[12rem] md:text-[20rem] font-display font-black text-white leading-none">
              {initials}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        
        {/* Photo Blur overlay */}
        <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none">
          <Image src={artist.photoURL} alt="blur" fill className="object-cover" />
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="relative group">
              <Avatar className="h-48 w-48 border-4 border-background ring-4 ring-primary shadow-[0_0_50px_rgba(212,168,67,0.3)] transition-all duration-700 group-hover:scale-105">
                <AvatarImage src={artist.photoURL} alt={artist.displayName} />
                <AvatarFallback className="text-5xl font-black bg-primary/10 text-primary">{artist.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              {artist.isCertified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-full border-4 border-stone-950 shadow-2xl animate-bounce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">{artist.displayName}</h1>
                  {artist.role === 'artist_pro' ? (
                    <Badge className="bg-emerald-500 text-white border-none uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1 h-fit">PRO ELITE</Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500/50 text-orange-400 uppercase tracking-widest text-[9px] font-black px-3 h-fit">TALENT DRAFT</Badge>
                  )}
                </div>
                <p className="text-stone-400 text-lg md:text-xl font-light italic leading-relaxed max-w-xl">
                  "{artist.bio || "Le créateur n'a pas encore partagé son récit, mais ses œuvres parlent d'elles-mêmes."}"
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {isOwnProfile ? (
                  <Button asChild size="lg" className="rounded-full px-10 font-black h-14 bg-primary text-black gold-shimmer shadow-2xl shadow-primary/20">
                    <Link href="/settings"><Edit className="mr-2 h-5 w-5" /> Éditer mon Profil</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSubscribeClick}
                      variant={isSubscribed ? 'secondary' : 'default'}
                      size="lg"
                      className={cn("rounded-full px-10 font-black h-14 transition-all", isSubscribed ? "bg-white/5 text-white" : "bg-primary text-black gold-shimmer shadow-2xl shadow-primary/20")}
                    >
                      <Bell className={cn("mr-2 h-5 w-5", isSubscribed && "fill-current")} />
                      {isSubscribed ? 'Abonné' : 'Suivre'}
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="lg" variant="outline" className="h-14 w-14 rounded-full border-white/10 text-white hover:bg-rose-500/10 hover:text-rose-500">
                                <Heart className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2rem] p-10">
                            <DialogHeader className="text-center space-y-4">
                                <div className="mx-auto bg-rose-500/10 p-4 rounded-full w-fit">
                                  <Heart className="h-10 w-10 text-rose-500 fill-rose-500" />
                                </div>
                                <DialogTitle className="text-3xl font-display font-black gold-resplendant">Soutenir {artist.displayName}</DialogTitle>
                                <DialogDescription className="text-stone-400 italic">
                                    "Votre don permet à l'artiste de consacrer 100% de son temps à bâtir ces mondes."
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-8">
                                <RadioGroup value={selectedAmount} onValueChange={setSelectedAmount} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[5, 10, 25, 50].map(v => (
                                      <div key={v}>
                                          <RadioGroupItem value={v.toString()} id={`v${v}`} className="peer sr-only" />
                                          <Label htmlFor={`v${v}`} className="flex cursor-pointer flex-col items-center justify-center h-16 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all font-black text-xl">
                                              {v} 🪙
                                          </Label>
                                      </div>
                                    ))}
                                </RadioGroup>
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                                  <Coins className="h-5 w-5 text-primary" />
                                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest">Le montant sera déduit de votre solde AfriCoins.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                  className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer" 
                                  onClick={handleDonation}
                                  disabled={isDonating}
                                >
                                    {isDonating ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Envoi...</> : "Confirmer le don"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="lg" className="h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/5">
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 py-16 space-y-24">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Vues Totales", val: formatStat(totalViews), icon: Eye, color: "text-primary" },
            { label: "Engagement", val: formatStat(totalLikes), icon: Heart, color: "text-rose-500" },
            { label: "Fans Actifs", val: formatStat(liveSubscribersCount), icon: Star, color: "text-amber-500" },
            { label: "Productions", val: totalWorks, icon: Book, color: "text-emerald-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-white/5 bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-xl bg-white/5 transition-transform group-hover:scale-110", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-black text-white">{stat.val}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs defaultValue="portfolio" className="w-full">
          <div className="flex justify-center mb-16">
            <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/50 max-w-md w-full">
              <TabsTrigger value="portfolio" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                <LayoutGrid className="h-4 w-4" /> Portfolio
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                <History className="h-4 w-4" /> Activité
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="portfolio" className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
              {artistStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {artistStories.length === 0 && (
              <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5">
                <p className="text-stone-500 font-light italic">"Le créateur prépare ses premières planches..."</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="animate-in fade-in duration-700">
            {loadingActivity ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Consultation des annales...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {activities.map((act) => {
                  const date = act.publishedAt?.toDate ? act.publishedAt.toDate() : new Date(act.publishedAt);
                  return (
                    <div key={act.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/10 group">
                      <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] z-10" />
                      <Link href={`/read/${act.storyId}`} className="block">
                        <Card className="bg-card/50 border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all flex items-center gap-6">
                          <div className="relative h-16 w-12 rounded-lg overflow-hidden shrink-0 border border-white/5 shadow-lg">
                            <Image src={act.storyCover} alt="Cover" fill className="object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase text-primary tracking-widest">Nouvel Épisode</span>
                              <span className="text-stone-600">&bull;</span>
                              <span className="text-[9px] font-bold text-stone-500 uppercase">{formatDistanceToNow(date, { addSuffix: true, locale: fr })}</span>
                            </div>
                            <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">{act.storyTitle}</h4>
                            <p className="text-xs text-stone-400 font-light italic">"Épisode {act.chapterNumber} : {act.title}"</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-xl font-black text-white">{formatStat(act.views)}</p>
                            <p className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">Lectures</p>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 space-y-4">
                <History className="h-10 w-10 text-stone-700 mx-auto opacity-20" />
                <p className="text-stone-500 font-light italic">"Aucune activité récente dans les archives de cet artiste."</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {artist.isCertified && (
          <section className="p-12 rounded-[3.5rem] bg-stone-900 border border-emerald-500/20 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Award className="h-64 w-64 text-emerald-500" /></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="h-32 w-32 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="h-16 w-16 text-emerald-500" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Certifié NexusHub Academy</h3>
                <p className="text-stone-400 text-lg font-light leading-relaxed italic">
                  "Cet artiste a validé le cursus complet de Narration Séquentielle et Design Culturel Africain. Son travail respecte les plus hauts standards de qualité du Hub."
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 text-[9px] font-black uppercase">Storytelling</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 text-[9px] font-black uppercase">Colorisation</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 text-[9px] font-black uppercase">Lore Master</Badge>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
