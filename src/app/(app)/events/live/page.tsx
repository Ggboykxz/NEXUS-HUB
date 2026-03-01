'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Users, MessageSquare, Heart, Share2, 
  Settings, Maximize2, Mic, Video, Send, Zap, 
  Flame, Award, Sparkles, Smile, Loader2
} from 'lucide-react';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

export default function NexusHubLivePage() {
  const { openAuthModal } = useAuthModal();
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventId = "live-session-1"; // ID de l'événement par défaut pour le prototype

  const currentStream = {
    title: "Lineart & Storytelling : Les secrets d'Orisha",
    artist: "Jelani Adebayo",
    viewers: 1450,
    likes: 890,
    tags: ["Tutoriel", "Clip Studio", "Action"]
  };

  const quickEmojis = ["🔥", "💛", "👏", "🎨", "✨"];

  // 1. Suivi de l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Écoute des messages en temps réel
  useEffect(() => {
    const q = query(
      collection(db, 'liveEvents', eventId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      setMessages(fetchedMessages);
      setIsLoading(false);
      
      // Auto-scroll vers le bas
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMsg.trim()) return;

    if (!currentUser) {
      openAuthModal('participer au chat en direct');
      return;
    }

    const textToSend = chatMsg.trim();
    setChatMsg('');

    try {
      await addDoc(collection(db, 'liveEvents', eventId, 'messages'), {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Voyageur',
        photoURL: currentUser.photoURL || '',
        text: textToSend,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const addEmoji = (emoji: string) => {
    setChatMsg(prev => prev + emoji);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-stone-950 overflow-hidden">
      {/* 1. PLAYER AREA */}
      <main className="flex-1 flex flex-col min-w-0 border-r border-white/5">
        <div className="flex-1 relative bg-black group">
          {/* Placeholder for Video Player */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40 z-10 pointer-events-none">
            <Play className="h-24 w-24 text-white animate-pulse" />
          </div>
          <Image src="https://picsum.photos/seed/livestream/1200/800" alt="Live" fill className="object-cover opacity-60" />
          
          {/* UI Overlays */}
          <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
            <Badge className="bg-rose-600 border-none px-3 py-1 font-black text-[10px] animate-pulse">DIRECT</Badge>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold text-white border border-white/10">
              <Users className="h-3 w-3 text-primary" /> {currentStream.viewers} spectateurs
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button size="icon" variant="ghost" className="h-10 w-10 bg-black/40 backdrop-blur-xl rounded-full text-white"><Settings className="h-5 w-5" /></Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 bg-black/40 backdrop-blur-xl rounded-full text-white"><Maximize2 className="h-5 w-5" /></Button>
          </div>
        </div>

        {/* Stream Details */}
        <div className="p-6 md:p-8 bg-stone-900 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary ring-4 ring-primary/10">
              <AvatarImage src="https://picsum.photos/seed/artist1/100/100" />
              <AvatarFallback>JA</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-xl font-display font-black text-white tracking-tight">{currentStream.title}</h1>
              <div className="flex items-center gap-3">
                <span className="text-primary text-xs font-bold uppercase tracking-widest">{currentStream.artist}</span>
                <div className="h-1 w-1 rounded-full bg-stone-700" />
                <div className="flex gap-2">
                  {currentStream.tags.map(t => <Badge key={t} variant="secondary" className="bg-white/5 text-[8px] h-4">{t}</Badge>)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button className="flex-1 md:flex-none rounded-full px-8 bg-rose-600 hover:bg-rose-700 text-white font-black h-12 shadow-lg shadow-rose-500/20">S'abonner</Button>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-white/10 text-white"><Heart className="h-5 w-5" /></Button>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-white/10 text-white"><Share2 className="h-5 w-5" /></Button>
          </div>
        </div>
      </main>

      {/* 2. CHAT SIDEBAR */}
      <aside className="w-full lg:w-[380px] bg-stone-900 flex flex-col border-l border-white/5 shadow-2xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg"><MessageSquare className="h-4 w-4 text-primary" /></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Discussion Live</h2>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Direct Firestore</Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest">Connexion au Hub...</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <Avatar className="h-8 w-8 shrink-0 border border-white/5">
                    <AvatarImage src={msg.photoURL} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{msg.displayName?.slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-tighter mb-0.5 text-stone-500 group-hover:text-primary transition-colors">{msg.displayName}</p>
                    <p className="text-sm text-stone-300 leading-snug font-light italic">"{msg.text}"</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-stone-700" />
                <p className="text-xs italic text-stone-500">Silence dans le sanctuaire... <br/> Soyez le premier à parler !</p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-5 bg-black/40 border-t border-white/5 space-y-4">
          {/* Quick Emoji Bar */}
          <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
            {quickEmojis.map(emoji => (
              <button 
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-primary/20 hover:border-primary/30 transition-all active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <Input 
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Exprimez-vous..." 
                className="bg-white/5 border-white/10 rounded-xl h-11 text-xs pr-10 focus-visible:ring-primary shadow-inner"
              />
              <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white h-8 w-8"><Smile className="h-4 w-4" /></Button>
            </div>
            <Button 
              type="submit" 
              disabled={!chatMsg.trim()} 
              size="icon" 
              className="h-11 w-11 rounded-xl bg-primary text-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-tighter text-stone-500 hover:text-primary gap-1.5 transition-all">
                <Zap className="h-3 w-3" /> Don AfriCoins
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">{messages.length > 99 ? '99+' : messages.length} messages actifs</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
