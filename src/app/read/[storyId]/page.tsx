'use client';

import { useState, useEffect, use } from 'react';
import { stories, comicPages, comments as allComments } from '@/lib/data';
import type { Comment } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, ChevronLeft, ChevronRight, Layers, Heart, MessageSquare, Lock, CircleDollarSign, MoreHorizontal, Trash2, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Simulate logged-in user being artist '1'
const LOGGED_IN_ARTIST_ID = '1';

function CommentItem({ comment, storyAuthorId }: { comment: Comment, storyAuthorId: string }) {
    const { toast } = useToast();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);

    const isArtistAuthor = LOGGED_IN_ARTIST_ID === storyAuthorId;
    // Artists can't moderate their own comments
    const isCommentFromArtistAuthor = storyAuthorId === comment.authorId;

    const handleLike = () => {
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        setLiked(!liked);
    }
    
    const handleReply = () => {
        toast({
            title: "Fonctionnalité à venir",
            description: "La possibilité de répondre aux commentaires sera bientôt disponible.",
        });
    }

    const handleDelete = () => {
        toast({
            title: "Commentaire supprimé",
            description: "Le commentaire a été supprimé (simulation)."
        });
    };

    const handleBlock = () => {
        toast({
            title: "Lecteur bloqué",
            description: `${comment.authorName} a été bloqué et ne pourra plus commenter vos œuvres (simulation).`,
            variant: "destructive"
        });
    };

    return (
        <div className="flex gap-4">
            <Avatar className="h-10 w-10 border-2 border-gray-700">
                <AvatarImage src={comment.authorAvatar.imageUrl} alt={comment.authorName} data-ai-hint={comment.authorAvatar.imageHint} />
                <AvatarFallback>{comment.authorName.slice(0,2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-white">{comment.authorName}</p>
                        <p className="text-xs text-gray-400">{comment.timestamp}</p>
                    </div>
                    {isArtistAuthor && !isCommentFromArtistAuthor && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                                <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:bg-red-500/20 focus:text-red-500 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer le commentaire
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBlock} className="text-red-500 focus:bg-red-500/20 focus:text-red-500 cursor-pointer">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Bloquer {comment.authorName}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <p className="mt-1 text-gray-300 leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-1.5 px-2 text-gray-400 hover:text-white">
                        <Heart className={cn('h-4 w-4', liked && 'text-red-500 fill-current')} />
                        <span>{likeCount}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReply} className="flex items-center gap-1.5 px-2 text-gray-400 hover:text-white">
                        <MessageSquare className="h-4 w-4" />
                        <span>Répondre</span>
                    </Button>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-6 space-y-6 pl-6 border-l-2 border-gray-800">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} storyAuthorId={storyAuthorId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ReadPage(props: { params: { storyId: string } }) {
  const params = use(props.params);
  const story = stories.find((s) => s.id === params.storyId);
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { toast } = useToast();

  const [isUnlocked, setIsUnlocked] = useState(!story?.isPremium);
  const [userCoins, setUserCoins] = useState(150); // Simulated user balance

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!story) {
    notFound();
  }
  
  const chapterComments = allComments.filter(c => c.storyId === story!.id && c.chapter === 1);

  const handlePostComment = () => {
      toast({
          title: "Commentaire posté !",
          description: "Votre commentaire a été ajouté (simulation).",
      });
  }

  const handleUnlock = () => {
    if (userCoins >= (story.price || 0)) {
      setUserCoins(userCoins - (story.price || 0)); // Simulate deduction
      setIsUnlocked(true);
      toast({
        title: "Chapitre débloqué !",
        description: `Vous pouvez maintenant lire ce chapitre. Bonnen lecture !`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Solde insuffisant",
        description: `Vous n'avez pas assez d'AfriCoins pour débloquer ce chapitre.`,
        action: <ToastAction altText="Acheter" onClick={() => router.push('/settings?tab=africoins')}>Acheter des coins</ToastAction>,
      });
    }
  };

  const headerElement = (
    <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-gray-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="font-display text-lg truncate">{story.title}</h1>
            <p className="text-sm text-muted-foreground">Chapitre 1</p>
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>
    </header>
  );

  if (!isUnlocked) {
    return (
      <div className="relative">
        {headerElement}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-black text-white px-4">
          <Card className="bg-gray-900/80 border-gray-700 text-center max-w-md p-8">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4 border-2 border-primary/20">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl text-white">Chapitre Premium</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Ce chapitre est un contenu exclusif. Débloquez-le pour continuer votre lecture.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full text-lg" onClick={handleUnlock}>
                <CircleDollarSign className="mr-2 h-6 w-6"/>
                Débloquer pour {story.price} coins
              </Button>
            </CardContent>
            <CardFooter className="flex-col gap-2 pt-6">
              <p className="text-sm text-gray-500">Votre solde : {userCoins} coins</p>
              <Button variant="link" onClick={() => router.push('/settings?tab=africoins')}>
                Acheter plus de coins
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {headerElement}
      <Tabs defaultValue="scroll" className="w-full">
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <TabsList>
            <TabsTrigger value="scroll" className="gap-2">
              <Layers className="h-4 w-4" /> Webtoon
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Book className="h-4 w-4" /> BD
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="scroll">
          <div className="flex flex-col items-center pt-4 bg-black">
            {comicPages.map((page) => (
              <Image
                key={page.id}
                src={page.imageUrl}
                alt={page.description}
                width={800}
                height={1200}
                className="max-w-full h-auto"
                data-ai-hint={page.imageHint}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="pages">
          <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-4 bg-black">
            <Carousel setApi={setApi} className="w-full max-w-2xl">
              <CarouselContent>
                {comicPages.map((page) => (
                  <CarouselItem key={page.id}>
                    <Image
                      src={page.imageUrl}
                      alt={page.description}
                      width={800}
                      height={1200}
                      className="max-w-full h-auto mx-auto object-contain max-h-[calc(100vh-8rem)]"
                      data-ai-hint={page.imageHint}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-white hover:text-white bg-gray-800/50 hover:bg-gray-700/80 border-gray-700" />
              <CarouselNext className="text-white hover:text-white bg-gray-800/50 hover:bg-gray-700/80 border-gray-700" />
            </Carousel>
          </div>
           <div className="py-2 text-center text-sm text-muted-foreground fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
            Page {current} sur {count}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="container mx-auto max-w-3xl px-4 py-12 text-foreground">
        <Separator className="my-8 bg-gray-700" />
        <h2 className="text-3xl font-bold font-display mb-8 text-white">Commentaires (Chapitre 1)</h2>
        
        <div className="flex gap-4 mb-12">
            <Avatar className="border-2 border-primary">
                <AvatarImage src="https://images.unsplash.com/photo-1557053910-d9eadeed1c58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc3MTIyMDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080" alt="Léa Dubois" />
                <AvatarFallback>LD</AvatarFallback>
            </Avatar>
            <div className="w-full">
                <Textarea placeholder="Écrivez votre commentaire..." className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-primary focus:border-primary"/>
                <Button onClick={handlePostComment} className="mt-2">Poster le commentaire</Button>
            </div>
        </div>

        <div className="space-y-8">
          {chapterComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} storyAuthorId={story.artistId} />
          ))}
        </div>
      </div>
    </div>
  );
}
