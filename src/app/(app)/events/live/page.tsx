'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Users, MessageSquare, Heart, Share2, 
  Settings, Maximize2, Mic, Video, Send, Zap, 
  Flame, Award, Sparkles, Smile
} from 'lucide-react';
import Image from 'next/image';

export default function NexusHubLivePage() {
  const [chatMsg, setChatMsg] = useState('');

  const currentStream = {
    title: "Lineart & Storytelling : Les secrets d'Orisha",
    artist: "Jelani Adebayo",
    viewers: 1450,
    likes: 890,
    tags: ["Tutoriel", "Clip Studio", "Action"]
  };

  const mockChat = [
    { id: 1, user: "Amina42", text: "Incroyable le rendu de la foudre !", color: "text-primary" },
    { id: 2, user: "Koffi_Draw", text: "Quel pinceau tu utilises pour l'encrage ?", color: "text-emerald-500" },
    { id: 3, user: "NexusFan", text: "On peut avoir un don d'AfriCoins ? 🪙", color: "text-amber-500" },
    { id: 4, user: "LegendScribe", text: "Le chapitre 15 va être légendaire.", color: "text-rose-500" },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-stone-950 overflow-hidden">
      {/* 1. PLAYER AREA */}
      <main className="flex-1 flex flex-col min-w-0 border-r border-white/5">
        <div className="flex-1 relative bg-black group">
          {/* Placeholder for Video Player */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <Play className="h-24 w-24 text-white animate-pulse" />
          </div>
          <Image src="https://picsum.photos/seed/livestream/1200/800" alt="Live" fill className="object-cover opacity-60" />
          
          {/* UI Overlays */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <Badge className="bg-rose-600 border-none px-3 py-1 font-black text-[10px] animate-pulse">DIRECT</Badge>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold text-white border border-white/10">
              <Users className="h-3 w-3 text-primary" /> {currentStream.viewers} spectateurs
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      <aside className="w-full lg:w-[380px] bg-stone-900 flex flex-col border-l border-white/5">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg"><MessageSquare className="h-4 w-4 text-primary" /></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Discussion Live</h2>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px]">RALENTI ACTIVÉ</Badge>
        </div>

        <ScrollArea className="flex-1 p-5">
          <div className="space-y-6">
            {mockChat.map((msg) => (
              <div key={msg.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 shrink-0 border border-white/5"><AvatarImage src={`https://picsum.photos/seed/u${msg.id}/100/100`} /></Avatar>
                <div className="min-w-0">
                  <p className={cn("text-[10px] font-black uppercase tracking-tighter mb-0.5", msg.color)}>{msg.user}</p>
                  <p className="text-sm text-stone-300 leading-snug font-light italic">"{msg.text}"</p>
                </div>
              </div>
            ))}
            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl text-center space-y-2">
              <Sparkles className="h-5 w-5 text-primary mx-auto" />
              <p className="text-[10px] font-bold text-stone-400 uppercase leading-tight">Envoyez 50 🪙 pour mettre votre message en avant !</p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-5 bg-black/40 border-t border-white/5 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input 
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Envoyez un message..." 
                className="bg-white/5 border-white/10 rounded-xl h-11 text-xs pr-10"
              />
              <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white h-8 w-8"><Smile className="h-4 w-4" /></Button>
            </div>
            <Button onClick={() => setChatMsg('')} disabled={!chatMsg.trim()} size="icon" className="h-11 w-11 rounded-xl bg-primary text-black shadow-lg shadow-primary/20"><Send className="h-4 w-4" /></Button>
          </div>
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-tighter text-stone-500 hover:text-primary gap-1.5"><Zap className="h-3 w-3" /> Don AfriCoins</Button>
            </div>
            <span className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">Connecté à l'API Live</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
