'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { forumThreads, artists, stories } from '@/lib/data';
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
  PlusCircle,
  MoreVertical,
  Flame,
  Star,
  Info,
  ChevronDown,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

// --- MOCK DATA EXTENSION POUR LE PROTO ---
const mockReplies = [
  {
    id: 'r1',
    author: 'Amina Diallo',
    authorId: '2',
    authorBadge: 'Artiste Pro',
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
        content: "Incroyable, l'artiste a répondu ! 😱 Je savais que ce détail était important. Ça change complètement ma vision de la prophétie.",
        timestamp: 'Il y a 12h',
        likes: 12,
      }
    ]
  },
  {
    id: 'r2',
    author: 'Yannick Beauchamp',
    authorId: 'reader-2',
    authorBadge: 'Fidèle',
    content: "Je pense que le frère du méchant aide secrètement le protagoniste. <details class='bg-muted p-2 rounded mt-2 cursor-pointer'><summary className='font-bold text-primary'>Cliquez pour révéler le spoiler</summary>Il y avait des indices dans le chapitre 12 sur son allégeance réelle.</details>",
    timestamp: 'Il y a 1 jour',
    likes: 8,
    isArtist: false,
  }
];

export default function ThreadPage(props: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    // Generate gold particles for the hero
    const newParticles = [...Array(8)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${5 + Math.random() * 5}s`,
      del: `${Math.random() * 3}s`,
      tx: `${Math.random() * 40 - 20}px`,
      ty: `${Math.random() * -80}px`
    }));
    setParticles(newParticles);
  }, []);

  if (!thread) {
    notFound();
  }

  const thread = forumThreads.find((t) => t.id === threadId);
  const authorInfo = artists.find(a => a.name === thread?.author);

  const checkAuth = (action: string) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      openAuthModal(action);
      return false;
    }
    return true;
  };

  const handleFollow = () => {
    if (!checkAuth('suivre cette discussion')) return;
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Discussion ignorée" : "Discussion suivie",
      description: isFollowing ? "Vous ne recevrez plus de notifications." : "Vous serez alerté des nouvelles réponses.",
    });
  };

  const handlePostReply = () => {
    if (!checkAuth('poster votre réponse')) return;
    toast({ title: "Réponse publiée !", description: "Votre message est en ligne." });
    setReplyText('');
  };

  const handleLike = () => {
    if (!checkAuth('aimer ce post')) return;
    toast({ title: "Merci pour le like !" });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié !", description: "Partagez la passion NexusHub." });
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      
      {/* 1. HERO / EN-TÊTE DU THREAD */}
      <section className="relative py-16 px-6 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-stone-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div 
                key={p.id} 
                className="particle bg-primary/20" 
                style={{
                  top: p.top,
                  left: p.left,
                  '--dur': p.dur,
                  '--del': p.del,
                  '--tx': p.tx,
                  '--ty': p.ty
                } as any} 
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
            <Badge className={cn(
              "uppercase tracking-widest text-[9px] font-black px-3 py-1 border-none shadow-lg",
              thread?.isPremium ? "bg-amber-500 text-black shadow-amber-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
            )}>
              {thread?.isPremium ? <><Crown className="h-3 w-3 mr-1 inline fill-current" /> Premium</> : <><ShieldAlert className="h-3 w-3 mr-1 inline" /> Public</>}
            </Badge>
            <Badge variant="secondary" className="bg-white/5 backdrop-blur-md border-white/10 text-stone-300 uppercase tracking-widest text-[9px] font-bold px-3 py-1">
              {thread?.category}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight gold-resplendant drop-shadow-[0_0_20px_rgba(212,168,67,0.3)] animate-in fade-in slide-in-from-top-4 duration-1000">
            {thread?.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pt-2 animate-in fade-in duration-1000 delay-300">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/30 ring-2 ring-primary/10">
                <AvatarImage src={authorInfo?.avatar.imageUrl} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">{thread?.author.slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-bold text-sm">Posté par <span className="text-primary">{thread?.author}</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Il y a 2h</span>
                  {authorInfo?.isMentor && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-3.5">Artiste Pro</Badge>}
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-8 bg-white/10" />

            <div className="flex items-center gap-4 text-stone-400 text-xs font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> {thread?.views} vues</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-primary" /> {thread?.replies} réponses</span>
            </div>

            <Button onClick={handlePostReply} className="hidden sm:flex ml-auto rounded-full px-8 h-11 font-black shadow-xl shadow-primary/20 gold-shimmer bg-primary text-black">
              Répondre au Thread
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BARRE DE NAVIGATION / OUTILS (STICKY) */}
      <div className="sticky top-14 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md py-3 shadow-sm">
        <div className="container max-w-5xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full gap-2 text-xs font-bold text-muted-foreground hover:text-primary">
              <Link href="/forums"><CornerUpLeft className="h-4 w-4" /> <span className="hidden sm:inline">Retour au Forum</span></Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleFollow}
              variant={isFollowing ? 'default' : 'outline'} 
              size="sm" 
              className={cn("rounded-full gap-2 h-9", isFollowing ? "bg-primary text-black shadow-lg shadow-primary/20" : "")}
            >
              <Bookmark className={cn("h-4 w-4", isFollowing && "fill-current")} />
              <span className="hidden sm:inline">{isFollowing ? 'Suivi' : 'Suivre'}</span>
            </Button>
            <Button onClick={handleShare} variant="outline" size="icon" className="rounded-full h-9 w-9">
              <Share2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-border/50 mx-1" />
            <Button onClick={() => checkAuth('signaler ce contenu')} variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL */}
      <main className="container max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-12">
          
          {/* POST ORIGINAL */}
          <Card className="border-2 border-primary/20 bg-primary/[0.02] shadow-2xl relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black text-[8px] tracking-[0.3em]">Original Post</Badge>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Posté à 10:30</span>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-light">
                <p>
                  Quelqu'un a des théories folles sur ce qui va se passer dans le prochain arc ? J'ai l'impression que la prophétie du chapitre 5 est sur le point de se réaliser. 
                  Si on regarde attentivement les symboles Adinkra sur les murs du temple...
                </p>
                <p>
                  Est-ce que vous pensez que le héros va devoir sacrifier son lien avec les ancêtres pour sauver la cité ?
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                <Button onClick={handleLike} variant="ghost" size="sm" className="h-9 px-4 gap-2 rounded-full hover:bg-primary/10 hover:text-primary">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs font-black">124 Likes</span>
                </Button>
                <Button onClick={handlePostReply} variant="ghost" size="sm" className="h-9 px-4 gap-2 rounded-full hover:bg-muted">
                  <Reply className="h-4 w-4" />
                  <span className="text-xs font-black">Répondre</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LISTE DES RÉPONSES */}
          <div className="space-y-8 pl-0 md:pl-6 border-l-2 border-border/30">
            {mockReplies.map((reply) => (
              <div key={reply.id} className="space-y-6">
                <Card className={cn(
                  "border-none bg-card/50 transition-all hover:shadow-xl rounded-2xl",
                  reply.isArtist ? "border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]" : "border-l-4 border-l-transparent"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border shadow-md">
                        <AvatarImage src={reply.avatar} />
                        <AvatarFallback>{reply.author.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm hover:text-primary transition-colors cursor-pointer">{reply.author}</span>
                            <Badge variant="outline" className={cn(
                              "text-[8px] uppercase font-bold px-1.5 py-0",
                              reply.isArtist ? "border-emerald-500 text-emerald-500" : "text-muted-foreground"
                            )}>
                              {reply.authorBadge}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground tracking-tighter">{reply.timestamp}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                        <div 
                          className="text-sm text-foreground/80 leading-relaxed font-light"
                          dangerouslySetInnerHTML={{ __html: reply.content }}
                        />
                        <div className="flex items-center gap-4 pt-2">
                          <Button onClick={handleLike} variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-primary/10 hover:text-primary">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">{reply.likes}</span>
                          </Button>
                          <Button onClick={handlePostReply} variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-muted">
                            <Reply className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">Répondre</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NESTED REPLIES */}
                {reply.replies && reply.replies.map(nested => (
                  <div key={nested.id} className="pl-8 md:pl-12 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/50" />
                    <Card className="border-none bg-muted/30 rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="text-[10px]">{nested.author.slice(0,2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">{nested.author}</span>
                              <Badge variant="secondary" className="text-[7px] uppercase px-1 h-3.5">{nested.authorBadge}</Badge>
                              <span className="text-[9px] text-muted-foreground">{nested.timestamp}</span>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">{nested.content}</p>
                            <div className="flex items-center gap-3">
                              <button onClick={handleLike} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" /> {nested.likes}
                              </button>
                              <button onClick={handlePostReply} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">Répondre</button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 4. FORMULAIRE DE RÉPONSE */}
        <Separator className="my-16 opacity-50" />

        <div className="bg-stone-900 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <MessageSquare className="text-primary h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Ajouter une Réponse</h2>
                <p className="text-xs text-stone-400 font-light uppercase tracking-widest mt-1">Partagez votre lumière avec la communauté</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez avec bienveillance et respect..." 
                  className="min-h-[200px] bg-white/5 border-white/10 focus-visible:ring-primary rounded-3xl p-8 text-lg text-white font-light placeholder:text-stone-600 transition-all"
                />
                <div className="absolute right-6 bottom-6 flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-4 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 gap-2 text-xs font-bold"
                    onClick={() => {
                      if (checkAuth('utiliser des balises spoiler')) {
                        setReplyText(replyText + "<details><summary>Spoiler</summary>...</details>");
                      }
                    }}
                  >
                    <ShieldAlert className="h-4 w-4 text-primary" /> Balise Spoiler
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-400 hover:text-white"><Smile className="h-5 w-5" /></Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  <Info className="h-4 w-4 text-primary" />
                  <p className="text-[10px] text-stone-300 uppercase tracking-widest font-black">
                    {thread?.isPremium ? "Premium : Spoilers autorisés." : "Public : Masquez vos spoilers !"}
                  </p>
                </div>
                <Button 
                  onClick={handlePostReply}
                  disabled={!replyText.trim()}
                  className="w-full sm:w-auto h-14 px-12 rounded-full font-black text-lg shadow-2xl shadow-primary/30 gold-shimmer bg-primary text-black transition-all active:scale-95"
                >
                  Poster ma réponse
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. RÈGLES & SUGGESTIONS */}
        <section className="mt-20 grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display flex items-center gap-3">
              <CheckCircle2 className="text-primary h-6 w-6" /> Règles du Thread
            </h2>
            <ul className="space-y-4">
              {[
                "Respect mutuel entre lecteurs et artistes.",
                "Pas de spoilers majeurs sans balises en zone Public.",
                "Théories basées sur les faits de l'œuvre appréciées.",
                "Tout signalement est analysé par nos modérateurs IA."
              ].map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display flex items-center gap-3">
              <Star className="text-primary h-6 w-6" /> Discussions Liées
            </h2>
            <div className="space-y-3">
              {forumThreads.filter(t => t.id !== threadId).slice(0, 2).map(related => (
                <Link key={related.id} href={`/forums/${related.id}`} className="group block">
                  <div className="p-4 rounded-2xl bg-card border border-border/50 group-hover:border-primary/30 group-hover:shadow-lg transition-all flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{related.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{related.replies} réponses &bull; {related.category}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}