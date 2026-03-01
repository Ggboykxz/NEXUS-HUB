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
  Settings, Info, Trash2, Heart, CircleDollarSign, Zap
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
  serverTimestamp 
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
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // 1. Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Contact List
  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), limit(20));
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

  // 3. Real-time Messages Listener
  useEffect(() => {
    if (!currentUser || !selectedChat) return;

    // Generate a unique conversation ID for DM
    const participants = [currentUser.uid, selectedChat.uid || selectedChat.id].sort();
    const convId = participants.join('_');

    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
      // Auto-scroll to bottom
      setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error("Messages listener error:", error);
    });

    return () => unsubscribe();
  }, [currentUser, selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser || !selectedChat || isSending) return;

    setIsSubmitting(true);
    try {
      const participants = [currentUser.uid, selectedChat.uid || selectedChat.id].sort();
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

      setMessageText('');
    } catch (error) {
      toast({ title: "Erreur d'envoi", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex container mx-auto max-w-7xl px-0 border-none rounded-[2.5rem] overflow-hidden my-4 bg-card shadow-2xl">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r bg-stone-900/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black font-display text-white">Hub Messages</h2>
            <Button variant="ghost" size="icon" className="text-stone-500"><Settings className="h-5 w-5" /></Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl h-10">
              <TabsTrigger value="direct" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Direct</TabsTrigger>
              <TabsTrigger value="team" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Équipes</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
            <Input placeholder="Rechercher..." className="pl-9 bg-white/5 border-none rounded-xl h-10 text-white text-xs" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {activeTab === 'direct' ? (
              users.map((user) => (
                <div 
                  key={user.uid} 
                  onClick={() => setSelectedChat(user)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 border-transparent",
                    selectedChat?.uid === user.uid ? "bg-primary/10 border-primary/20" : "hover:bg-white/5"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white/5">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-bold text-white truncate text-sm">{user.displayName}</p>
                      <span className="text-[9px] text-stone-500 font-bold uppercase">Maintenant</span>
                    </div>
                    <p className="text-xs text-stone-400 truncate font-light italic">"Canal de discussion actif"</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-4">
                <Users className="h-10 w-10 text-stone-700 mx-auto opacity-20" />
                <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest leading-relaxed">Les chats d'équipe arrivent bientôt avec NexusHub Elite.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main chat area */}
      <main className="hidden md:flex flex-1 flex-col bg-stone-950">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 px-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <Avatar className={cn("h-11 w-11 border-2 border-primary/30")}>
                  <AvatarImage src={selectedChat.photoURL || selectedChat.photo} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">{(selectedChat.displayName || selectedChat.name)?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{selectedChat.displayName || selectedChat.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] text-stone-400 uppercase font-black tracking-[0.2em]">En ligne — Chat direct sécurisé</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white rounded-full"><Phone className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white rounded-full"><Video className="h-5 w-5" /></Button>
                <Separator orientation="vertical" className="h-6 bg-white/5 mx-2" />
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white rounded-full"><MoreVertical className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-center mb-10">
                  <Badge variant="secondary" className="bg-white/5 text-stone-500 text-[9px] px-4 rounded-full uppercase tracking-[0.3em] font-black border-white/5">Session de messagerie sécurisée</Badge>
                </div>

                {messages.length > 0 ? messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.uid;
                  return (
                    <div key={msg.id} className={cn(
                      "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 mt-1 border border-white/10 shrink-0">
                          <AvatarImage src={selectedChat.photoURL} />
                          <AvatarFallback>{selectedChat.displayName?.slice(0,1)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("space-y-1.5", isMe ? "text-right" : "text-left")}>
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                          isMe 
                            ? "bg-primary text-black font-medium rounded-tr-none" 
                            : "bg-white/5 border border-white/5 text-stone-200 rounded-tl-none"
                        )}>
                          <p>{msg.text}</p>
                        </div>
                        <p className="text-[8px] text-stone-600 font-bold uppercase">
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center space-y-4">
                    <MessageSquare className="h-12 w-12 text-primary" />
                    <p className="text-stone-500 italic text-sm">Aucun message pour le moment.<br/>Engagez la conversation avec {selectedChat.displayName}.</p>
                  </div>
                )}
                <div ref={scrollEndRef} />
              </div>
            </ScrollArea>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-6 md:p-8 bg-white/5 border-t border-white/5 backdrop-blur-3xl">
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <Button type="button" variant="ghost" size="icon" className="text-stone-500 hover:text-primary rounded-full h-12 w-12 bg-white/5"><Paperclip className="h-5 w-5" /></Button>
                <div className="relative flex-1">
                  <Input 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Écrivez votre message..." 
                    className="pr-12 bg-white/5 border-white/10 rounded-2xl h-14 text-white focus-visible:ring-primary shadow-inner placeholder:text-stone-600" 
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white h-10 w-10">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!messageText.trim() || isSending}
                  size="icon" 
                  className="rounded-2xl h-14 w-14 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-90"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <SendHorizonal className="h-6 w-6 text-black" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/10">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
            <div>
                <h3 className="text-3xl font-black font-display text-white mb-2 tracking-tight">Vos Conversations</h3>
                <p className="text-stone-500 max-w-sm font-light italic leading-relaxed">
                  Sélectionnez un membre de la communauté pour échanger sur vos récits favoris ou collaborer sur un projet.
                </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
