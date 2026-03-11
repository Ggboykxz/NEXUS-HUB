'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, SendHorizonal, Smile, MoreVertical, Search, 
  Phone, Video, Check, Loader2, MessageSquare, Users, 
  Settings, Info, Trash2, Heart, CircleDollarSign, Zap,
  ChevronRight, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  limit, 
  getDocs, 
  doc, 
  getDoc, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  setDoc,
  deleteField,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('direct');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSubmitting] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch Contact List (Existing conversations or recently joined)
  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), limit(30));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs
          .map(doc => ({ ...doc.data() } as UserProfile))
          .filter(u => u.uid !== auth.currentUser?.uid);
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0 && !selectedChat) {
          setSelectedChat(fetchedUsers[0]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // 3. Real-time Messages & Typing Listener
  useEffect(() => {
    if (!currentUser || !selectedChat) return;

    const otherUid = selectedChat.uid || selectedChat.id;
    const participants = [currentUser.uid, otherUid].sort();
    const convId = participants.join('_');

    // Messages Listener
    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
      setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Typing Indicator Listener
    const typingRef = doc(db, 'typing', convId);
    const unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const otherUserTimestamp = data[otherUid];

        if (otherUserTimestamp) {
          const now = new Date().getTime();
          const typingDate = otherUserTimestamp.toDate ? otherUserTimestamp.toDate().getTime() : now;
          if (now - typingDate < 5000) {
            setIsOtherUserTyping(true);
          } else {
            setIsOtherUserTyping(false);
          }
        } else {
          setIsOtherUserTyping(false);
        }
      } else {
        setIsOtherUserTyping(false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [currentUser, selectedChat]);

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUser || !selectedChat) return;
    const otherUid = selectedChat.uid || selectedChat.id;
    const participants = [currentUser.uid, otherUid].sort();
    const convId = participants.join('_');
    const typingRef = doc(db, 'typing', convId);

    try {
      await setDoc(typingRef, {
        [currentUser.uid]: isTyping ? serverTimestamp() : deleteField()
      }, { merge: true });
    } catch (e) {
      console.error("Error updating typing status", e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    updateTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => updateTypingStatus(false), 5000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser || !selectedChat || isSending) return;

    setIsSubmitting(true);
    try {
      const otherUid = selectedChat.uid || selectedChat.id;
      const participants = [currentUser.uid, otherUid].sort();
      const convId = participants.join('_');
      
      const msgsRef = collection(db, 'conversations', convId, 'messages');
      
      await addDoc(msgsRef, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Voyageur',
        text: messageText.trim(),
        createdAt: serverTimestamp(),
        read: false,
        type: 'text'
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      await updateTypingStatus(false);
      setMessageText('');
    } catch (error) {
      toast({ title: "Erreur d'envoi", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Initialisation du Hub...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex container mx-auto max-w-7xl px-0 overflow-hidden my-4 bg-card shadow-2xl rounded-[3rem] border border-white/5 animate-in fade-in duration-700">
      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-[350px] border-r border-white/5 bg-stone-900/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black font-display text-white gold-resplendant">Conversations</h2>
            <Button variant="ghost" size="icon" className="text-stone-500 hover:text-primary transition-colors"><Settings className="h-5 w-5" /></Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-2xl h-12">
              <TabsTrigger value="direct" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Direct</TabsTrigger>
              <TabsTrigger value="team" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Teams</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Rechercher un contact..." className="pl-11 bg-white/5 border-white/10 rounded-2xl h-12 text-white text-xs focus-visible:ring-primary" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {activeTab === 'direct' ? (
              users.map((user) => (
                <div 
                  key={user.uid} 
                  onClick={() => setSelectedChat(user)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2 border-transparent group",
                    selectedChat?.uid === user.uid ? "bg-primary/10 border-primary/20" : "hover:bg-white/5"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-white/10 shadow-lg group-hover:border-primary/30 transition-all">
                      <AvatarImage src={user.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">{user.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={cn("font-black truncate text-sm transition-colors", selectedChat?.uid === user.uid ? "text-primary" : "text-white")}>{user.displayName}</p>
                      <span className="text-[8px] text-stone-600 font-bold uppercase tracking-tighter">Live</span>
                    </div>
                    <p className="text-xs text-stone-500 truncate font-light italic leading-tight">Cliquez pour engager le dialogue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center space-y-6">
                <div className="bg-white/5 p-6 rounded-full w-fit mx-auto opacity-20"><Users className="h-12 w-12 text-stone-500" /></div>
                <p className="text-[10px] text-stone-600 uppercase font-black tracking-[0.3em] leading-relaxed">Les Salons d'Équipe arrivent bientôt avec NexusHub Elite.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main chat area */}
      <main className="hidden md:flex flex-1 flex-col bg-stone-950 relative">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="p-6 px-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-3xl z-10">
              <div className="flex items-center gap-5">
                <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-[0_0_20px_rgba(212,168,67,0.2)]">
                  <AvatarImage src={selectedChat.photoURL || selectedChat.photo} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-black">{(selectedChat.displayName || selectedChat.name)?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-display font-black text-white tracking-tight leading-none">{selectedChat.displayName || selectedChat.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    <p className="text-[9px] text-stone-500 uppercase font-black tracking-[0.2em]">En ligne — Session sécurisée</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-white/10 text-stone-400 hover:text-primary transition-all"><Phone className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-white/10 text-stone-400 hover:text-primary transition-all"><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-stone-500 hover:text-white"><MoreVertical className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 px-10 py-8">
              <div className="max-w-4xl mx-auto space-y-8 pb-10">
                <div className="flex justify-center mb-12">
                  <Badge variant="outline" className="bg-white/5 text-stone-600 border-white/5 text-[8px] px-6 py-1 rounded-full uppercase tracking-[0.4em] font-black">Chiffrement de bout en bout activé</Badge>
                </div>

                {messages.length > 0 ? messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.uid;
                  return (
                    <div key={msg.id} className={cn(
                      "flex gap-4 max-w-[80%] group animate-in fade-in slide-in-from-bottom-2 duration-500",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      {!isMe && (
                        <Avatar className="h-10 w-10 mt-1 border-2 border-white/5 shrink-0 shadow-lg">
                          <AvatarImage src={selectedChat.photoURL} className="object-cover" />
                          <AvatarFallback>{selectedChat.displayName?.slice(0,1)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("space-y-2", isMe ? "text-right" : "text-left")}>
                        <div className={cn(
                          "p-5 rounded-[2rem] shadow-xl text-sm leading-relaxed transition-all group-hover:scale-[1.02]",
                          isMe 
                            ? "bg-primary text-black font-medium rounded-tr-none shadow-primary/10" 
                            : "bg-white/5 border border-white/10 text-stone-200 rounded-tl-none"
                        )}>
                          <p>{msg.text}</p>
                        </div>
                        <p className="text-[8px] text-stone-600 font-black uppercase tracking-widest px-2">
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Synchronisation...'}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-24 opacity-40 text-center space-y-6">
                    <div className="p-8 rounded-full bg-primary/5 border border-primary/10"><MessageSquare className="h-16 w-16 text-primary" /></div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-display font-black text-white uppercase tracking-tighter">Le Sanctuaire est calme</h4>
                        <p className="text-sm text-stone-500 italic max-w-xs mx-auto">"Soyez le premier à graver vos mots dans cette conversation avec {selectedChat.displayName}."</p>
                    </div>
                  </div>
                )}
                <div ref={scrollEndRef} />
              </div>
            </ScrollArea>

            {/* Typing Indicator */}
            {isOtherUserTyping && (
              <div className="px-10 py-4 absolute bottom-[100px] left-0 right-0 z-20 pointer-events-none">
                <div className="flex items-center gap-3 bg-stone-900/80 backdrop-blur-md w-fit px-5 py-2 rounded-full border border-white/5 shadow-2xl animate-in slide-in-from-left-4 duration-500">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{selectedChat.displayName} rédige...</span>
                </div>
              </div>
            )}

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-8 bg-white/[0.03] border-t border-white/5 backdrop-blur-3xl relative z-30">
              <div className="max-w-4xl mx-auto flex items-center gap-5">
                <Button type="button" variant="ghost" size="icon" className="text-stone-500 hover:text-primary transition-all rounded-full h-12 w-12 bg-white/5 border border-white/5"><Paperclip className="h-5 w-5" /></Button>
                <div className="relative flex-1 group">
                  <Input 
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder="Écrivez votre message..." 
                    className="pr-14 bg-white/5 border-white/10 rounded-2xl h-14 text-white focus-visible:ring-primary shadow-inner placeholder:text-stone-700 transition-all text-sm" 
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-600 hover:text-primary h-10 w-10 transition-colors">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!messageText.trim() || isSending}
                  size="icon" 
                  className="rounded-2xl h-14 w-14 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all active:scale-90 group"
                >
                  {isSending ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : <SendHorizonal className="h-6 w-6 text-black group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in zoom-in-95 duration-700">
            <div className="relative">
                <div className="bg-primary/10 p-12 rounded-[4rem] border border-primary/10 shadow-inner">
                  <MessageSquare className="h-20 w-20 text-primary" />
                </div>
                <Zap className="absolute -top-4 -right-4 h-12 w-12 text-primary animate-pulse fill-current" />
            </div>
            <div className="space-y-3">
                <h3 className="text-4xl font-display font-black text-white tracking-tighter gold-resplendant">Vos Messagers</h3>
                <p className="text-stone-500 max-w-sm font-light italic leading-relaxed text-lg">
                  "Chaque alliance commence par un simple échange. Sélectionnez un compagnon de route pour démarrer la discussion."
                </p>
            </div>
            <Button variant="outline" className="rounded-full px-10 h-12 border-primary text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-black transition-all">
                Nouvelle Conversation
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
