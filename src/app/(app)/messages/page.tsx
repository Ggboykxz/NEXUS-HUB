'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, SendHorizonal, Smile, MoreVertical, Search, 
  Phone, Video, Check, Loader2, MessageSquare, Users, 
  Settings, Info, Trash2, Heart, CircleDollarSign, Zap,
  ChevronRight, ArrowLeft, MoreHorizontal, ShieldCheck, Clock
} from "lucide-react";
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  limit, 
  getDocs, 
  doc, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  setDoc,
  deleteField,
  where,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate la date pour la liste des conversations (façon WhatsApp)
 */
const formatChatDate = (date: Date) => {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: fr });
  return format(date, 'dd/MM/yy');
};

export default function MessagesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('direct');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, { text: string, time: any }>>({});
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

  // 3. Écoute globale des conversations (WhatsApp Style Sorting)
  useEffect(() => {
    if (!currentUser) return;

    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, where('participants', 'array-contains', currentUser.uid), orderBy('updatedAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(convDoc => {
        const data = convDoc.data();
        const otherUserId = data.participants.find((id: string) => id !== currentUser.uid);
        
        if (otherUserId) {
          setLastMessages(prev => ({
            ...prev,
            [otherUserId]: {
              text: data.lastMessage || '',
              time: data.updatedAt
            }
          }));

          // Track unread count
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

  // 4. Écoute des messages et indicateurs de saisie
  useEffect(() => {
    if (!currentUser || !selectedChat) {
      setMessages([]);
      return;
    }

    const participants = [currentUser.uid, selectedChat.uid].sort();
    const convId = participants.join('_');

    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubMessages = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
      
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
        setUnreadCounts(prev => ({ ...prev, [selectedChat.uid]: 0 }));
      }

      setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

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

  // 5. Groupement des messages par jour
  const groupedMessages = useMemo(() => {
    const groups: Record<string, any[]> = {};
    messages.forEach(msg => {
      const date = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
      let dateKey = 'Aujourd\'hui';
      if (!isToday(date)) {
        if (isYesterday(date)) dateKey = 'Hier';
        else dateKey = format(date, 'd MMMM yyyy', { locale: fr });
      }
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

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

  // Tri des utilisateurs par activité récente (last message time)
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const timeA = lastMessages[a.uid]?.time?.seconds || 0;
      const timeB = lastMessages[b.uid]?.time?.seconds || 0;
      return timeB - timeA;
    });
  }, [users, lastMessages]);

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
        "w-full md:w-80 lg:w-[400px] border-r border-white/5 bg-stone-900/50 backdrop-blur-xl flex flex-col transition-all duration-500",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 md:p-8 border-b border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black font-display tracking-tighter gold-resplendant">Discussions</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-stone-500"><Users className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-stone-500"><Settings className="h-5 w-5" /></Button>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un voyageur..." 
              className="pl-11 h-12 rounded-2xl bg-white/5 border-white/10 text-xs focus-visible:ring-primary shadow-inner placeholder:text-stone-700" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {sortedUsers.map((user) => {
              const unreadCount = unreadCounts[user.uid] || 0;
              const lastMsgData = lastMessages[user.uid];
              const lastMsgText = lastMsgData?.text || 'Démarrer la discussion';
              const lastMsgDate = lastMsgData?.time?.toDate ? lastMsgData.time.toDate() : null;

              return (
                <div 
                  key={user.uid} 
                  onClick={() => setSelectedChat(user)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-l-4 border-transparent relative",
                    selectedChat?.uid === user.uid ? "bg-primary/5 border-l-primary" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 border-2 border-stone-800 shadow-xl">
                      <AvatarImage src={user.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">{user.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-lg" />
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={cn("font-black truncate text-sm", selectedChat?.uid === user.uid ? "text-primary" : "text-white")}>
                        {user.displayName}
                      </p>
                      {lastMsgDate && (
                        <span className={cn("text-[10px] font-bold uppercase tracking-tighter", unreadCount > 0 ? "text-primary" : "text-stone-600")}>
                          {formatChatDate(lastMsgDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-xs truncate font-light leading-tight",
                        unreadCount > 0 ? "text-white font-bold" : "text-stone-500"
                      )}>
                        {lastMsgText}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="bg-primary text-black border-none h-5 min-w-5 flex items-center justify-center p-0 rounded-full text-[10px] font-black animate-in zoom-in duration-300 shrink-0 shadow-[0_0_10px_rgba(212,168,67,0.3)]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-stone-950 relative">
        {selectedChat ? (
          <>
            <div className="p-4 md:px-10 h-20 border-b border-white/5 flex items-center justify-between bg-stone-900/30 backdrop-blur-3xl z-20">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} className="md:hidden h-10 w-10 rounded-full text-stone-500"><ArrowLeft className="h-5 w-5" /></Button>
                <div className="relative">
                  <Avatar className="h-11 w-11 border-2 border-primary/20">
                    <AvatarImage src={selectedChat.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black">{selectedChat.displayName?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight leading-none">{selectedChat.displayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {isOtherUserTyping ? (
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest italic animate-pulse">En train d'écrire...</span>
                    ) : (
                      <p className="text-[9px] text-stone-500 uppercase font-black tracking-[0.2em]">{selectedChat.role?.replace('_', ' ') || 'Voyageur'}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-stone-500 hover:text-primary"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-stone-500 hover:text-primary"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-stone-500 hover:text-white"><MoreHorizontal className="h-5 w-5" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
              <div className="max-w-4xl mx-auto space-y-10 px-6 py-10 pb-20">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="space-y-8">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-stone-900/80 backdrop-blur-md border-white/5 text-[10px] uppercase font-black tracking-widest text-stone-500 px-4 py-1 rounded-full shadow-xl">
                        {date}
                      </Badge>
                    </div>
                    {msgs.map((msg) => {
                      const isMe = msg.senderId === currentUser?.uid;
                      return (
                        <div key={msg.id} className={cn(
                          "flex gap-3 max-w-[85%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                          isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}>
                          <div className={cn("space-y-1.5", isMe ? "items-end" : "items-start")}>
                            <div className={cn(
                              "p-4 rounded-2xl shadow-2xl text-sm leading-relaxed relative group",
                              isMe 
                                ? "bg-primary text-black font-medium rounded-tr-none" 
                                : "bg-stone-900 border border-white/5 text-stone-200 rounded-tl-none"
                            )}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <div className={cn(
                                "flex items-center gap-1.5 mt-1 justify-end",
                                isMe ? "text-stone-950/60" : "text-stone-500"
                              )}>
                                <span className="text-[8px] font-black uppercase">
                                  {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : ''}
                                </span>
                                {isMe && (
                                  <div className="flex">
                                    <Check className={cn("h-3 w-3", msg.read ? "text-emerald-600" : "text-stone-600")} />
                                    {msg.read && <Check className="h-3 w-3 -ml-2 text-emerald-600" />}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={scrollEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-6 bg-stone-900/80 border-t border-white/5 backdrop-blur-3xl relative z-40">
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <Button type="button" variant="ghost" size="icon" className="text-stone-500 hover:text-primary rounded-full h-11 w-11 bg-white/5 border border-white/5 shrink-0"><Paperclip className="h-5 w-5" /></Button>
                <div className="relative flex-1 group">
                  <Input 
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder="Écrivez votre message..." 
                    className="pr-14 bg-white/5 border-white/10 rounded-2xl h-14 text-white focus-visible:ring-primary shadow-inner placeholder:text-stone-700 transition-all text-sm border-none" 
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-600 hover:text-primary h-10 w-10 transition-colors">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!messageText.trim() || isSending}
                  size="icon" 
                  className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all active:scale-90 group shrink-0"
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
                  "Sélectionnez un compagnon de route pour engager le dialogue."
                </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-stone-700 tracking-[0.3em]">
              <ShieldCheck className="h-4 w-4" /> Nexus Cryptage Actif
            </div>
          </div>
        )}
      </main>
    </div>
  );
}