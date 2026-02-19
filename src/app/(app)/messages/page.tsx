'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { readers } from "@/lib/data";
import { Paperclip, SendHorizonal, Smile, MoreVertical, Search, Phone, Video, Check } from "lucide-react";
import Link from "next/link";
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const currentUserId = 'reader-1';
  const otherReaders = readers.filter(r => r.id !== currentUserId);
  const [selectedReader, setSelectedReader] = useState(otherReaders[0]);
  const [messageText, setMessageText] = useState('');

  return (
    <div className="h-[calc(100vh-5rem)] flex container mx-auto max-w-7xl px-0 border rounded-2xl overflow-hidden my-4 bg-card shadow-2xl">
      {/* Sidebar with conversations */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b bg-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-display">Messages</h2>
            <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une discussion..." className="pl-9 bg-muted/50 border-none rounded-full h-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {otherReaders.map((reader) => (
            <div 
              key={reader.id} 
              onClick={() => setSelectedReader(reader)}
              className={cn(
                "flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-all relative border-b border-border/50",
                selectedReader.id === reader.id && "bg-primary/5 border-r-4 border-r-primary"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={reader.avatar.imageUrl} alt={reader.name} />
                  <AvatarFallback>{reader.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="font-bold truncate">{reader.name}</p>
                  <span className="text-[10px] text-muted-foreground">10:33 AM</span>
                </div>
                <p className="text-sm text-muted-foreground truncate font-light">Salut ! Tu as lu le dernier chapitre ?</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Main chat area */}
      <main className="hidden md:flex flex-1 flex-col bg-background">
        {/* Chat header */}
        <div className="p-4 px-6 border-b flex items-center justify-between bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={selectedReader.avatar.imageUrl} alt={selectedReader.name} />
              <AvatarFallback>{selectedReader.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${selectedReader.id}`}>
                  <h3 className="text-lg font-bold hover:text-primary transition-colors">{selectedReader.name}</h3>
              </Link>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">En ligne</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground"><Video className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="h-5 w-5" /></Button>
          </div>
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-8">
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-4 rounded-full uppercase tracking-tighter">Aujourd'hui</Badge>
            </div>

            <div className="flex justify-start gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1 border">
                <AvatarImage src={selectedReader.avatar.imageUrl} />
                <AvatarFallback>{selectedReader.name.slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="bg-muted p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm leading-relaxed">Salut ! J'ai vu qu'on aimait tous les deux <span className="text-primary font-bold">"The Orisha Chronicles"</span>. T'as pensé quoi du dernier chapitre ?</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-bold">10:30 AM</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 ml-auto max-w-[80%]">
              <div>
                <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-none shadow-lg">
                  <p className="text-sm leading-relaxed">Hey ! Ah oui, il était incroyable ! La fin m'a laissé sans voix. Je ne m'attendais pas du tout à cette révélation. Tu suis d'autres œuvres du même genre ?</p>
                </div>
                <div className="flex justify-end items-center gap-1 mt-1.5">
                  <p className="text-[10px] text-muted-foreground font-bold">10:32 AM</p>
                  <span className="text-primary"><Check className="h-3 w-3" /></span>
                </div>
              </div>
            </div>

             <div className="flex justify-start gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1 border">
                <AvatarImage src={selectedReader.avatar.imageUrl} />
                <AvatarFallback>{selectedReader.name.slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="bg-muted p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm leading-relaxed">Pareil ! J'ai hâte de voir comment l'auteur va développer ça. Je lis aussi <span className="text-primary font-bold">"Néo-Dakar 2088"</span> en ce moment, c'est très différent mais l'univers est fou !</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-bold">10:33 AM</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Chat input */}
        <div className="p-6 border-t bg-card/30">
          <div className="relative flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Paperclip className="h-5 w-5" /></Button>
            <div className="relative flex-1">
              <Input 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Écrivez votre message..." 
                className="pr-12 bg-muted/50 border-none rounded-2xl h-12 focus-visible:ring-primary" 
              />
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary h-8 w-8">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <Button size="icon" className="rounded-2xl h-12 w-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
