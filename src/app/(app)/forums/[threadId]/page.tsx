'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  CornerUpLeft, 
  Crown, 
  ShieldAlert, 
  ThumbsUp, 
  Reply, 
  Share2, 
  Eye, 
  ArrowRight,
  Bookmark,
  AlertTriangle,
  ThumbsDown,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  increment,
  updateDoc 
} from 'firebase/firestore';

/**
 * Composant de protection de contenu (Spoiler).
 * Masque le contenu avec un flou et nécessite un clic pour révéler.
 */
function SpoilerBlock({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      onClick={() => !isVisible && setIsVisible(true)}
      className={cn(
        "relative rounded-2xl border-2 transition-all duration-500 overflow-hidden",
        isVisible 
          ? "border-amber-500/20 bg-amber-500/5" 
          : "border-amber-500 bg-stone-900 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-100"
      )}
    >
      <div className={cn(
        "p-5 transition-all duration-700",
        !isVisible && "blur-xl select-none opacity-10 scale-[0.98] grayscale"
      )}>
        {children}
      </div>
      
      {!isVisible && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-center">
          <div className="bg-amber-500 text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl animate-pulse flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Spoiler — Cliquez pour révéler
          </div>
          <p className="text-[9px] text-amber-500/60 mt-3 font-bold uppercase tracking-widest">Attention : Révélations d'intrigue</p>
        </div>
      )}
    </div>
  );
}

