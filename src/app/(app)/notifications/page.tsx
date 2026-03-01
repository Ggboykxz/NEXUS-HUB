'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, Clock, Heart, MessageSquare, Star, Trash2, Award, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const notifRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notifRef, orderBy('createdAt', 'desc'), limit(30));

    const unsubscribeNotifications = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      console.error("Notifications listener error:", error);
    });

    return () => unsubscribeNotifications();
  }, [currentUser]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const ref = doc(db, 'users', currentUser.uid, 'notifications', id);
      await updateDoc(ref, { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      const unread = notifications.filter(n => !n.read);
      unread.forEach(n => {
        const ref = doc(db, 'users', currentUser.uid, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
      toast({ title: "Toutes les notifications marquées comme lues" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const ref = doc(db, 'users', currentUser.uid, 'notifications', id);
      await deleteDoc(ref);
      toast({ title: "Notification supprimée" });
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'chapter': return <Bell className="h-4 w-4 text-primary" />;
      case 'like': return <Heart className="h-4 w-4 text-destructive" />;
      case 'new_follower': return <Award className="h-4 w-4 text-emerald-500" />;
      case 'community': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Consultation des messagers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-display mb-2 tracking-tighter">Notifications</h1>
          <p className="text-stone-500 italic font-light">"Restez au courant de l'actualité de vos univers préférés."</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          disabled={notifications.filter(n => !n.read).length === 0}
          className="rounded-full border-white/10 hover:bg-primary/10 hover:text-primary transition-all font-bold text-xs"
        >
          <Check className="mr-2 h-4 w-4" /> Marquer tout comme lu
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notif) => {
          const date = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date();
          const relativeTime = formatDistanceToNow(date, { addSuffix: true, locale: fr });

          return (
            <Card key={notif.id} className={cn(
              "transition-all duration-500 hover:bg-muted/30 border-l-4 group rounded-2xl overflow-hidden",
              notif.read ? "border-l-transparent opacity-60" : "border-l-primary bg-primary/[0.03] shadow-lg shadow-primary/5"
            )}>
              <CardContent className="p-5 flex items-start gap-5">
                <div className="mt-1">
                  <div className="bg-stone-900 rounded-2xl p-3 border border-white/5 shadow-inner">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={notif.link || '#'} 
                    className="block group/link"
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-lg text-white group-hover/link:text-primary transition-colors leading-tight">
                        {notif.fromDisplayName} {notif.message}
                      </h3>
                      <span className="text-[10px] text-stone-500 whitespace-nowrap flex items-center gap-1 font-bold uppercase tracking-tighter">
                        <Clock className="h-3 w-3" /> {relativeTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={notif.fromPhoto} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{notif.fromDisplayName?.slice(0,1)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-stone-400 font-medium italic">"Appuyez pour voir le profil"</p>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  {!notif.read && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-stone-600 hover:text-emerald-500 rounded-full h-10 w-10 bg-white/5" 
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Marquer comme lu"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-stone-600 hover:text-rose-500 rounded-full h-10 w-10 bg-white/5" 
                    onClick={() => handleDelete(notif.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
            <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
              <Bell className="h-10 w-10 text-stone-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-white tracking-tighter">Calme plat dans le Hub</h3>
              <p className="text-stone-500 max-w-xs mx-auto italic font-light">"Les messagers n'ont encore rien apporté pour vous. Explorez les récits pour susciter l'intérêt !"</p>
            </div>
            <Button asChild variant="outline" className="rounded-full px-10 h-12 border-primary text-primary font-black uppercase text-xs tracking-widest">
              <Link href="/stories">Parcourir le catalogue</Link>
            </Button>
          </div>
        )}
      </div>

      {notifications.length > 10 && (
        <div className="mt-12 text-center">
          <Button variant="link" className="text-stone-500 font-bold uppercase tracking-widest text-[10px] hover:text-primary">
            Voir les archives plus anciennes
          </Button>
        </div>
      )}
    </div>
  );
}