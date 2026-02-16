import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { artists } from "@/lib/data";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar with conversations */}
      <aside className="w-1/4 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold">Messagerie</h2>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b"
            >
              <Avatar>
                <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                <AvatarFallback>{artist.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{artist.name}</p>
                <p className="text-sm text-muted-foreground truncate">Oui, ça me semble parfait ! On...</p>
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
            <AvatarImage src={artists[0].avatar.imageUrl} alt={artists[0].name} data-ai-hint={artists[0].avatar.imageHint} />
            <AvatarFallback>{artists[0].name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{artists[0].name}</h3>
            <p className="text-sm text-green-500">En ligne</p>
          </div>
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-6 bg-background">
          <div className="space-y-6">
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg max-w-md">
                <p>Salut ! J'ai regardé tes derniers croquis pour le chapitre 5. C'est incroyable !</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-md">
                <p>Merci beaucoup ! Je suis content que ça te plaise. J'hésitais sur le design du nouveau personnage.</p>
                <p className="text-xs text-primary-foreground/70 mt-1 text-right">10:32 AM</p>
              </div>
            </div>
             <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg max-w-md">
                <p>Ne t'en fais pas, c'est parfait. L'expression sur son visage est très réussie.</p>
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