export default function ThreadDetailPage(props: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSpoilerActive, setIsSpoilerActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // 1. Écoute du document Thread (Sujet principal)
  useEffect(() => {
    const threadRef = doc(db, 'forumThreads', threadId);
    const unsub = onSnapshot(threadRef, (docSnap) => {
      if (docSnap.exists()) {
        setThread({ id: docSnap.id, ...docSnap.data() });
        // Incrémentation des vues lors de l'accès
        updateDoc(threadRef, { views: increment(1) }).catch(() => {});
      } else {
        setThread(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [threadId]);

  // 2. Écoute de la sous-collection de réponses (Replies)
  useEffect(() => {
    const repliesRef = collection(db, 'forumThreads', threadId, 'replies');
    const q = query(repliesRef, orderBy('createdAt', 'asc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReplies(data);
    });
    return () => unsub();
  }, [threadId]);

  const handlePostReply = async () => {
    if (!currentUser) {
      openAuthModal('poster votre réponse');
      return;
    }

    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const repliesRef = collection(db, 'forumThreads', threadId, 'replies');
      await addDoc(repliesRef, {
        author: currentUser.displayName || 'Anonyme',
        authorId: currentUser.uid,
        authorPhoto: currentUser.photoURL || '',
        content: replyText.trim(),
        isSpoiler: isSpoilerActive,
        likes: 0,
        createdAt: serverTimestamp()
      });

      // Mise à jour du compteur de réponses sur le sujet principal
      const threadRef = doc(db, 'forumThreads', threadId);
      await updateDoc(threadRef, { replies: increment(1) });

      toast({ 
        title: isSpoilerActive ? "Spoiler publié !" : "Réponse publiée !", 
        description: "Votre message a été ajouté à la discussion." 
      });
      
      setReplyText('');
      setIsSpoilerActive(false);
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de publier votre réponse.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Ouverture du débat...</p>
      </div>
    );
  }

  if (!thread) notFound();

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

          <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight gold-resplendant drop-shadow-[0_0_15px_rgba(212,168,67,0.4)]">{thread.title}</h1>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={thread.authorPhoto} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">{thread.author?.slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-bold text-sm">Posté par <span className="text-primary">{thread.author}</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Discussion active</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-3.5 font-black uppercase">KARMA: {thread.authorKarma || '---'}</Badge>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex ml-auto items-center gap-4 text-stone-400 text-xs font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> {thread.views || 0} vues</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-primary" /> {thread.replies || 0} réponses</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md py-3 shadow-sm">
        <div className="container max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="rounded-full gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all">
            <Link href="/forums"><CornerUpLeft className="h-4 w-4" /> Retour au Forum</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsFollowing(!isFollowing)} variant={isFollowing ? 'default' : 'outline'} size="sm" className="rounded-full gap-2 h-9 font-bold">
              <Bookmark className={cn("h-4 w-4", isFollowing && "fill-current")} /> {isFollowing ? 'Suivi' : 'Suivre'}
            </Button>
            <Button onClick={() => toast({title: "Lien copié"})} variant="outline" size="icon" className="rounded-full h-9 w-9"><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* POST ORIGINAL */}
          <Card className="border-2 border-primary/20 bg-primary/[0.02] shadow-2xl relative overflow-hidden rounded-[2rem]">
            <CardContent className="space-y-6 pt-10">
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-light italic">
                <p>{thread.content || "Chargement du contenu..."}</p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-primary/10">
                <Button variant="ghost" size="sm" className="h-9 px-5 gap-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                  <ThumbsUp className="h-4 w-4" /> <span className="text-xs font-black">Like</span>
                </Button>
                <Button onClick={() => setReplyText('@' + thread.author + ' ')} variant="ghost" size="sm" className="h-9 px-5 gap-2 rounded-full hover:bg-muted transition-all">
                  <Reply className="h-4 w-4" /> <span className="text-xs font-black">Répondre</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RÉPONSES RÉELLES DEPUIS FIRESTORE */}
          <div className="space-y-8 pl-0 md:pl-8 border-l-2 border-border/20">
            {replies.map((reply) => (
              <div key={reply.id} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <Card className={cn(
                  "border-none bg-card/50 rounded-[2rem] shadow-lg transition-all hover:shadow-xl",
                  reply.isArtist && "border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]"
                )}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="flex flex-col items-center gap-2 w-16 shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-white/5 shadow-xl">
                          <AvatarImage src={reply.authorPhoto} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">{reply.author?.slice(0,1)}</AvatarFallback>
                        </Avatar>
                        <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black h-4 px-2 uppercase tracking-tighter">VOYAGEUR</Badge>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-white">{reply.author}</span>
                            <span className="text-[10px] text-stone-600 font-bold">
                              &bull; {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleDateString() : 'En cours...'}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-600"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                        
                        {reply.isSpoiler ? (
                          <SpoilerBlock>
                            <p className="text-sm text-foreground/80 leading-relaxed font-light">{reply.content}</p>
                          </SpoilerBlock>
                        ) : (
                          <p className="text-sm text-foreground/80 leading-relaxed font-light">{reply.content}</p>
                        )}

                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                          <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                            <ThumbsUp className="h-3.5 w-3.5" /> <span className="text-[10px] font-black">{reply.likes || 0}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full hover:bg-muted transition-all">
                            <ThumbsDown className="h-3.5 w-3.5 text-stone-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-4 gap-2 rounded-full hover:bg-muted transition-all ml-auto">
                            <Reply className="h-3.5 w-3.5" /> <span className="text-[10px] font-black uppercase tracking-widest">Répondre</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {replies.length === 0 && (
              <div className="py-12 text-center text-stone-600 italic text-sm">
                Aucune réponse pour le moment. Soyez le premier à éclairer ce débat !
              </div>
            )}
          </div>
        </div>

        <Separator className="my-20 opacity-30" />

        <div className="bg-stone-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5"><MessageSquare className="h-48 w-48 text-primary" /></div>
          
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl shadow-inner"><MessageSquare className="text-primary h-8 w-8" /></div>
              <div>
                <h2 className="text-3xl font-black font-display text-white tracking-tighter">Ajouter une Réponse</h2>
                <p className="text-stone-500 text-sm italic font-light">"Partagez votre lumière avec la communauté."</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <Textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre message ici..." 
                  className="min-h-[200px] bg-white/5 border-white/10 rounded-[2rem] p-8 text-white font-light text-lg italic focus-visible:ring-primary shadow-inner"
                />
                {isSpoilerActive && (
                  <div className="absolute inset-0 bg-amber-500/5 rounded-[2rem] border-2 border-dashed border-amber-500/30 pointer-events-none animate-in fade-in duration-500" />
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <Button 
                  onClick={() => setIsSpoilerActive(!isSpoilerActive)}
                  variant={isSpoilerActive ? 'default' : 'outline'}
                  size="lg"
                  className={cn(
                    "rounded-full gap-3 text-[10px] font-black uppercase tracking-[0.2em] h-12 px-8 transition-all duration-500 w-full sm:w-auto shadow-xl",
                    isSpoilerActive 
                      ? "bg-amber-500 text-black hover:bg-amber-600 shadow-amber-500/20" 
                      : "border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  )}
                >
                  <AlertTriangle className={cn("h-4 w-4", isSpoilerActive && "animate-bounce")} />
                  {isSpoilerActive ? 'Spoiler Activé' : '+ Marquer Spoiler'}
                </Button>

                <Button 
                  onClick={handlePostReply} 
                  disabled={!replyText.trim() || isSubmitting} 
                  className="h-16 px-14 rounded-full font-black text-xl bg-primary text-black shadow-[0_0_40px_rgba(212,168,67,0.3)] gold-shimmer w-full sm:w-auto"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Poster ma réponse"}
                </Button>
              </div>
              
              <p className="text-[9px] text-stone-600 font-bold uppercase tracking-[0.3em] text-center italic">
                En publiant, vous acceptez la charte de bienveillance du Hub.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}