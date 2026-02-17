'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { stories, comicPages, comments as allComments } from '@/lib/data';
import type { Comment } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Book,
  Layers,
  Heart,
  MessageSquare,
  Lock,
  CircleDollarSign,
  MoreHorizontal,
  Trash2,
  Ban,
  X,
  Share2,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";


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
            <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src={comment.authorAvatar.imageUrl} alt={comment.authorName} data-ai-hint={comment.authorAvatar.imageHint} />
                <AvatarFallback>{comment.authorName.slice(0,2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-foreground">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    {isArtistAuthor && !isCommentFromArtistAuthor && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                <p className="mt-1 text-foreground/80 leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-1.5 px-2 text-muted-foreground hover:text-foreground">
                        <Heart className={cn('h-4 w-4', liked && 'text-red-500 fill-current')} />
                        <span>{likeCount}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReply} className="flex items-center gap-1.5 px-2 text-muted-foreground hover:text-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Répondre</span>
                    </Button>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-6 space-y-6 pl-6 border-l-2 border-border/50">
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
  const { toast } = useToast();
  
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  
  const [viewMode, setViewMode] = useState('scroll');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!story?.isPremium);
  const [userCoins, setUserCoins] = useState(150);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
      api?.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (!story) {
    notFound();
  }
  
  const chapterComments = allComments.filter(c => c.storyId === story!.id && c.chapter === 1);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris !" });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié dans le presse-papiers" });
  };

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
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-foreground hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="font-display text-lg truncate text-foreground">{story.title}</h1>
            <p className="text-sm text-muted-foreground">Chapitre 1</p>
          </div>
          <div className="w-16 shrink-0 md:w-24"></div> {/* Spacer */}
        </div>
    </header>
  );

  if (!isUnlocked) {
    return (
      <div className="relative">
        {headerElement}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-background text-foreground px-4">
          <Card className="bg-card border-border text-center max-w-md p-8">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4 border-2 border-primary/20">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl text-card-foreground">Chapitre Premium</CardTitle>
              <CardDescription className="text-base">
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
              <p className="text-sm text-muted-foreground">Votre solde : {userCoins} coins</p>
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
    <Sheet>
      <div className="flex flex-col h-screen bg-black text-foreground">
        {/* HEADER */}
        <header className="flex-shrink-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-2 sm:px-4 h-14 flex items-center">
            <div className="flex-1 flex justify-start">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-foreground hover:bg-accent hover:text-accent-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-grow text-center overflow-hidden px-2">
              <h1 className="font-display text-base sm:text-lg truncate text-foreground" title={story.title}>{story.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Chapitre 1</p>
            </div>
            <div className="flex-1 flex justify-end items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleFavoriteClick}>
                <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 relative overflow-hidden">
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full h-full">
            <TabsContent value="scroll" className="m-0 h-full">
              <ScrollArea className="h-full">
                <div className="flex flex-col items-center">
                  {comicPages.map((page, index) => (
                    <Image
                      key={page.id}
                      src={page.imageUrl}
                      alt={page.description}
                      width={800}
                      height={1200}
                      className="max-w-full h-auto cursor-zoom-in"
                      data-ai-hint={page.imageHint}
                      priority={index < 2}
                      sizes="(max-width: 800px) 100vw, 800px"
                      onClick={() => setZoomedImage(page.imageUrl)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="pages" className="m-0 h-full flex items-center justify-center">
                <Carousel setApi={setApi} className="w-full h-full">
                  <CarouselContent className="h-full">
                    {comicPages.map((page) => (
                      <CarouselItem key={page.id} className="h-full">
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <Image
                            src={page.imageUrl}
                            alt={page.description}
                            width={800}
                            height={1200}
                            className="max-w-full max-h-full object-contain cursor-zoom-in"
                            data-ai-hint={page.imageHint}
                            priority
                            sizes="(max-width: 768px) 100vw, 80vw"
                            onClick={() => setZoomedImage(page.imageUrl)}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
            </TabsContent>
          
            {/* Floating View Switcher */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10">
              <TabsList>
                <TabsTrigger value="scroll" className="gap-2"><Layers className="h-4 w-4" /> Scroll</TabsTrigger>
                <TabsTrigger value="pages" className="gap-2"><Book className="h-4 w-4" /> Pages</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </main>

        {/* FOOTER */}
        {viewMode === 'pages' && (
            <footer className="flex-shrink-0 z-20 bg-background text-foreground border-t">
                <div className="flex items-center justify-between h-12 px-4">
                    <Button variant="ghost" onClick={() => api?.scrollPrev()} disabled={!canScrollPrev}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Précédent
                    </Button>
                    <p className="text-sm text-muted-foreground tabular-nums">{current} / {count}</p>
                    <Button variant="ghost" onClick={() => api?.scrollNext()} disabled={!canScrollNext}>
                        Suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </footer>
        )}
        
        {/* COMMENT BUBBLE TRIGGER */}
        <SheetTrigger asChild>
            <Button
                variant="default"
                size="lg"
                className="fixed bottom-6 right-6 z-30 rounded-full shadow-lg h-16 w-16"
                aria-label="Ouvrir les commentaires"
            >
                <MessageSquare className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {chapterComments.length}
                </span>
            </Button>
        </SheetTrigger>

        {/* COMMENTS SHEET */}
        <SheetContent side="right" className="w-full sm:max-w-md lg:max-w-lg flex flex-col p-0 bg-background text-foreground md:bg-transparent">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Commentaires (Chapitre 1)</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6 space-y-8">
              {chapterComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} storyAuthorId={story.artistId} />
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 bg-background border-t">
            <div className="flex gap-4">
              <Avatar className="border-2 border-primary">
                <AvatarImage src="https://images.unsplash.com/photo-1557053910-d9eadeed1c58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc3MTIyMDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080" alt="Léa Dubois" />
                <AvatarFallback>LD</AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Textarea placeholder="Écrivez votre commentaire..." />
                <Button onClick={handlePostComment} className="mt-2">Poster</Button>
              </div>
            </div>
          </div>
        </SheetContent>

        {/* ZOOMED IMAGE */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-in fade-in-0"
            onClick={() => setZoomedImage(null)}
          >
            <div className="w-full h-full overflow-auto text-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={zoomedImage}
                alt="Image agrandie"
                width={1600}
                height={2400}
                className="max-w-none w-auto h-auto inline-block p-4"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:text-white bg-black/20 hover:bg-black/50"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
