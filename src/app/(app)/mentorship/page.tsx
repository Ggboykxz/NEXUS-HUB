'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, PlayCircle, Video, Users, BrainCircuit, 
  ChevronRight, CheckCircle2, Zap, Clock, Star, Loader2,
  Filter, Search, MessageSquare, Send, Calendar, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/lib/types';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MentorshipPage() {
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'matching' | 'masterclasses' | 'live'>('matching');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<UserProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestProject, setRequestProject] = useState('');

  useEffect(() => {
    return auth.onAuthStateChanged(user => setCurrentUser(user));
  }, []);

  const { data: mentors = [], isLoading: loadingMentors } = useQuery<UserProfile[]>({
    queryKey: ['mentors-list'],
    queryFn: async () => {
      const q = query(
        collection(db, 'users'),
        where('isMentor', '==', true)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    }
  });

  const { data: masterclasses = [], isLoading: loadingMasterclasses } = useQuery({
    queryKey: ['masterclasses-list'],
    queryFn: async () => {
      const q = query(collection(db, 'masterclasses'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const matchesSearch = mentor.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const specialties = (mentor as any).mentorSpecialties || [];
      const matchesSpecialty = specialtyFilter === 'all' || specialties.includes(specialtyFilter);
      return matchesSearch && matchesSpecialty;
    });
  }, [mentors, searchTerm, specialtyFilter]);

  const handleMentorshipRequest = async () => {
    if (!currentUser) { openAuthModal('demander un mentorat'); return; }
    if (!selectedMentor || !requestMessage.trim()) return;

    setIsRequesting(true);
    try {
      await addDoc(collection(db, 'mentorshipRequests'), {
        mentorId: selectedMentor.uid,
        mentorName: selectedMentor.displayName,
        requesterId: currentUser.uid,
        requesterName: currentUser.displayName || 'Anonyme',
        requesterPhoto: currentUser.photoURL || '',
        message: requestMessage.trim(),
        projectTitle: requestProject.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast({ title: "Demande envoyée !" });
      setSelectedMentor(null);
      setRequestMessage('');
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-16 relative">
        <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Académie de l'Excellence</Badge>
        <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 gold-resplendant">Mentorat Nexus</h1>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 flex flex-wrap justify-center gap-1">
          <button onClick={() => setActiveTab('matching')} className={cn("rounded-xl px-6 py-2.5 gap-2 font-black text-[10px] uppercase tracking-widest flex items-center transition-all", activeTab === 'matching' ? "bg-primary text-black" : "text-muted-foreground")}>Annuaire Mentors</button>
          <button onClick={() => setActiveTab('masterclasses')} className={cn("rounded-xl px-6 py-2.5 gap-2 font-black text-[10px] uppercase tracking-widest flex items-center transition-all", activeTab === 'masterclasses' ? "bg-primary text-black" : "text-muted-foreground")}>Masterclasses</button>
        </div>
      </div>

      {activeTab === 'matching' && (
        <section className="space-y-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <Card className="lg:col-span-1 border-primary/10 bg-primary/[0.02] p-8 rounded-[3rem] h-fit">
              <div className="space-y-6">
                <div className="bg-primary/10 p-4 rounded-2xl w-fit"><BrainCircuit className="h-8 w-8 text-primary" /></div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Matching IA</h2>
                <p className="text-muted-foreground text-sm italic">"L'IA Nexus analyse votre style pour vous suggérer le mentor idéal."</p>
                <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase bg-primary text-black gold-shimmer">Lancer l'Analyse</Button>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-8">
              {loadingMentors ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor) => (
                    <Card key={mentor.uid} className="bg-card/50 rounded-[2.5rem] p-8 flex flex-col hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-5 mb-6">
                        <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/10">
                          <AvatarImage src={mentor.photoURL} />
                          <AvatarFallback className="bg-primary/10 text-primary">{mentor.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-display font-black text-xl text-white truncate">{mentor.displayName}</h4>
                          <Badge variant="outline" className="text-[8px] uppercase border-emerald-500/30 text-emerald-500 mt-1">Mentor Certifié</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-3 italic mb-6">"{mentor.bio || "Prêt à transmettre l'héritage créatif."}"</p>
                      <Button onClick={() => setSelectedMentor(mentor)} className="w-full h-11 bg-primary text-black font-black text-[10px] uppercase">Demander un mentorat</Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5">
                  <p className="text-stone-500 italic">Aucun mentor disponible pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'masterclasses' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loadingMasterclasses ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : masterclasses.length > 0 ? masterclasses.map((cls, idx) => (
            <Card key={idx} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-card/50">
              <div className="relative aspect-video">
                <Image src={cls.thumbnail || "https://picsum.photos/seed/master/600/400"} alt={cls.title} fill className="object-cover" />
                <Badge className="absolute top-4 left-4 bg-primary text-black font-black uppercase text-[10px]">{cls.category}</Badge>
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-display font-black leading-tight group-hover:text-primary transition-colors">{cls.title}</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase text-stone-500 tracking-widest mt-2">Par {cls.author}</CardDescription>
              </CardHeader>
              <CardFooter className="px-8 pb-8 pt-0">
                <Button variant="ghost" className="w-full h-11 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">Ouvrir le Grimoire</Button>
              </CardFooter>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-stone-500 italic">Bientôt de nouvelles masterclasses exclusives.</p>
            </div>
          )}
        </section>
      )}

      <Dialog open={!!selectedMentor} onOpenChange={(open) => !open && setSelectedMentor(null)}>
        <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-lg">
          <DialogHeader className="text-center space-y-4">
            <DialogTitle className="text-3xl font-display font-black gold-resplendant">Postuler auprès de {selectedMentor?.displayName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest">Motivation</Label>
              <Textarea 
                value={requestMessage} 
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Pourquoi souhaitez-vous être suivi par ce maître ?" 
                className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl italic font-light p-6" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleMentorshipRequest} disabled={isRequesting} className="w-full h-14 rounded-xl bg-primary text-black font-black">
              {isRequesting ? <Loader2 className="animate-spin" /> : "Transmettre ma demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
