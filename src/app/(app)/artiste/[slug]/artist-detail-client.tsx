'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Globe, Book, Twitter, Instagram, Facebook, Bell, Heart, Award, Eye, Star, PenSquare, Edit, CheckCircle2, ShieldCheck } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Story, UserProfile } from '@/lib/types';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsOwnProfile(user?.uid === artist.uid);
    });
    return () => unsubscribe();
  }, [artist.uid]);

  const handleSubscribeClick = () => {
    if (!currentUser) {
      openAuthModal('suivre vos artistes préférés');
      return;
    }
    setIsSubscribed(!isSubscribed);
    toast({
      title: isSubscribed ? "Abonnement annulé" : "Abonné !",
      description: `Vous ${isSubscribed ? "ne recevrez plus" : "recevrez désormais"} les notifications pour ${artist.displayName}.`,
    });
  };

  const handleDonation = () => {
    if (!currentUser) {
      openAuthModal('soutenir directement les créateurs');
      return;
    }
    toast({
      title: "Merci pour votre soutien !",
      description: `Votre don à ${artist.displayName} a bien été enregistré (simulation).`,
    });
  }

  const totalViews = artistStories.reduce((acc, story) => acc + story.views, 0);
  const totalLikes = artistStories.reduce((acc, story) => acc + story.likes, 0);
  const totalWorks = artistStories.length;

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="md:flex gap-8">
        <div className="md:w-1/3 text-center md:text-left">
          <div className="relative inline-block md:block">
            <Avatar className="h-48 w-48 border-4 border-background ring-4 ring-primary mx-auto md:mx-0 shadow-2xl">
              <AvatarImage src={artist.photoURL} alt={artist.displayName} />
              <AvatarFallback>{artist.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            {artist.isCertified && (
              <Badge className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2 bg-emerald-500 text-white border-2 border-background p-1.5 shadow-xl animate-bounce">
                <CheckCircle2 className="h-5 w-5" />
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col items-center md:items-start mt-6 gap-y-4">
            <div className="flex items-center gap-x-3">
              <h1 className="text-4xl font-bold font-display">{artist.displayName}</h1>
              {artist.role === 'artist_pro' ? (
                <Badge variant="secondary" className="flex items-center gap-1.5 text-sm h-fit py-1 px-2.5 bg-emerald-500/10 text-emerald-500 border-none">
                    <Award className="h-4 w-4" />
                    Pro
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1.5 text-sm h-fit py-1 px-2.5 border-orange-500/50 text-orange-400">
                    <PenSquare className="h-4 w-4" />
                    Draft
                </Badge>
              )}
            </div>

            {artist.isCertified && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" /> Diplômé NexusHub
              </div>
            )}

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <Button asChild size="sm" className="rounded-full px-6">
                  <Link href="/settings">
                    <Edit className="mr-2 h-4 w-4" />
                    Éditer le profil
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSubscribeClick}
                    variant={isSubscribed ? 'secondary' : 'default'}
                    size="sm"
                    className="rounded-full px-6"
                  >
                    <Bell className={cn("mr-2 h-4 w-4", isSubscribed && "fill-current")} />
                    {isSubscribed ? 'Abonné' : 'S\'abonner'}
                  </Button>
                  <Dialog onOpenChange={(open) => {
                    if (open && !auth.currentUser) {
                      openAuthModal('faire un don aux artistes');
                    }
                  }}>
                      <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="rounded-full px-6">
                              <Heart className="mr-2 h-4 w-4 text-destructive fill-destructive" />
                              Faire un don
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                              <DialogTitle>Soutenir {artist.displayName}</DialogTitle>
                              <DialogDescription>
                                  Votre don aide directement l'artiste à continuer de créer des œuvres incroyables.
                              </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                              <RadioGroup defaultValue="5" className="grid grid-cols-3 gap-4">
                                  <div>
                                      <RadioGroupItem value="5" id="r1" className="peer sr-only" />
                                      <Label htmlFor="r1" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                          5€
                                      </Label>
                                  </div>
                                  <div>
                                      <RadioGroupItem value="10" id="r2" className="peer sr-only" />
                                      <Label htmlFor="r2" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                          10€
                                      </Label>
                                  </div>
                                  <div>
                                      <RadioGroupItem value="20" id="r3" className="peer sr-only" />
                                      <Label htmlFor="r3" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                          20€
                                      </Label>
                                  </div>
                              </RadioGroup>
                              <div className="relative mt-2">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                                  <Input id="custom-amount" placeholder="Montant personnalisé" className="pl-7" type="number" />
                              </div>
                          </div>
                          <DialogFooter>
                              <DialogClose asChild>
                                <Button type="submit" className="w-full" onClick={handleDonation}>
                                    Faire un don
                                </Button>
                              </DialogClose>
                          </DialogFooter>
                      </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 justify-center md:justify-start flex-wrap mt-6">
            {artist.links?.twitter && (
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <a href={artist.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}
            {artist.links?.instagram && (
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <a href={artist.links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="md:w-2/3 mt-8 md:mt-0">
          <h2 className="text-2xl font-bold font-display mb-4">Biographie</h2>
          <p className="text-lg text-foreground/80 leading-relaxed italic font-light">"{artist.bio || "Explorateur de récits et bâtisseur d'univers."}"</p>
          
          {artist.isCertified && (
            <div className="mt-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4" /> Distinction Académique
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cet artiste a suivi le programme complet de mentorat NexusHub, validant les modules de narration séquentielle et de character design africain.
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-12 opacity-50" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Vues Totales", val: formatStat(totalViews), icon: Eye },
          { label: "Engagement", val: formatStat(totalLikes), icon: Heart },
          { label: "Fans", val: formatStat(artist.subscribersCount), icon: Star },
          { label: "Production", val: totalWorks, icon: Book },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-muted/30 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold font-display mb-10 flex items-center gap-3">
          <LayoutGrid className="h-8 w-8 text-primary" /> Portfolio
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {artistStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
