'use client';

import { useState, use, useEffect } from 'react';
import { artists, stories as allStories } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Globe, Book, Twitter, Instagram, Facebook, Bell, Heart, DollarSign, Award, Eye, Star, PenSquare, Edit } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ArtistProfilePage(props: { params: { artistId: string } }) {
  const params = use(props.params);
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsOwnProfile(user?.uid === params.artistId);
    });
    return () => unsubscribe();
  }, [params.artistId]);

  const artist = artists.find((a) => a.id === params.artistId);

  if (!artist) {
    notFound();
  }

  const handleSubscribeClick = () => {
    setIsSubscribed(!isSubscribed);
    toast({
      title: isSubscribed ? "Abonnement annulé" : "Abonné !",
      description: `Vous ${isSubscribed ? "ne recevrez plus" : "recevrez désormais"} les notifications pour ${artist.name}.`,
    });
  };

  const handleDonation = () => {
    toast({
      title: "Merci pour votre soutien !",
      description: `Votre don à ${artist.name} a bien été enregistré (simulation).`,
    });
  }

  const artistStories = allStories.filter(story => story.artistId === artist.id);

  const totalViews = artistStories.reduce((acc, story) => acc + story.views, 0);
  const totalLikes = artistStories.reduce((acc, story) => acc + story.likes, 0);
  const totalSubscriptions = artistStories.reduce((acc, story) => acc + story.subscriptions, 0);
  const totalWorks = artistStories.length;

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(0)}k`;
    }
    return num.toString();
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="md:flex gap-8">
        <div className="md:w-1/3 text-center md:text-left">
          <Avatar className="h-48 w-48 border-4 border-background ring-4 ring-primary mx-auto md:mx-0">
            <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-center md:items-start mt-4 gap-y-4">
            <div className="flex items-center gap-x-3">
              <h1 className="text-4xl font-bold font-display">{artist.name}</h1>
              {artist.isMentor ? (
                <Badge variant="secondary" className="flex items-center gap-1.5 whitespace-nowrap text-sm h-fit py-1 px-2.5">
                    <Award className="h-4 w-4" />
                    Pro
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1.5 whitespace-nowrap text-sm h-fit py-1 px-2.5">
                    <PenSquare className="h-4 w-4" />
                    Draft
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <Button asChild size="sm">
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
                  >
                    <Bell className={cn("mr-2 h-4 w-4", isSubscribed && "fill-current")} />
                    {isSubscribed ? 'Abonné' : 'S\'abonner'}
                  </Button>
                  <Dialog>
                      <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                              <Heart className="mr-2 h-4 w-4 text-destructive fill-destructive" />
                              Faire un don
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                              <DialogTitle>Soutenir {artist.name}</DialogTitle>
                              <DialogDescription>
                                  Votre don aide directement l'artiste à continuer de créer des œuvres incroyables. Choisissez un montant ou entrez une valeur personnalisée.
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
                              <RadioGroup defaultValue="one-time" className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="one-time" id="one-time" />
                                  <Label htmlFor="one-time" className="font-normal cursor-pointer">Don ponctuel</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="recurring" id="recurring" />
                                  <Label htmlFor="recurring" className="font-normal cursor-pointer">Mensuel</Label>
                                </div>
                              </RadioGroup>
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
            {artist.links.personal && (
              <Button variant="outline" asChild>
                <a href={artist.links.personal} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Site Perso
                </a>
              </Button>
            )}
            {artist.links.amazon && (
                <Button variant="outline" asChild>
                <a href={artist.links.amazon} target="_blank" rel="noopener noreferrer">
                  <Book className="mr-2 h-4 w-4" /> Amazon
                </a>
              </Button>
            )}
            {artist.links.twitter && (
              <Button variant="outline" size="icon" asChild>
                <a href={artist.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}
            {artist.links.instagram && (
              <Button variant="outline" size="icon" asChild>
                <a href={artist.links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {artist.links.facebook && (
              <Button variant="outline" size="icon" asChild>
                <a href={artist.links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="md:w-2/3 mt-8 md:mt-0">
          <h2 className="text-2xl font-bold font-display mb-2">Biographie</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">{artist.bio}</p>
        </div>
      </div>

      <Separator className="my-12" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStat(totalViews)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes Totaux</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStat(totalLikes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStat(totalSubscriptions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Œuvres</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold font-display mb-6">Portfolio</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artistStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}