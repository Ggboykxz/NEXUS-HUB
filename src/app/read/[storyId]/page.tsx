'use client';

import { useState, useEffect, use } from 'react';
import { stories, comicPages, comments as allComments } from '@/lib/data';
import type { Comment } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, ChevronLeft, ChevronRight, Layers, Heart, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function CommentItem({ comment }: { comment: Comment }) {
    const { toast } = useToast();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);

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

    return (
        <div className="flex gap-4">
            <Avatar className="h-10 w-10 border-2 border-gray-700">
                <AvatarImage src={comment.authorAvatar.imageUrl} alt={comment.authorName} data-ai-hint={comment.authorAvatar.imageHint} />
                <AvatarFallback>{comment.authorName.slice(0,2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-white">{comment.authorName}</p>
                    <p className="text-xs text-gray-400">{comment.timestamp}</p>
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
                            <CommentItem key={reply.id} comment={reply} />
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

  return (
    <div className="relative">
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

      <Tabs defaultValue="scroll" className="w-full">
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <TabsList>
            <TabsTrigger value="scroll" className="gap-2">
              <Layers className="h-4 w-4" /> Scroll
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Book className="h-4 w-4" /> Pages
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
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
}
