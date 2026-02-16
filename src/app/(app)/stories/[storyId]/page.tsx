'use client';

import { useState, use } from 'react';
import { stories, artists, comicPages } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function StoryDetailPage(props: { params: { storyId: string } }) {
  const params = use(props.params);
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const story = stories.find((s) => s.id === params.storyId);

  if (!story) {
    notFound();
  }
  
  const artist = artists.find((a) => a.id === story.artistId);
  const excerptPage = comicPages[0];

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris !",
      description: `L'oeuvre "${story.title}" a été ${isFavorite ? "retirée de" : "ajoutée à"} votre bibliothèque.`,
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg">
             <Image
                src={story.coverImage.imageUrl}
                alt={`Couverture de ${story.title}`}
                fill
                className="object-cover"
                data-ai-hint={story.coverImage.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
              />
          </div>
        </div>
        <div className="md:col-span-2 flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit mb-4">{story.genre}</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4">{story.title}</h1>
            
            {artist && (
                 <Link href={`/artists/${artist.id}`} className="flex items-center gap-3 group w-fit mb-6">
                    <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary">
                        <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-lg font-semibold group-hover:text-primary transition-colors">{artist.name}</p>
                        <p className="text-sm text-muted-foreground">Artiste</p>
                    </div>
                </Link>
            )}

            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                {story.description}
            </p>

            <div className="flex items-center gap-6 text-muted-foreground mb-8">
                 <div className="flex items-center gap-2" title="Vues">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{(story.views / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex items-center gap-2" title="Likes">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{(story.likes / 1000).toFixed(0)}k</span>
                </div>
                 <div className="flex items-center gap-2" title="Abonnés">
                  <Star className="w-5 h-5" />
                  <span className="font-medium">{(story.subscriptions / 1000).toFixed(0)}k</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button asChild size="lg">
                    <Link href={`/read/${story.id}`}>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Commencer la lecture
                    </Link>
                </Button>
                <Button size="lg" variant="outline" onClick={handleFavoriteClick}>
                    <Heart className={cn("mr-2 h-5 w-5", isFavorite && "fill-rose-500 text-rose-500")} />
                    {isFavorite ? "Dans les favoris" : "Ajouter aux favoris"}
                </Button>
            </div>
        </div>
      </div>

      <Separator className="my-16" />

      <div>
        <h2 className="text-3xl font-bold font-display mb-8 text-center">Extrait de l'œuvre</h2>
         <div className="max-w-3xl mx-auto rounded-lg overflow-hidden shadow-xl border">
            {excerptPage && (
                <Image
                    src={excerptPage.imageUrl}
                    alt={excerptPage.description}
                    width={800}
                    height={1200}
                    className="w-full h-auto"
                    data-ai-hint={excerptPage.imageHint}
                />
            )}
        </div>
      </div>
    </div>
  );
}
