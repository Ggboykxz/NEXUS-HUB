'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, Clock, Heart, MessageSquare, Star, Trash2, Award } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mockNotifications = [
  {
    id: 1,
    type: 'chapter',
    title: 'Nouveau chapitre disponible !',
    message: 'Le chapitre 3 de "The Orisha Chronicles" est en ligne.',
    time: 'Il y a 5 minutes',
    read: false,
    author: 'Jelani Adebayo',
    avatar: 'https://images.unsplash.com/photo-1530785602056-02a1e0c2f9e4',
    link: '/webtoon/les-chroniques-d-orisha'
  },
  {
    id: 2,
    type: 'artist',
    title: 'Nouvelle série lancée',
    message: 'Amina Diallo a commencé "Cyber-Reines".',
    time: 'Il y a 2 heures',
    read: false,
    author: 'Amina Diallo',
    avatar: 'https://images.unsplash.com/photo-1602785139708-1442c75f6b28',
    link: '/artiste/amina-diallo'
  },
  {
    id: 3,
    type: 'like',
    title: 'Votre commentaire a été aimé',
    message: 'Jelani Adebayo a aimé votre commentaire sur "The Orisha Chronicles".',
    time: 'Hier',
    read: true,
    author: 'Jelani Adebayo',
    avatar: 'https://images.unsplash.com/photo-1530785602056-02a1e0c2f9e4',
    link: '/webtoon/les-chroniques-d-orisha'
  },
  {
    id: 4,
    type: 'community',
    title: 'Nouveau message sur le forum',
    message: 'Une réponse a été postée sur "Théories sur le prochain arc".',
    time: 'Il y a 2 jours',
    read: true,
    author: 'ComicReaderX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    link: '/forums/thread-1'
  }
];

export default function NotificationsPage() {
  const { toast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'chapter': return <Bell className="h-4 w-4 text-primary" />;
      case 'like': return <Heart className="h-4 w-4 text-destructive" />;
      case 'artist': return <Award className="h-4 w-4 text-emerald-500" />;
      case 'community': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Notifications</h1>
          <p className="text-muted-foreground">Restez au courant de l'actualité de vos univers préférés.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast({title: "Toutes les notifications marquées comme lues"})}>
          <Check className="mr-2 h-4 w-4" /> Marquer tout comme lu
        </Button>
      </div>

      <div className="space-y-4">
        {mockNotifications.map((notif) => (
          <Card key={notif.id} className={cn(
            "transition-all hover:bg-muted/30 border-l-4",
            notif.read ? "border-l-transparent opacity-70" : "border-l-primary bg-primary/5"
          )}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1">
                <div className="bg-background rounded-full p-2 border shadow-sm">
                  {getIcon(notif.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={notif.link} className="block group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">{notif.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {notif.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={notif.avatar} />
                      <AvatarFallback>{notif.author.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{notif.author}</p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{notif.message}</p>
                </Link>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => toast({title: "Notification supprimée"})}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button variant="link" className="text-muted-foreground">Voir les notifications plus anciennes</Button>
      </div>
    </div>
  );
}
