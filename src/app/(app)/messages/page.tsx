'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { 
  Paperclip, SendHorizonal, Smile, MoreVertical, Search, 
  Phone, Video, Check, CheckCheck, Loader2, MessageSquare, 
  ChevronRight, ArrowLeft, ShieldCheck, Zap, Mic, Plus, File
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
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Logo } from '@/components/icons/logo';
import { getCloudinarySignature } from '@/lib/actions/cloudinary-actions';

const formatChatDate = (date: Date) => {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: fr });
  return format(date, 'dd/MM/yy');
};

function NewConversationDialog({ currentUser, onUserSelect }: { currentUser: User | null, onUserSelect: (user: UserProfile) => void }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchUsers, setSearchUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      if (!currentUser) return;
      setIsSearching(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(20));
        const snap = await getDocs(q);
        const fetched = snap.docs
          .map(d => ({ ...d.data() } as UserProfile))
          .filter(u => u.uid !== currentUser.uid);
        setSearchUsers(fetched);
      } catch (error) {
        console.error("Error fetching users for new conversation:", error);
      } finally {
        setIsSearching(false);
      }
    }
    fetchUsers();
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return searchUsers;
    return searchUsers.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchUsers, searchTerm]);

  return (
    <DialogContent className="bg-stone-950 border-white/10 text-white p-0 max-w-md">
      <DialogHeader className="p-6 pb-4">
        <DialogTitle className="font-display tracking-tight text-2xl">Nouvelle Conversation</DialogTitle>
      </DialogHeader>
      <div className="px-6 pb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un utilisateur..." 
            className="pl-11 h-10 rounded-xl bg-white/5 border-none text-xs focus-visible:ring-primary shadow-inner placeholder:text-stone-700" 
          />
        </div>
      </div>
      <ScrollArea className="h-[50vh]">
        <div className="divide-y divide-white/[0.02] px-2">
          {isSearching ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.map(user => (
            <div key={user.uid} onClick={() => onUserSelect(user)} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
              <Avatar className="h-10 w-10 border border-stone-800">
                <AvatarImage src={user.photoURL} className="object-cover" />
                <AvatarFallback className="bg-stone-800 text-stone-400 font-bold">{user.displayName?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-sm text-stone-100">{user.displayName}</p>
                <p className="text-xs text-stone-500 capitalize">{user.role || 'Utilisateur'}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

export default function MessagesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, { text: string, time: any }>>({});
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowPicker(false);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    async function fetchContacts() {
      if (!currentUser) return;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(100));
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

  useEffect(() => {
    if (!currentUser || !selectedChat) {
      setMessages([]);
      return;
    }

    const participants = [currentUser.uid, selectedChat.uid].sort();
    const convId = participants.join('_');

    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(150));

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

      setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !selectedChat) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Type de fichier non supporté.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({ title: "Fichier trop volumineux.", description: "La taille maximum est de 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { signature, timestamp, apiKey, cloudName } = await getCloudinarySignature({ folder: 'nexushub/messages' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'nexushub/messages');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      const { secure_url, resource_type } = data;

      const participants = [currentUser.uid, selectedChat.uid].sort();
      const convId = participants.join('_');
      const msgsRef = collection(db, 'conversations', convId, 'messages');

      const messageData = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Voyageur',
        text: '[Fichier]',
        fileUrl: secure_url,
        fileType: resource_type,
        createdAt: serverTimestamp(),
        read: false,
        type: resource_type === 'image' ? 'image' : 'file',
      };

      await addDoc(msgsRef, messageData);

      const convRef = doc(db, 'conversations', convId);
      await setDoc(convRef, {
        lastMessage: `[${resource_type === 'image' ? 'Image' : 'Fichier'}]`,
        lastMessageAt: serverTimestamp(),
        participants,
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Erreur d'upload", description: "Impossible d'envoyer le fichier.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // Reset file input
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (searchTerm.trim()) {
      result = result.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return result.sort((a, b) => {
      const timeA = lastMessages[a.uid]?.time?.seconds || 0;
      const timeB = lastMessages[b.uid]?.time?.seconds || 0;
      return timeB - timeA;
    });
  }, [users, lastMessages, searchTerm]);

  const handleStartNewConversation = (user: UserProfile) => {
    setSelectedChat(user);
    setIsNewChatDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Nexus Dispatcher...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-stone-950 text-white font-sans">
      {/* 1. SIDEBAR CONTACTS */}
      <aside className={cn(
        "w-full md:w-80 lg:w-[420px] border-r border-white/5 bg-stone-900/50 backdrop-blur-3xl flex flex-col transition-all duration-500",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-5 border-b border-white/5 space-y-5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-2xl font-black font-display tracking-tight text-white">Discussions</h2>
            <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-stone-400"><Plus className="h-5 w-5" /></Button>
              </DialogTrigger>
              <NewConversationDialog currentUser={currentUser} onUserSelect={handleStartNewConversation} />
            </Dialog>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une discussion..." 
              className="pl-11 h-10 rounded-xl bg-white/5 border-none text-xs focus-visible:ring-primary shadow-inner placeholder:text-stone-700" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-white/[0.02]">
            {filteredUsers.map((user) => {
              const unreadCount = unreadCounts[user.uid] || 0;
              const lastMsgData = lastMessages[user.uid];
              const lastMsgText = lastMsgData?.text || 'Commencer une conversation';
              const lastMsgDate = lastMsgData?.time?.toDate ? lastMsgData.time.toDate() : null;

              return (
                <div 
                  key={user.uid} 
                  onClick={() => setSelectedChat(user)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all relative",
                    selectedChat?.uid === user.uid ? "bg-white/5" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12 border border-stone-800 shadow-xl">
                      <AvatarImage src={user.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-stone-800 text-stone-400 font-black text-lg">{user.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-lg" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-bold truncate text-[14px] text-stone-100">
                        {user.displayName}
                      </p>
                      {lastMsgDate && (
                        <span className={cn("text-[10px] font-medium", unreadCount > 0 ? "text-emerald-500" : "text-stone-500")}>
                          {formatChatDate(lastMsgDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-xs truncate font-light leading-tight",
                        unreadCount > 0 ? "text-stone-200 font-medium" : "text-stone-500"
                      )}>
                        {lastMsgText}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="bg-emerald-500 text-black border-none h-5 min-w-5 flex items-center justify-center p-0 rounded-full text-[10px] font-black animate-in zoom-in duration-300 shrink-0">
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
      <main className="flex-1 flex flex-col bg-[#0a0a0a] relative">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 md:px-6 h-16 border-b border-white/5 flex items-center justify-between bg-stone-900/80 backdrop-blur-2xl z-20 shadow-lg">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} className="md:hidden h-10 w-10 rounded-full text-stone-500"><ArrowLeft className="h-5 w-5" /></Button>
                <div className="relative cursor-pointer group" onClick={() => window.location.href = `/profile/${selectedChat.uid}`}>
                  <Avatar className="h-10 w-10 border border-white/10 group-hover:border-primary/50 transition-all">
                    <AvatarImage src={selectedChat.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-stone-800 text-stone-400 font-bold">{selectedChat.displayName?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedChat.displayName}</h3>
                  <div className="flex items-center gap-2">
                    {isOtherUserTyping ? (
                      <span className="text-[10px] font-bold text-emerald-500 italic animate-pulse">en train d'écrire...</span>
                    ) : (
                      <p className="text-[10px] text-stone-500 font-medium">en ligne</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-stone-400 hover:text-primary"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-stone-400 hover:text-primary"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-stone-400"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 relative">
              {/* WhatsApp doodle pattern background */}
              <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dfzrjuaap/image/upload/v1740330000/whatsapp-bg-pattern.png')] opacity-[0.04] pointer-events-none z-0" />
              
              <div className="max-w-4xl mx-auto space-y-10 px-6 py-8 relative z-10">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="space-y-6">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-stone-900/90 backdrop-blur-md border-white/5 text-[9px] uppercase font-bold text-stone-500 px-4 py-1 rounded-xl shadow-2xl">
                        {date}
                      </Badge>
                    </div>
                    {msgs.map((msg) => {
                      const isMe = msg.senderId === currentUser?.uid;
                      return (
                        <div key={msg.id} className={cn(
                          "flex gap-3 max-w-[85%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-1 duration-300",
                          isMe ? "ml-auto" : "mr-auto"
                        )}>
                          <div className={cn(
                            "p-3 rounded-2xl shadow-xl text-[14px] leading-relaxed relative",
                            isMe 
                              ? "bg-primary text-black font-medium rounded-tr-none" 
                              : "bg-[#1f1f1f] border border-white/5 text-stone-200 rounded-tl-none",
                            (msg.type === 'image') && 'p-1 bg-transparent border-none'
                          )}>
                            {/* Tails implementation */}
                            {msg.type !== 'image' && (
                              <div className={cn(
                                "absolute top-0 w-3 h-3",
                                isMe 
                                  ? "-right-2 bg-primary rounded-bl-full" 
                                  : "-left-2 bg-[#1f1f1f] rounded-br-full"
                              )} />
                            )}
                            
                            {msg.fileUrl && msg.fileType === 'image' ? (
                              <Image 
                                src={msg.fileUrl}
                                alt="Image partagée"
                                width={300}
                                height={300}
                                className="rounded-lg cursor-pointer transition-all hover:opacity-90"
                                onClick={() => window.open(msg.fileUrl, '_blank')}
                              />
                            ) : msg.fileUrl ? (
                              <a 
                                href={msg.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 underline text-primary hover:text-primary/80"
                              >
                                <File className="h-6 w-6" />
                                <span>{msg.text}</span>
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}

                            <div className={cn(
                              "flex items-center gap-1.5 mt-1 justify-end",
                              isMe ? "text-stone-900/60" : "text-stone-500"
                            )}>
                              <span className="text-[9px] font-bold">
                                {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : ''}
                              </span>
                              {isMe && (
                                <div className="flex">
                                  {msg.read ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-stone-600" />
                                  )}
                                </div>
                              )}
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

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-stone-900/90 border-t border-white/5 backdrop-blur-3xl">
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <div className="flex items-center gap-1 shrink-0">
                  <Popover open={showPicker} onOpenChange={setShowPicker}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-stone-500 hover:text-primary rounded-full h-10 w-10 transition-colors">
                        <Smile className="h-6 w-6" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 border-none w-auto">
                      <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} />
                    </PopoverContent>
                  </Popover>
                  
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-stone-500 hover:text-primary rounded-full h-10 w-10 transition-colors"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                  </Button>
                </div>
                
                <div className="relative flex-1 group">
                  <Input 
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder="Écrivez un message..." 
                    className="bg-white/5 border-none rounded-full h-11 text-white focus-visible:ring-primary shadow-inner placeholder:text-stone-700 transition-all text-sm px-6" 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!messageText.trim() || isSending}
                  size="icon" 
                  className={cn(
                    "rounded-full h-11 w-11 transition-all active:scale-90 shrink-0 shadow-2xl",
                    !messageText.trim() ? "bg-white/5 text-stone-500" : "bg-primary hover:bg-primary/90 text-black"
                  )}
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : !messageText.trim() ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <SendHorizonal className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-10 animate-in zoom-in-95 duration-1000">
            <div className="relative">
                <div className="bg-primary/10 p-16 rounded-full border border-primary/10 shadow-inner relative overflow-hidden group">
                  <Logo className="h-24 w-24 opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
                </div>
                <Zap className="absolute -top-4 -right-4 h-12 w-12 text-primary animate-pulse fill-current drop-shadow-[0_0_15px_rgba(212,168,67,0.5)]" />
            </div>
            <div className="space-y-4 max-w-sm">
                <h3 className="text-4xl font-display font-black text-white tracking-tight gold-resplendant">NexusHub pour Web</h3>
                <p className="text-stone-500 font-light italic leading-relaxed text-sm">
                  "Envoyez et recevez des messages sans laisser votre téléphone allumé. Le Hub synchronise toutes vos légendes en temps réel."
                </p>
            </div>
            
            <div className="pt-12 border-t border-white/5 w-full max-w-xs flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-stone-700 tracking-[0.4em]">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Chiffrement de Bout en Bout
              </div>
              <p className="text-[8px] text-stone-800 font-bold uppercase tracking-widest">Version 2.5.0 - Secure Node</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
