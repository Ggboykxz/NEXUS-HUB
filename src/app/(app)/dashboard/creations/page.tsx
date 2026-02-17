'use client';

import Link from 'next/link';
import Image from 'next/image';
import { stories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Brush, TrendingUp } from 'lucide-react';

export default function CreationsDashboardPage() {
  // Simulate being logged in as artist '1'
  const artistId = '1';
  const myStories = stories.filter(story => story.artistId === artistId);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Brush className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Mon Atelier</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gérez vos œuvres, suivez leurs performances et publiez de nouveaux chapitres.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard/stats">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Statistiques
                </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvelle œuvre
              </Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myStories.map(story => (
          <Link key={story.id} href={`/dashboard/creations/${story.id}`} className="block h-full">
            <Card className="flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex-row items-start gap-4">
                <Image
                  src={story.coverImage.imageUrl}
                  alt={story.title}
                  width={80}
                  height={120}
                  className="rounded-md object-cover aspect-[2/3]"
                  data-ai-hint={story.coverImage.imageHint}
                />
                <div className="flex-1">
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription>{story.chapters.length} {story.chapters.length > 1 ? 'chapitres' : 'chapitre'}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">{story.description}</p>
              </CardContent>
              <CardFooter>
                <div className="w-full text-center text-primary font-semibold py-2">Gérer l'œuvre</div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
