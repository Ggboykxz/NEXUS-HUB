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
  ChevronRight, ArrowLeft, MoreHorizontal, ShieldCheck
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
  where,
  updateDoc,
  writeBatch
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
  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Suivi de l'Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Chargement des contacts
  useEffect(() => {
    async function fetchContacts() {
      if (!currentUser) return;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(50));
        const snap = await getDocs(q);
        const fetched = snap.docs
          .map(d => ({ ...d.data() } as UserProfile))
          .filter(u => u.uid !== currentUser.uid);
        
        setUsers(fetched);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setLoading(false);
      }
    }
    fetchContacts();
  }, [currentUser]);

  // 3. Écoute globale des compteurs de non-lus (Style WhatsApp)
  useEffect(() => {
    if (!currentUser) return;

    // On écoute les conversations où l'utilisateur est participant
    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, where('participants', 'array-contains', currentUser.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      
      snapshot.docs.forEach(convDoc => {
        const data = convDoc.data();
        const otherUserId = data.participants.find((id: string) => id !== currentUser.uid);
        
        // Pour chaque conversation, on va compter les messages non-lus
        // Note: Dans une app réelle, on stockerait ce compte directement dans la conv metadata
        // Ici on crée un listener par conv active pour le prototype
        if (otherUserId) {
          const msgsRef = collection(db, 'conversations', convDoc.id, 'messages');
          const unreadQ = query(
            msgsRef, 
            where('senderId', '!=', currentUser.uid),
            where('read', '==', false)
          );
          
          onSnapshot(unreadQ, (msgSnap) => {
            setUnreadCounts(prev => ({
              ...prev,
              [otherUserId]: msgSnap.size
            }));
          });
        }
      });
    });

    return () => unsub();
  }, [currentUser]);

  // 4. Écoute des messages et indicateurs de saisie en temps réel
  useEffect(() => {
    if (!currentUser || !selectedChat) {
      setMessages([]);
      return;
    }

    const participants = [currentUser.uid, selectedChat.uid].sort();
    const convId = participants.join('_');

    // Listener des messages
    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubMessages = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
      
      // Marquer comme lu immédiatement si on est sur la conversation
      const batch = writeBatch(db);
      let needsUpdate = false;
      
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.senderId !== currentUser.uid && !data.read) {
          batch.update(d.ref, { read: true });
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        batch.commit();
        // Reset local count pour réactivité immédiate
        setUnreadCounts(prev => ({ ...prev, [selectedChat.uid]: 0 }));
      }

      // Scroll auto
      setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Listener du statut de saisie
    const typingRef = doc(db, 'typing', convId);
    const unsubTyping = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const otherUserTypingAt = data[selectedChat.uid];
        if (otherUserTypingAt) {
          const now = Date.now();
          const typingTime = otherUserTypingAt.toDate ? otherUserTypingAt.toDate().getTime() : now;
          setIsOtherUserTyping(now - typingTime < 4000);
        } else {
          setIsOtherUserTyping(false);
        }
      } else {
        setIsOtherUserTyping(false);
      }
    });

    return () => {
      unsubMessages();
      unsubTyping();
    };
  }, [currentUser, selectedChat]);

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUser || !selectedChat) return;
    const participants = [currentUser.uid, selectedChat.uid].sort();
    const convId = participants.join('_');
    const typingRef = doc(db, 'typing', convId);

    try {
      await setDoc(typingRef, {
        [currentUser.uid]: isTyping ? serverTimestamp() : deleteField()
      }, { merge: true });
    } catch (e) {
      console.error("Typing status error", e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    updateTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => updateTypingStatus(false), 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      const participants = [currentUser.uid, selectedChat.uid].sort();
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

      // Update conversation metadata pour le tri de la liste
      const convRef = doc(db, 'conversations', convId);
      await setDoc(convRef, {
        lastMessage: messageText.trim(),
        lastMessageAt: serverTimestamp(),
        participants: participants,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setMessageText('');
      updateTypingStatus(false);
    } catch (error) {
      toast({ title: "Erreur d'envoi", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Ouverture des canaux...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-stone-950 text-white font-sans">
      {/* 1. SIDEBAR CONTACTS */}
      <aside className={cn(
        "w-full md:w-80 lg:w-[380px] border-r border-white/5 bg-stone-900/50 backdrop-blur-xl flex flex-col transition-all duration-500",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-8 border-b border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black font-display tracking-tighter gold-resplendant">Nexus Chat</h2>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-stone-500"><Settings className="h-5 w-5" /></Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-2xl h-12">
              <TabsTrigger value="direct" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Voyageurs</TabsTrigger>
              <TabsTrigger value="team" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Équipes</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Chercher une alliance..." 
              className="pl-11 h-12 rounded-2xl bg-white/5 border-white/10 text-xs focus-visible:ring-primary shadow-inner" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {activeTab === 'direct' ? (
              users.map((user) => {
                const unreadCount = unreadCounts[user.uid] || 0;
                return (
                  <div 
                    key={user.uid} 
                    onClick={() => setSelectedChat(user)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-[2rem] cursor-pointer transition-all border-2 border-transparent group",
                      selectedChat?.uid === user.uid ? "bg-primary/10 border-primary/20" : "hover:bg-white/5"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 border-2 border-stone-800 ring-2 ring-transparent group-hover:ring-primary/30 transition-all shadow-xl">
                        <AvatarImage src={user.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">{user.displayName?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-4 border-stone-900 shadow-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className={cn("font-black truncate text-sm transition-colors", selectedChat?.uid === user.uid ? "text-primary" : "text-white")}>{user.displayName}</p>
                        <span className="text-[8px] text-stone-600 font-bold uppercase tracking-tighter">Live</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-stone-500 truncate font-light italic leading-tight">
                          {user.role === 'artist_pro' ? 'Artiste Pro' : 'Voyageur Nexus'}
                        </p>
                        {unreadCount > 0 && selectedChat?.uid !== user.uid && (
                          <Badge className="bg-rose-600 text-white border-none h-5 min-w-5 flex items-center justify-center p-0 rounded-full text-[10px] font-black animate-in zoom-in duration-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center space-y-6 opacity-40">
                <div className="bg-white/5 p-6 rounded-full w-fit mx-auto"><Users className="h-12 w-12 text-stone-500" /></div>
                <p className="text-[10px] text-stone-600 uppercase font-black tracking-[0.3em] leading-relaxed">Les Salons d'Équipe <br/> arrivent avec Nexus Pro.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-stone-950 relative">
        {selectedChat ? (
          <>
            {/* Header de discussion */}
            <div className="p-6 md:px-10 border-b border-white/5 flex items-center justify-between bg-stone-900/30 backdrop-blur-3xl z-20">
              <div className="flex items-center gap-5">
                <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} className="md:hidden h-10 w-10 rounded-full text-stone-500"><ArrowLeft className="h-5 w-5" /></Button>
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-[0_0_20px_rgba(212,168,67,0.2)]">
                    <AvatarImage src={selectedChat.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black">{selectedChat.displayName?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-white tracking-tight leading-none">{selectedChat.displayName}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[9px] text-stone-500 uppercase font-black tracking-[0.2em]">{selectedChat.role?.replace('_', ' ') || 'Voyageur'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-white/10 text-stone-400 hover:text-primary transition-all hidden sm:flex"><Phone className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-white/10 text-stone-400 hover:text-primary transition-all hidden sm:flex"><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-stone-500 hover:text-white"><MoreHorizontal className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Zone des messages */}
            <ScrollArea className="flex-1 px-6 md:px-10 py-8">
              <div className="max-w-4xl mx-auto space-y-10 pb-10">
                <div className="flex flex-col items-center gap-2 mb-12">
                  <Badge variant="outline" className="bg-white/5 text-stone-600 border-white/5 text-[8px] px-6 py-1 rounded-full uppercase tracking-[0.4em] font-black">Conversation Cryogénisée</Badge>
                  <p className="text-[8px] text-stone-700 uppercase font-bold tracking-widest">Aujourd'hui</p>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.uid;
                  return (
                    <div key={msg.id} className={cn(
                      "flex gap-4 max-w-[85%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      <div className={cn("space-y-2", isMe ? "text-right" : "text-left")}>
                        <div className={cn(
                          "p-5 rounded-[2.5rem] shadow-2xl text-sm leading-relaxed transition-all relative group",
                          isMe 
                            ? "bg-primary text-black font-medium rounded-tr-none shadow-primary/10" 
                            : "bg-stone-900 border border-white/5 text-stone-200 rounded-tl-none"
                        )}>
                          <p>{msg.text}</p>
                          {isMe && (
                            <div className="absolute -bottom-4 right-2">
                              {msg.read ? (
                                <div className="flex items-center gap-0.5">
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  <Check className="h-3 w-3 text-emerald-500 -ml-2" />
                                </div>
                              ) : (
                                <Check className="h-3 w-3 text-stone-600" />
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-[8px] text-stone-600 font-black uppercase tracking-widest px-4">
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollEndRef} />
              </div>
            </ScrollArea>

            {/* Indicateur de saisie */}
            {isOtherUserTyping && (
              <div className="px-10 py-4 absolute bottom-[100px] left-0 right-0 z-30 pointer-events-none">
                <div className="flex items-center gap-3 bg-stone-900/90 backdrop-blur-xl w-fit px-6 py-2.5 rounded-full border border-white/10 shadow-2xl animate-in slide-in-from-left-4 duration-500">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{selectedChat.displayName} rédige...</span>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-8 bg-stone-900/50 border-t border-white/5 backdrop-blur-3xl relative z-40">
              <div className="max-w-4xl mx-auto flex items-center gap-5">
                <Button type="button" variant="ghost" size="icon" className="text-stone-500 hover:text-primary transition-all rounded-full h-12 w-12 bg-white/5 border border-white/5 shrink-0"><Paperclip className="h-5 w-5" /></Button>
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
                  className="rounded-2xl h-14 w-14 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all active:scale-90 group shrink-0"
                >
                  {isSending ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : <SendHorizonal className="h-6 w-6 text-black group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-10 animate-in zoom-in-95 duration-700">
            <div className="relative">
                <div className="bg-primary/10 p-16 rounded-[4rem] border border-primary/10 shadow-inner">
                  <MessageSquare className="h-24 w-24 text-primary" />
                </div>
                <Zap className="absolute -top-4 -right-4 h-14 w-14 text-primary animate-pulse fill-current" />
            </div>
            <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter gold-resplendant">Messagers du Nexus</h3>
                <p className="text-stone-500 max-sm font-light italic leading-relaxed text-xl">
                  "Sélectionnez un compagnon de route dans la liste pour engager le dialogue et forger de nouvelles alliances."
                </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-stone-700 tracking-[0.3em]">
              <ShieldCheck className="h-4 w-4" /> Cryptage Quantum Actif
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
