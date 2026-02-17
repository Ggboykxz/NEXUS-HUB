'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { readers } from "@/lib/data";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  // Simulate being logged in as 'Léa Dubois' (reader-1)
  const currentUserId = 'reader-1';
  // Don't show the current user in the conversation list
  const otherReaders = readers.filter(r => r.id !== currentUserId);

  // We'll use the first other reader for the active chat simulation
  const activeChatPartner = otherReaders[0];

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar with conversations */}
      <aside className="w-1/4 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold font-display">Messagerie</h2>
          <p className="text-sm text-muted-foreground">Discussions entre lecteurs</p>
        </div>
        <ScrollArea className="h-[calc(100%-5.5rem)]">
          {otherReaders.map((reader) => (
            <div key={reader.id} className="block border-b">
              <div
                className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Avatar>
                  <AvatarImage src={reader.avatar.imageUrl} alt={reader.name} data-ai-hint={reader.avatar.imageHint} />
                  <AvatarFallback>{reader.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{reader.name}</p>
                  <p className="text-sm text-muted-foreground truncate">Salut ! Tu as lu le dernier chapitre ?</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Main chat area */}
      <main className="w-3/4 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b flex items-center gap-4 bg-card">
          <Avatar>
            <AvatarImage src={activeChatPartner.avatar.imageUrl} alt={activeChatPartner.name} data-ai-hint={activeChatPartner.avatar.imageHint} />
            <AvatarFallback>{activeChatPartner.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profile/${activeChatPartner.id}`}>
                <h3 className="text-xl font-semibold hover:text-primary transition-colors">{activeChatPartner.name}</h3>
            </Link>
            <p className="text-sm text-emerald-400">En ligne</p>
          </div>
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-6 bg-background">
          <div className="space-y-6">
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg max-w-md">
                <p>Salut ! J'ai vu qu'on aimait tous les deux "The Orisha Chronicles". T'as pensé quoi du dernier chapitre ?</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-md">
                <p>Hey ! Ah oui, il était incroyable ! La fin m'a laissé sans voix. Je ne m'attendais pas du tout à cette révélation.</p>
                <p className="text-xs text-primary-foreground/70 mt-1 text-right">10:32 AM</p>
              </div>
            </div>
             <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg max-w-md">
                <p>Pareil ! J'ai hâte de voir comment l'auteur va développer ça. Tu suis d'autres œuvres du même genre ?</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">10:33 AM</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Chat input */}
        <div className="p-4 border-t bg-card">
          <div className="relative">
            <Input placeholder="Écrivez votre message..." className="pr-28" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon"><Smile className="w-5 h-5 text-muted-foreground" /></Button>
              <Button size="icon"><SendHorizonal className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
