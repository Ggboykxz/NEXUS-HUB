'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  Loader2,
  Search
} from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMentorMatch } from '@/lib/actions/mentor-actions';
import Image from 'next/image';

export default function MentorshipPage() {
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'matching' | 'masterclasses'>('matching');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedMentorIds, setRecommendedMentorIds] = useState<string[]>([]);

  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<UserProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestProject, setRequestProject] = useState('');
  
  const mentorListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => setCurrentUser(user));
    return () => unsubscribe();
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

  const handleAnalysis = async () => {
    if (!currentUser) return openAuthModal("lancer l'analyse");
    setIsAnalyzing(true);
    try {
      const results = await getMentorMatch(currentUser.uid);
      const mentorIds = results.map(r => r.mentorId);
      setRecommendedMentorIds(mentorIds);
      
      toast({ title: "Analyse IA terminée", description: "Les mentors recommandés sont mis en avant." });

      setTimeout(() => {
          mentorListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100)

    } catch (error) {
      toast({ title: "Erreur de l'analyse", description: "L'analyse IA a échoué. Les mentors les plus populaires sont affichés.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const filteredMentors = useMemo(() => {
    const top3RecommendedIds = recommendedMentorIds.slice(0, 3);
    
    let sortedMentors = [...mentors].sort((a, b) => {
        const aIsRecommended = top3RecommendedIds.includes(a.uid);
        const bIsRecommended = top3RecommendedIds.includes(b.uid);
        if (aIsRecommended && !bIsRecommended) return -1;
        if (!aIsRecommended && bIsRecommended) return 1;
        return (b.sessions || 0) - (a.sessions || 0); // Fictional secondary sort
    });

    return sortedMentors.filter(mentor => {
      const matchesSearch = mentor.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const specialties = (mentor as any).mentorSpecialties || [];
      const matchesSpecialty = specialtyFilter === 'all' || specialties.includes(specialtyFilter);
      return matchesSearch && matchesSpecialty;
    });
  }, [mentors, searchTerm, specialtyFilter, recommendedMentorIds]);

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
      setRequestProject('');
    } catch (e) {
      toast({ title: "Erreur lors de l'envoi", description: "Veuillez réessayer.", variant: "destructive" });
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
                <Button onClick={handleAnalysis} disabled={isAnalyzing} className="w-full h-14 rounded-2xl font-black text-xs uppercase bg-primary text-black gold-shimmer">
                  {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin"/> : "Lancer l'Analyse"}
                </Button>
              </div>
            </Card>

            <div ref={mentorListRef} className="lg:col-span-2 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
                        <Input
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 text-sm w-full"
                        />
                    </div>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                        <SelectTrigger className="h-12 w-full md:w-[240px] rounded-xl bg-white/5 border-white/10">
                            <SelectValue placeholder="Filtrer par spécialité" />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-white/10 text-white">
                            <SelectItem value="all">Toutes les spécialités</SelectItem>
                            <SelectItem value="Scénario">Scénario</SelectItem>
                            <SelectItem value="Dessin">Dessin</SelectItem>
                            <SelectItem value="Colorisation">Colorisation</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Numérique">Numérique</SelectItem>
                            <SelectItem value="Traditionnel">Traditionnel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

              {loadingMentors ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor, index) => {
                      const isRecommended = recommendedMentorIds.slice(0, 3).includes(mentor.uid);
                      return (
                        <Card key={mentor.uid} className={cn("bg-card/50 rounded-[2.5rem] p-8 flex flex-col hover:border-primary/30 transition-all relative", isRecommended && "border-primary bg-primary/10")}>
                          {isRecommended && (
                              <Badge className="absolute top-6 right-6 border-primary bg-primary/10 text-primary text-[10px] font-bold">✦ Recommandé</Badge>
                          )}
                          <div className="flex items-center gap-5 mb-6">
                            <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/10">
                              <AvatarImage src={mentor.photoURL} />
                              <AvatarFallback className="bg-primary/10 text-primary">{mentor.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-display font-black text-xl text-white truncate">{mentor.displayName}</h4>
                              <Badge variant="outline" className="text-[8px] uppercase border-emerald-500/30 text-emerald-500 mt-1">Mentor Certifié</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-stone-400 line-clamp-3 italic mb-6">"{mentor.bio || "Prêt à transmettre l'héritage créatif."}"</p>
                          <Button onClick={() => setSelectedMentor(mentor)} className="w-full h-11 bg-primary text-black font-black text-[10px] uppercase mt-auto">Demander un mentorat</Button>
                        </Card>
                      )
                  })}
                </div>
              ) : (
                <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5">
                  <p className="text-stone-500 italic">Aucun mentor ne correspond à vos filtres.</p>
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
                <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest">Titre du projet (optionnel)</Label>
                <Input 
                  value={requestProject} 
                  onChange={(e) => setRequestProject(e.target.value)}
                  placeholder="Ex: Mon premier webtoon, L'Héritage des Ancêtres..." 
                  className="bg-white/5 border-white/10 rounded-2xl p-4" 
                />
              </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest">Message de motivation</Label>
              <Textarea 
                value={requestMessage} 
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Pourquoi souhaitez-vous être suivi par ce maître ? Présentez-vous et votre projet."
                className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl italic font-light p-6" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleMentorshipRequest} disabled={isRequesting || !requestMessage.trim()} className="w-full h-14 rounded-xl bg-primary text-black font-black">
              {isRequesting ? <Loader2 className="animate-spin" /> : "Transmettre ma Demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
