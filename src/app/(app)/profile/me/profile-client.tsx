'use client';

import type { UserProfile, Story } from '@/lib/types';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Edit, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

function CreationsList({ creations }: { creations: Story[] }) {
    if (creations.length === 0) {
        return (
             <div className="text-center py-12">
                <p className="text-stone-400 mb-4">Vous n'avez pas encore de créations.</p>
                <Button asChild>
                    <Link href="/submit">Lancer un nouveau projet</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map(story => (
                <Card key={story.id} className="h-full flex flex-col group overflow-hidden rounded-xl border-white/5 bg-stone-900/80 hover:border-primary/50 transition-all duration-300">
                    <div className="relative w-full aspect-[2/3]">
                        <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
                         <div className="absolute top-2 right-2">
                           <Badge variant={story.isPublished ? 'secondary' : 'destructive'}>{story.isPublished ? 'Publié' : 'Brouillon'}</Badge>
                         </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-white truncate">{story.title}</h3>
                        <p className="text-xs text-stone-400 capitalize">{story.genre}</p>
                        <div className="mt-4 flex gap-2">
                           <Button variant="secondary" size="sm" className="flex-1" asChild>
                               <Link href={`/story/${story.slug}`}>Voir</Link>
                           </Button>
                           <Button variant="outline" size="sm" className="flex-1" asChild>
                                <Link href={`/dashboard/creations/${story.slug}`}>Gérer</Link>
                           </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default function ProfileClient({ user, creations }: { user: UserProfile; creations: Story[] }) {
  const publishedCreations = creations.filter(c => c.isPublished);
  const draftCreations = creations.filter(c => !c.isPublished);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-center gap-6">
        <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
          <AvatarImage src={user.photoURL} alt={user.displayName} />
          <AvatarFallback className="text-4xl">{user.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h1 className="text-4xl font-bold font-display tracking-tighter text-white">{user.displayName}</h1>
          <p className="text-stone-400 mt-1">@{user.slug}</p>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" asChild>
                <Link href={`/artiste/${user.slug}`}><BookOpen className="h-4 w-4 mr-2"/> Voir le profil public</Link>
            </Button>
            <Button disabled> 
                <Settings className="h-4 w-4 mr-2"/> Modifier le profil
            </Button>
        </div>
      </header>

      <main>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="all">Toutes ({creations.length})</TabsTrigger>
            <TabsTrigger value="published">Publiées ({publishedCreations.length})</TabsTrigger>
            <TabsTrigger value="drafts">Brouillons ({draftCreations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <CreationsList creations={creations} />
          </TabsContent>
          <TabsContent value="published">
            <CreationsList creations={publishedCreations} />
          </TabsContent>
          <TabsContent value="drafts">
            <CreationsList creations={draftCreations} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
