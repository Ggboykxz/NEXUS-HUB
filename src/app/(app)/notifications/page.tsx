'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bell, Check, Clock, Heart, MessageSquare, Star, 
  Trash2, Award, Loader2, Sparkles, BookOpen, 
  Users, Coins, Settings, Info, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, query, orderBy, limit, onSnapshot, 
  doc, updateDoc, deleteDoc, writeBatch, getDocs, where 
} from 'firebase/firestore';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type NotifFilter = 'all' | 'chapters' | 'social' | 'africoins' | 'system';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotifFilter>('all');

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
    const q = query(notifRef, orderBy('createdAt', 'desc'), limit(50));

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

  // --- FILTERING LOGIC ---
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'chapters') return n.type === 'chapter' || n.type === 'new_chapter';
      if (activeFilter === 'social') return ['new_follower', 'donation', 'mentorship_request', 'new_reply'].includes(n.type);
      if (activeFilter === 'africoins') return ['streak_reward', 'donation', 'purchase'].includes(n.type);
      if (activeFilter === 'system') return ['system', 'maintenance', 'level_up'].includes(n.type);
      return true;
    });
  }, [notifications, activeFilter]);

  // --- GROUPING LOGIC ---
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any[]> = {
      "Aujourd'hui": [],
      "Hier": [],
      "Cette semaine": [],
      "Plus ancien": []
    };

    filteredNotifications.forEach(n => {
      const date = n.createdAt?.toDate ? n.createdAt.toDate() : new Date();
      if (isToday(date)) groups["Aujourd'hui"].push(n);
      else if (isYesterday(date)) groups["Hier"].push(n);
      else if (isThisWeek(date)) groups["Cette semaine"].push(n);
      else groups["Plus ancien"].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const ref = doc(db, 'users', currentUser.uid, 'notifications', id);
      await updateDoc(ref, { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    const unread = filteredNotifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        const ref = doc(db, 'users', currentUser.uid, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
      toast({ title: "Toutes les notifications marquées comme lues" });
    } catch (e) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
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
      case 'chapter':
      case 'new_chapter': return <BookOpen className="h-4 w-4 text-primary" />;
      case 'like': return <Heart className="h-4 w-4 text-rose-500" />;
      case 'new_follower': return <Users className="h-4 w-4 text-emerald-500" />;
      case 'donation': return <Coins className="h-4 w-4 text-amber-500" />;
      case 'streak_reward': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'mentorship_request': return <Award className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-stone-400" />;
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
    <div className="container mx-auto max-w-4xl px-6 py-12 space-y-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black font-display tracking-tighter">Messagerie</h1>
              <p className="text-stone-500 italic font-light">"Les sables du temps vous apportent des nouvelles."</p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          disabled={filteredNotifications.filter(n => !n.read).length === 0}
          className="rounded-full border-white/10 hover:bg-primary/10 hover:text-primary transition-all font-bold text-xs"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" /> Tout marquer comme lu
        </Button>
      </div>

      {/* FILTER TABS */}
      <Tabs value={activeFilter} onValueChange={(val) => setActiveFilter(val as NotifFilter)} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 border border-border/50 grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <Bell className="h-3.5 w-3.5" /> Tout
          </TabsTrigger>
          <TabsTrigger value="chapters" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <BookOpen className="h-3.5 w-3.5" /> Épisodes
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <Users className="h-3.5 w-3.5" /> Social
          </TabsTrigger>
          <TabsTrigger value="africoins" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <Coins className="h-3.5 w-3.5" /> Gains
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <Settings className="h-3.5 w-3.5" /> Système
          </TabsTrigger>
        </TabsList>

        <div className="pt-10 space-y-12">
          {filteredNotifications.length > 0 ? (
            Object.entries(groupedNotifications).map(([groupName, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupName} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">{groupName}</h3>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((notif) => {
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
                                  {notif.fromPhoto ? (
                                    <Avatar className="h-8 w-8 border border-white/10">
                                      <AvatarImage src={notif.fromPhoto} />
                                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{notif.fromDisplayName?.slice(0,1)}</AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                      <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  <p className="text-xs text-stone-400 font-medium italic">"Appuyez pour voir les détails"</p>
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
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                <Bell className="h-10 w-10 text-stone-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-white tracking-tighter">Aucune alerte ici</h3>
                <p className="text-stone-500 max-w-xs mx-auto italic font-light">"Les archives sont vides pour cette catégorie. Parcourez le Hub pour susciter de nouvelles interactions !"</p>
              </div>
              <Button asChild variant="outline" className="rounded-full px-10 h-12 border-primary text-primary font-black uppercase text-xs tracking-widest">
                <Link href="/stories">Explorer le catalogue</Link>
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
