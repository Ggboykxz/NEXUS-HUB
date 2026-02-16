'use client';

import { forumThreads, artists } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, CornerUpLeft } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const thread = forumThreads.find((t) => t.id === params.threadId);

  if (!thread) {
    notFound();
  }

  // Dummy data for posts
  const posts = [
    {
      author: thread.author,
      content: "Quelqu'un a des théories folles sur ce qui va se passer dans le prochain arc ? J'ai l'impression que la prophétie du chapitre 5 est sur le point de se réaliser.",
      timestamp: 'Il y a 2 jours',
      isOp: true
    },
    {
      author: 'Amina Diallo',
      content: "Théorie intéressante ! On a certainement préparé le terrain pour ça. Il faudra attendre pour voir ! 😉",
      timestamp: 'Il y a 1 jour',
      isOp: false
    },
    {
      author: 'ComicReaderX',
      content: "Incroyable, l'auteur a répondu ! C'est génial. Je pense que le frère du méchant aide secrètement le protagoniste. Il y avait des indices dans le chapitre 12.",
      timestamp: 'Il y a 1 jour',
      isOp: false
    },
    {
      author: 'Jelani Adebayo',
      content: "Vous n'êtes pas loin de la vérité... mais il y a une surprise que personne n'a encore devinée.",
      timestamp: 'Il y a 20 minutes',
      isOp: false,
    }
  ];

  const getBadgeForUser = (authorName: string, isOp: boolean) => {
    const isArtist = artists.some(a => a.name === authorName);

    if (isArtist) {
        return <Badge variant="secondary">Artiste</Badge>;
    }
    if (isOp) {
        return <Badge variant="outline" className="border-primary text-primary font-semibold">OP</Badge>
    }
    return <Badge variant="outline">Lecteur</Badge>;
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link href="/forums" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 mb-2">
            <CornerUpLeft className="h-4 w-4" /> Retour aux forums
        </Link>
        <h1 className="text-4xl font-bold">{thread.title}</h1>
        <p className="text-muted-foreground">Discussion dans la catégorie <span className="text-primary">{thread.category}</span></p>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => {
          const authorInfo = artists.find(a => a.name === post.author);
          // Using a placeholder avatar for non-artist users for demonstration
          const nonArtistAvatar = (post.author === 'ComicReaderX' || post.author ==='ComicFan23') ? { imageUrl: `https://i.pravatar.cc/150?u=${post.author}`, imageHint: 'portrait' } : null;

          return (
            <Card key={index} className={post.isOp ? 'border-primary' : ''}>
              <CardHeader className="flex flex-row items-center gap-4 p-4 pb-3">
                <Avatar>
                  {(authorInfo?.avatar || nonArtistAvatar) && <AvatarImage src={authorInfo?.avatar.imageUrl || nonArtistAvatar?.imageUrl} alt={post.author} data-ai-hint={authorInfo?.avatar.imageHint || nonArtistAvatar?.imageHint} />}
                  <AvatarFallback>{post.author.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    {authorInfo ? (
                      <Link href={`/artists/${authorInfo.id}`}>
                        <p className="font-semibold hover:text-primary transition-colors">{post.author}</p>
                      </Link>
                    ) : (
                      <p className="font-semibold">{post.author}</p>
                    )}
                    {getBadgeForUser(post.author, post.isOp)}
                  </div>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 pl-[72px]">
                <p className="leading-relaxed">{post.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-4">Votre Réponse</h2>
        <Textarea placeholder="Écrivez votre réponse ici..." className="min-h-[150px] mb-4"/>
        <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Poster la réponse
        </Button>
      </div>
    </div>
  );
}
