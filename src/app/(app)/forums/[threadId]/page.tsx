
'use client';

import { forumThreads, artists } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, CornerUpLeft, Crown, ShieldAlert } from 'lucide-react';
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
      content: thread.isPremium 
        ? "J'ai analysé image par image les runes du chapitre 12. Si on les compare aux hiéroglyphes du début, c'est clair : le méchant n'est pas mort, il a juste été banni dans une autre dimension !"
        : "Quelqu'un a des théories folles sur ce qui va se passer dans le prochain arc ? J'ai l'impression que la prophétie du chapitre 5 est sur le point de se réaliser.",
      timestamp: 'Il y a 2 jours',
      isOp: true
    },
    {
      author: 'Amina Diallo',
      content: thread.isPremium 
        ? "Bien vu ! On a laissé des indices visuels très subtils pour les lecteurs les plus attentifs. Regardez bien la couleur des yeux dans le dernier panneau..."
        : "Théorie intéressante ! On a certainement préparé le terrain pour ça. Il faudra attendre pour voir ! 😉",
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
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none">Artiste</Badge>;
    }
    if (isOp) {
        return <Badge variant="outline" className="border-primary text-primary font-semibold">OP</Badge>
    }
    return <Badge variant="outline">Lecteur</Badge>;
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12">
        <Link href="/forums" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 mb-6 font-bold uppercase tracking-widest">
            <CornerUpLeft className="h-4 w-4" /> Retour aux forums
        </Link>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none uppercase tracking-widest text-[10px] font-bold px-3">
                {thread.category}
            </Badge>
            {thread.isPremium && (
                <Badge className="bg-primary text-primary-foreground border-none gap-1.5 uppercase tracking-widest text-[10px] font-black px-3 shadow-lg shadow-primary/20">
                    <Crown className="h-3 w-3 fill-current" /> Forum Premium
                </Badge>
            )}
            {!thread.isPremium && (
                <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-500 uppercase tracking-widest text-[10px] font-bold">
                    <ShieldAlert className="h-3 w-3" /> Anti-Spoiler
                </Badge>
            )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">{thread.title}</h1>
      </div>

      <div className="space-y-8">
        {posts.map((post, index) => {
          const authorInfo = artists.find(a => a.name === post.author);
          const nonArtistAvatar = (post.author === 'ComicReaderX' || post.author ==='CyberPunkAfro' || post.author === 'MythLover') 
            ? { imageUrl: `https://i.pravatar.cc/150?u=${post.author}`, imageHint: 'portrait' } 
            : null;

          return (
            <Card key={index} className={post.isOp ? 'border-primary shadow-xl shadow-primary/5 bg-primary/[0.01]' : 'border-none bg-muted/20'}>
              <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  {(authorInfo?.avatar || nonArtistAvatar) && (
                    <AvatarImage src={authorInfo?.avatar.imageUrl || nonArtistAvatar?.imageUrl} alt={post.author} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{post.author.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {authorInfo ? (
                      <Link href={`/artiste/${authorInfo.slug}`}>
                        <p className="font-bold hover:text-primary transition-colors text-lg">{post.author}</p>
                      </Link>
                    ) : (
                      <p className="font-bold text-lg">{post.author}</p>
                    )}
                    {getBadgeForUser(post.author, post.isOp)}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{post.timestamp}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2 pl-[72px]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base">
                    {post.content}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Separator className="my-16" />

      <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
            <MessageSquare className="text-primary" />
            Vôtre Réponse
        </h2>
        <Textarea 
            placeholder="Échangez avec respect et passion..." 
            className="min-h-[180px] mb-6 bg-muted/30 border-none focus-visible:ring-primary rounded-2xl p-6 text-lg"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground italic">
                {thread.isPremium 
                    ? "⚠️ Spoilers autorisés dans cette section." 
                    : "🔒 Pensez à utiliser les balises spoiler si nécessaire."}
            </p>
            <Button className="w-full sm:w-auto h-12 px-8 rounded-full font-bold shadow-xl shadow-primary/20">
                Poster ma réponse
            </Button>
        </div>
      </div>
    </div>
  );
}
