'use client';

import { useState, useEffect, use } from 'react';
import { forumThreads, artists } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  CornerUpLeft, 
  Crown, 
  ShieldAlert, 
  ThumbsUp, 
  Reply, 
  Flag, 
  Smile, 
  Share2, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Star,
  Info,
  ChevronDown,
  Bookmark,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const mockReplies = [
  {
    id: 'r1',
    author: 'Amina Diallo',
    authorId: '2',
    authorBadge: 'Artiste Pro',
    authorRole: 'SAGE',
    karma: 4500,
    avatar: 'https://images.unsplash.com/photo-1602785139708-1442c75f6b28',
    content: "Bien vu ! On a laissé des indices visuels très subtils pour les lecteurs les plus attentifs. Regardez bien la couleur des yeux dans le dernier panneau du Chapitre 12... c'est une technique de world building qu'on affectionne beaucoup sur NexusHub.",
    timestamp: 'Il y a 1 jour',
    likes: 45,
    isArtist: true,
    replies: [
      {
        id: 'r1-1',
        author: 'ComicReaderX',
        authorId: 'reader-2',
        authorBadge: 'Super Fan',
        authorRole: 'GARDIEN',
        karma: 1200,
        content: "Incroyable, l'artiste a répondu ! 😱 Je savais que ce détail était important. Ça change complètement ma vision de la prophétie.",
        timestamp: 'Il y a 12h',
        likes: 12,
      }
    ]
  }
];

export default function ThreadDetailPage(props: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const thread = forumThreads.find((t) => t.id === threadId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  if (!thread) notFound();

  const authorInfo = artists.find(a => a.name === thread.author);

  const handlePostReply = () => {
    if (!auth.currentUser) {
      openAuthModal('poster votre réponse');
      return;
    }
    toast({ title: "Réponse publiée !", description: "Votre message est en ligne." });
    setReplyText('');
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <section className="relative py-16 px-6 overflow-hidden border-b border-primary/10 bg-stone-950">
        <div className="container relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={cn(
              "uppercase tracking-widest text-[9px] font-black px-3 py-1 border-none shadow-lg",
              thread.isPremium ? "bg-amber-500 text-black" : "bg-emerald-500 text-white"
            )}>
              {thread.isPremium ? <><Crown className="h-3 w-3 mr-1 inline fill-current" /> Premium</> : <><ShieldAlert className="h-3 w-3 mr-1 inline" /> Public</>}
            </Badge>
            <Badge variant="secondary" className="bg-white/5 text-stone-300 uppercase tracking-widest text-[9px] font-bold px-3 py-1">{thread.category}</Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight gold-resplendant">{thread.title}</h1>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={authorInfo?.avatar.imageUrl} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">{thread.author.slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-bold text-sm">Posté par <span className="text-primary">{thread.author}</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Il y a 2h</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-3.5">KARMA: 2.4k</Badge>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex ml-auto items-center gap-4 text-stone-400 text-xs font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> {thread.views} vues</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-primary" /> {thread.replies} réponses</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md py-3 shadow-sm">
        <div className="container max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="rounded-full gap-2 text-xs font-bold text-muted-foreground hover:text-primary">
            <Link href="/forums"><CornerUpLeft className="h-4 w-4" /> Retour au Forum</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsFollowing(!isFollowing)} variant={isFollowing ? 'default' : 'outline'} size="sm" className="rounded-full gap-2 h-9">
              <Bookmark className={cn("h-4 w-4", isFollowing && "fill-current")} /> {isFollowing ? 'Suivi' : 'Suivre'}
            </Button>
            <Button onClick={() => toast({title: "Lien copié"})} variant="outline" size="icon" className="rounded-full h-9 w-9"><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* POST ORIGINAL */}
          <Card className="border-2 border-primary/20 bg-primary/[0.02] shadow-2xl relative overflow-hidden rounded-3xl">
            <CardContent className="space-y-6 pt-8">
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-light">
                <p>Quelqu'un a des théories folles sur ce qui va se passer dans le prochain arc ? J'ai l'impression que la prophétie du chapitre 5 est sur le point de se réaliser. Si on regarde attentivement les symboles Adinkra sur les murs du temple...</p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                <Button variant="ghost" size="sm" className="h-9 px-4 gap-2 rounded-full hover:bg-primary/10 hover:text-primary">
                  <ThumbsUp className="h-4 w-4" /> <span className="text-xs font-black">124 Likes</span>
                </Button>
                <Button onClick={() => setReplyText('@' + thread.author + ' ')} variant="ghost" size="sm" className="h-9 px-4 gap-2 rounded-full hover:bg-muted">
                  <Reply className="h-4 w-4" /> <span className="text-xs font-black">Répondre</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RÉPONSES AVEC KARMA ET RÔLES */}
          <div className="space-y-8 pl-0 md:pl-6 border-l-2 border-border/30">
            {mockReplies.map((reply) => (
              <div key={reply.id} className="space-y-6">
                <Card className={cn("border-none bg-card/50 rounded-2xl", reply.isArtist && "border-l-4 border-l-emerald-500")}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 w-14 shrink-0">
                        <Avatar className="h-10 w-10 border shadow-md"><AvatarImage src={reply.avatar} /></Avatar>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[7px] font-black h-3">{reply.authorRole}</Badge>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">{reply.author}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{reply.karma} Karma</span>
                            <span className="text-[10px] text-muted-foreground">&bull; {reply.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed font-light">{reply.content}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-primary/10 hover:text-primary"><ThumbsUp className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold">{reply.likes}</span></Button>
                          <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-muted"><Reply className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold">Répondre</span></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-16 opacity-50" />

        <div className="bg-stone-900 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl"><MessageSquare className="text-primary h-6 w-6" /></div>
              <h2 className="text-2xl font-bold font-display text-white">Ajouter une Réponse</h2>
            </div>
            <div className="space-y-4">
              <Textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Partagez votre lumière avec la communauté..." 
                className="min-h-[150px] bg-white/5 border-white/10 rounded-3xl p-8 text-white font-light"
              />
              <div className="flex justify-end">
                <Button onClick={handlePostReply} disabled={!replyText.trim()} className="h-14 px-12 rounded-full font-black text-lg bg-primary text-black shadow-2xl shadow-primary/30 gold-shimmer">
                  Poster ma réponse
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
