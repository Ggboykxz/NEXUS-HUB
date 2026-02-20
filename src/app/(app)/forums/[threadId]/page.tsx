'use client';

import { forumThreads, artists } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, CornerUpLeft, Crown, ShieldAlert, ThumbsUp, Reply, Flag, Smile } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const thread = forumThreads.find((t) => t.id === params.threadId);

  if (!thread) {
    notFound();
  }

  // Dummy data for posts
  const posts = [
    {
      id: 'p1',
      author: thread.author,
      content: thread.isPremium 
        ? "J'ai analysé image par image les runes du chapitre 12. Si on les compare aux hiéroglyphes du début, c'est clair : le méchant n'est pas mort, il a juste été banni dans une autre dimension !"
        : "Quelqu'un a des théories folles sur ce qui va se passer dans le prochain arc ? J'ai l'impression que la prophétie du chapitre 5 est sur le point de se réaliser.",
      timestamp: 'Il y a 2 jours',
      isOp: true,
      likes: 12
    },
    {
      id: 'p2',
      author: 'Amina Diallo',
      content: "Bien vu ! On a laissé des indices visuels très subtils pour les lecteurs les plus attentifs. Regardez bien la couleur des yeux dans le dernier panneau...",
      timestamp: 'Il y a 1 jour',
      isOp: false,
      likes: 45
    },
    {
      id: 'p3',
      author: 'ComicReaderX',
      content: "Incroyable, l'auteur a répondu ! C'est génial. Je pense que le frère du méchant aide secrètement le protagoniste. Il y avait des indices dans le chapitre 12.",
      timestamp: 'Il y a 1 jour',
      isOp: false,
      likes: 8
    }
  ];

  const getBadgeForUser = (authorName: string, isOp: boolean) => {
    const artist = artists.find(a => a.name === authorName);
    if (artist) return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black">Artiste Pro</Badge>;
    if (isOp) return <Badge variant="outline" className="border-primary text-primary font-bold uppercase text-[8px]">OP</Badge>;
    return <Badge variant="outline" className="text-[8px] uppercase font-bold text-muted-foreground">Lecteur</Badge>;
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="mb-12 space-y-6">
        <Link href="/forums" className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-black uppercase tracking-widest group">
            <CornerUpLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Retour aux forums
        </Link>
        
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest text-[9px] font-bold px-3 py-1">
                  {thread.category}
              </Badge>
              {thread.isPremium && (
                  <Badge className="bg-amber-500 text-black border-none gap-1.5 uppercase tracking-widest text-[9px] font-black px-3 py-1 shadow-lg shadow-amber-500/20">
                      <Crown className="h-3 w-3 fill-current" /> Premium
                  </Badge>
              )}
              {!thread.isPremium && (
                  <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-500 uppercase tracking-widest text-[9px] font-bold px-3 py-1">
                      <ShieldAlert className="h-3 w-3" /> Anti-Spoiler
                  </Badge>
              )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display leading-tight tracking-tight">{thread.title}</h1>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => {
          const authorInfo = artists.find(a => a.name === post.author);
          
          return (
            <Card key={post.id} className={cn(
              "transition-all border-none bg-card/50 overflow-hidden",
              post.isOp ? "border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
            )}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-lg ring-2 ring-primary/10">
                      <AvatarImage src={authorInfo?.avatar.imageUrl} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{post.author.slice(0,2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link href={authorInfo ? `/artiste/${authorInfo.slug}` : "#"} className="font-black hover:text-primary transition-colors text-base">
                          {post.author}
                        </Link>
                        {getBadgeForUser(post.author, post.isOp)}
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{post.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Flag className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base font-light">
                        {post.content}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-primary/10 hover:text-primary">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-muted">
                        <Reply className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">Répondre</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <Separator className="my-16 opacity-50" />

      <div className="bg-stone-900 border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3 text-white">
            <MessageSquare className="text-primary" />
            Votre Réponse
        </h2>
        <div className="relative">
          <Textarea 
              placeholder="Échangez avec respect et passion..." 
              className="min-h-[180px] mb-6 bg-white/5 border-white/10 focus-visible:ring-primary rounded-2xl p-6 text-lg text-white"
          />
          <div className="absolute right-4 bottom-10 flex gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-400 hover:text-white"><Smile className="h-5 w-5" /></Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black flex items-center gap-2">
                {thread.isPremium 
                    ? <><Crown className="h-3 w-3 text-amber-500" /> Spoilers autorisés dans cette section.</> 
                    : <><ShieldAlert className="h-3 w-3 text-emerald-500" /> Pensez à utiliser les balises spoiler.</>}
            </p>
            <Button className="w-full sm:w-auto h-12 px-10 rounded-full font-black text-base shadow-xl shadow-primary/20 gold-shimmer bg-primary text-black">
                Poster ma réponse
            </Button>
        </div>
      </div>
    </div>
  );
}
