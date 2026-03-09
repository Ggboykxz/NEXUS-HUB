'use client';

import type { UserProfile, Story } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';


export default function ArtistDetailClient({ artist, artistStories }: { artist: UserProfile; artistStories: Story[] }) {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12 flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20 shadow-lg">
          <AvatarImage src={artist.photoURL} alt={artist.displayName} />
          <AvatarFallback className="text-4xl">{artist.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold font-display tracking-tighter text-white">{artist.displayName}</h1>
        <p className="text-stone-400 mt-2">@{artist.slug}</p>
        {/* You can add more profile info here if needed, e.g., bio */}
      </header>

      <main>
        <Card className="bg-stone-900/50 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-primary" />
              Créations Publiées
            </CardTitle>
            <CardDescription>{artistStories.length} œuvres disponibles.</CardDescription>
          </CardHeader>
          <CardContent>
            {artistStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistStories.map(story => (
                  <Link key={story.id} href={`/story/${story.slug}`} passHref>
                    <Card className="h-full flex flex-col group overflow-hidden rounded-xl border-white/5 hover:border-primary/50 transition-all duration-300">
                      <div className="relative w-full aspect-[2/3]">
                         <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                         <h3 className="font-bold text-white truncate">{story.title}</h3>
                         <p className="text-xs text-stone-400 capitalize">{story.genre}</p>
                         <Button variant="secondary" size="sm" className="mt-4 w-full">Lire</Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-stone-400">Cet artiste n'a pas encore publié d'œuvre.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
