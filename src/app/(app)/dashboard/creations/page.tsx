'use client';

import Link from 'next/link';
import Image from 'next/image';
import { stories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Brush } from 'lucide-react';

export default function CreationsDashboardPage() {
  // Simulate being logged in as artist '1'
  const artistId = '1';
  const myStories = stories.filter(story => story.artistId === artistId);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Brush className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Mon Atelier</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gérez vos œuvres, suivez leurs performances et publiez de nouveaux chapitres.
          </p>
        </div>
        <Button asChild>
          <Link href="/submit">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle œuvre
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myStories.map(story => (
          <Card key={story.id} className="flex flex-col">
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
              <Button asChild className="w-full">
                <Link href={`/dashboard/creations/${story.id}`}>Gérer l'œuvre</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
