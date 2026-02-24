'use client';

import { useState, useEffect } from 'react';
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
import { collection, query, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('direct');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messageText, setMessageText] = useState('');

  // Simulation de chats d'équipe
  const projectChats = [
    { 
      id: 'p1', 
      type: 'project', 
      name: 'Orisha Chronicles - Team', 
      members: 4, 
      lastMsg: 'Amina: Le lineart du Chap 14 est fini.',
      photo: 'https://res.cloudinary.com/demo/image/upload/v1/samples/stories/orisha-chronicles.jpg'
    },
    { 
      id: 'p2', 
      type: 'project', 
      name: 'Cyber-Reines - Prod', 
      members: 3, 
      lastMsg: 'Koffi: J\'ai mis à jour les palettes.',
      photo: 'https://res.cloudinary.com/demo/image/upload/v1/samples/stories/scifi-africa.jpg'
    }
  ];

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          ...doc.data()
        } as UserProfile));
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
          setSelectedChat(fetchedUsers[0]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

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
                      <AvatarFallback>{user.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-bold text-white truncate text-sm">{user.displayName}</p>
                      <span className="text-[9px] text-stone-500 font-bold uppercase">10:33</span>
                    </div>
                    <p className="text-xs text-stone-400 truncate font-light italic">"Salut ! Tu as lu le dernier..."</p>
                  </div>
                </div>
              ))
            ) : (
              projectChats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 border-transparent",
                    selectedChat?.id === chat.id ? "bg-emerald-500/10 border-emerald-500/20" : "hover:bg-white/5"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white/5 rounded-xl overflow-hidden">
                      <AvatarImage src={chat.photo} className="object-cover" />
                      <AvatarFallback className="rounded-xl">P</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] px-1 h-4 border-stone-900 min-w-[16px] flex items-center justify-center">3</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-black text-white truncate text-sm tracking-tight">{chat.name}</p>
                    </div>
                    <p className="text-xs text-stone-400 truncate font-medium flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-emerald-500" /> {chat.members} co-créateurs
                    </p>
                  </div>
                </div>
              ))
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
                <Avatar className={cn("h-11 w-11 border-2", selectedChat.type === 'project' ? "rounded-xl border-emerald-500/30" : "border-primary/30")}>
                  <AvatarImage src={selectedChat.photoURL || selectedChat.photo} className="object-cover" />
                  <AvatarFallback>{(selectedChat.displayName || selectedChat.name)?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{selectedChat.displayName || selectedChat.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] text-stone-400 uppercase font-black tracking-[0.2em]">
                        {selectedChat.type === 'project' ? 'Canal de Production Actif' : 'En ligne'}
                    </p>
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
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-white/5 text-stone-500 text-[9px] px-4 rounded-full uppercase tracking-[0.3em] font-black border-white/5">Session Sécurisée</Badge>
                </div>

                {/* Simulated Project Conversation */}
                {selectedChat.type === 'project' ? (
                    <div className="space-y-8">
                        <div className="flex justify-start gap-4 max-w-[85%]">
                            <Avatar className="h-9 w-9 mt-1 border border-white/10"><AvatarImage src="https://picsum.photos/seed/amina/100/100" /></Avatar>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Amina (Dessinatrice)</p>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none shadow-sm text-stone-200">
                                    <p className="text-sm leading-relaxed">Salut l'équipe ! J'ai terminé l'encrage des 5 premières pages. Koffi, tu peux commencer à poser les bases de couleurs ?</p>
                                    <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center"><Zap className="h-5 w-5 text-emerald-500" /></div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-white">Ch14_Lineart_v1.psd</p>
                                            <p className="text-[8px] text-stone-500">12.4 MB &bull; Ajouté à l'Atelier</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-emerald-500">VOIR</Button>
                                    </div>
                                </div>
                                <p className="text-[9px] text-stone-600 font-bold">10:30 AM</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 ml-auto max-w-[85%]">
                            <div className="space-y-2 text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Vous (Scénariste)</p>
                                <div className="bg-primary text-black p-4 rounded-2xl rounded-tr-none shadow-2xl font-medium">
                                    <p className="text-sm leading-relaxed">Génial Amina ! Le rendu est super dynamique. J'ajoute les bulles de dialogue finales cet après-midi.</p>
                                </div>
                                <div className="flex justify-end items-center gap-1.5 mt-1.5">
                                    <p className="text-[9px] text-stone-600 font-bold">10:35 AM</p>
                                    <span className="text-primary"><Check className="h-3 w-3" /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                        <Zap className="h-12 w-12 text-primary mb-4" />
                        <p className="text-stone-500 italic text-sm">Début de votre conversation avec {selectedChat.displayName}...</p>
                    </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat input */}
            <div className="p-6 md:p-8 bg-white/5 border-t border-white/5 backdrop-blur-3xl">
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-stone-500 hover:text-primary rounded-full h-12 w-12 bg-white/5"><Paperclip className="h-5 w-5" /></Button>
                <div className="relative flex-1">
                  <Input 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Écrivez un message à l'équipe..." 
                    className="pr-12 bg-white/5 border-white/10 rounded-2xl h-14 text-white focus-visible:ring-primary shadow-inner placeholder:text-stone-600" 
                  />
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white h-10 w-10">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button size="icon" className="rounded-2xl h-14 w-14 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-90">
                  <SendHorizonal className="h-6 w-6 text-black" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/10">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
            <div>
                <h3 className="text-3xl font-black font-display text-white mb-2 tracking-tight">Vos Conversations</h3>
                <p className="text-stone-500 max-w-sm font-light italic leading-relaxed">
                  Sélectionnez un co-créateur ou un canal de projet pour coordonner votre prochaine production légendaire.
                </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
