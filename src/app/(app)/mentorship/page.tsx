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
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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

  // Filters State
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Request Form State
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<UserProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestProject, setRequestProject] = useState('');

  useEffect(() => {
    return auth.onAuthStateChanged(user => setCurrentUser(user));
  }, []);

  // Fetch real mentors from Firestore
  const { data: mentors = [], isLoading: loadingMentors } = useQuery<UserProfile[]>({
    queryKey: ['mentors-list'],
    queryFn: async () => {
      const q = query(
        collection(db, 'users'),
        where('isMentor', '==', true),
        where('role', '==', 'artist_pro')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    }
  });

  // Client-side filtering
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const mentorData = mentor as any; // Cast for custom fields
      const matchesSearch = mentor.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const specialties = mentorData.mentorSpecialties || ['Dessin', 'Scénario']; // Fallback for prototype
      const matchesSpecialty = specialtyFilter === 'all' || specialties.includes(specialtyFilter);
      
      const isAvailable = mentorData.isAvailable !== false;
      const matchesAvailability = availabilityFilter === 'all' || 
                                 (availabilityFilter === 'available' && isAvailable) ||
                                 (availabilityFilter === 'waitlist' && !isAvailable);

      return matchesSearch && matchesSpecialty && matchesAvailability;
    });
  }, [mentors, searchTerm, specialtyFilter, availabilityFilter]);

  const handleMentorshipRequest = async () => {
    if (!currentUser) {
      openAuthModal('demander un mentorat');
      return;
    }

    if (!selectedMentor) return;
    if (!requestMessage.trim()) {
      toast({ title: "Message requis", variant: "destructive" });
      return;
    }

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

      // Notification au mentor
      await addDoc(collection(db, 'users', selectedMentor.uid, 'notifications'), {
        type: 'mentorship_request',
        fromUserId: currentUser.uid,
        fromDisplayName: currentUser.displayName || 'Un voyageur',
        fromPhoto: currentUser.photoURL || '',
        message: 'souhaite que vous deveniez son mentor.',
        link: '/dashboard/mentorship',
        read: false,
        createdAt: serverTimestamp()
      });

      toast({ 
        title: "Demande envoyée !", 
        description: `Votre message a été transmis à ${selectedMentor.displayName}.` 
      });
      setSelectedMentor(null);
      setRequestMessage('');
      setRequestProject('');
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande.", variant: "destructive" });
    } finally {
      setIsRequesting(false);
    }
  };

  const masterclasses = [
    {
      title: "L'art du Storyboarding Panafricain",
      author: "Jelani Adebayo",
      duration: "45 min",
      thumbnail: "https://picsum.photos/seed/master1/600/400",
      category: "Narration"
    },
    {
      title: "Colorisation Digitale : Teintes Sahéliennes",
      author: "Amina Diallo",
      duration: "1h 15",
      thumbnail: "https://picsum.photos/seed/master2/600/400",
      category: "Technique"
    },
    {
      title: "Vivre de son Art via les AfriCoins",
      author: "Kwame Osei",
      duration: "30 min",
      thumbnail: "https://picsum.photos/seed/master3/600/400",
      category: "Business"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Académie de l'Excellence</Badge>
        <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 gold-resplendant">Programme Mentorat Nexus</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto italic font-light">
          "Un pont entre les légendes confirmées et la nouvelle vague créative. Progressez avec l'IA et apprenez des maîtres du 9ème art."
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center mb-12">
        <div className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 flex flex-wrap justify-center gap-1">
          <button 
            onClick={() => setActiveTab('matching')}
            className={cn(
              "rounded-xl px-6 py-2.5 gap-2 font-black text-[10px] uppercase tracking-widest flex items-center transition-all",
              activeTab === 'matching' ? "bg-primary text-black shadow-lg" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <BrainCircuit className="h-4 w-4" /> Annuaire Mentors
          </button>
          <button 
            onClick={() => setActiveTab('masterclasses')}
            className={cn(
              "rounded-xl px-6 py-2.5 gap-2 font-black text-[10px] uppercase tracking-widest flex items-center transition-all",
              activeTab === 'masterclasses' ? "bg-primary text-black shadow-lg" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <PlayCircle className="h-4 w-4" /> Masterclasses
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={cn(
              "rounded-xl px-6 py-2.5 gap-2 font-black text-[10px] uppercase tracking-widest flex items-center transition-all",
              activeTab === 'live' ? "bg-primary text-black shadow-lg" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Video className="h-4 w-4" /> Ateliers Live
          </button>
        </div>
      </div>

      {/* Tab: AI Matching & Directory */}
      {activeTab === 'matching' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col lg:flex-row items-center gap-6 p-6 bg-stone-900/50 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Chercher un mentor, une spécialité..." 
                className="h-12 pl-12 bg-white/5 border-white/5 rounded-xl focus:border-primary/50 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3 px-4 border-r border-white/5">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Affiner</span>
              </div>

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-[160px] h-10 bg-transparent border-none text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-white/10">
                  <SelectItem value="all">Toutes Spécialités</SelectItem>
                  <SelectItem value="Dessin">Dessin & Anatomie</SelectItem>
                  <SelectItem value="Scénario">Scénario & Lore</SelectItem>
                  <SelectItem value="Colorisation">Colorisation</SelectItem>
                  <SelectItem value="Lettrage">Lettrage & Bulles</SelectItem>
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="Disponibilité" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-white/10">
                  <SelectItem value="all">Toute Disponibilité</SelectItem>
                  <SelectItem value="available">Disponible maintenant</SelectItem>
                  <SelectItem value="waitlist">Sur liste d'attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <Card className="lg:col-span-1 border-primary/10 bg-primary/[0.02] shadow-2xl p-8 rounded-[3rem] h-fit">
              <div className="space-y-6">
                <div className="bg-primary/10 p-4 rounded-2xl w-fit"><BrainCircuit className="h-8 w-8 text-primary" /></div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Matching Intelligent</h2>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  "L'IA de l'Académie analyse votre style de dessin et vos thèmes narratifs pour vous suggérer le mentor le plus compatible avec votre vision."
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Affinité Artistique</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Rythme de Travail</span>
                  </div>
                </div>
                <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-black gold-shimmer shadow-xl shadow-primary/20">Lancer l'Analyse IA</Button>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-display font-black flex items-center gap-3 uppercase text-white">
                  <Users className="h-5 w-5 text-primary" /> Maîtres Disponibles
                </h3>
                <Badge variant="outline" className="border-white/10 text-stone-500 text-[10px] font-black">{filteredMentors.length} Mentors</Badge>
              </div>
              
              {loadingMentors ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Invoquer les maîtres...</p>
                </div>
              ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor) => {
                    const isAvailable = (mentor as any).isAvailable !== false;
                    return (
                      <Card key={mentor.uid} className="group hover:border-primary/30 transition-all duration-500 bg-card/50 rounded-[2.5rem] overflow-hidden border-border/50 flex flex-col hover:shadow-2xl">
                        <CardContent className="p-8 flex-1 flex flex-col">
                          <div className="flex items-center gap-5 mb-6">
                            <div className="relative">
                              <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all">
                                <AvatarImage src={mentor.photoURL} alt={mentor.displayName} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{mentor.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-stone-900 shadow-xl flex items-center justify-center",
                                isAvailable ? "bg-emerald-500" : "bg-amber-500"
                              )}>
                                {isAvailable ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-display font-black text-xl text-white truncate leading-none mb-2">{mentor.displayName}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-[8px] uppercase border-emerald-500/30 text-emerald-500 px-2 h-4 font-black">Certifié Pro</Badge>
                                {isAvailable ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-4">LIBRE</Badge>
                                ) : (
                                  <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] h-4">LISTE D'ATTENTE</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-stone-400 line-clamp-3 font-light italic leading-relaxed mb-6">
                            "{mentor.bio || "Mentor expert prêt à transmettre l'héritage de la narration visuelle africaine."}"
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                            {((mentor as any).mentorSpecialties || ['Dessin', 'Scénario']).map((s: string) => (
                              <Badge key={s} className="bg-white/5 text-stone-500 border-white/10 text-[8px] font-black uppercase px-2 py-0.5">{s}</Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Dialog open={selectedMentor?.uid === mentor.uid} onOpenChange={(open) => !open && setSelectedMentor(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  onClick={() => {
                                    if (!currentUser) openAuthModal('demander un mentorat');
                                    else setSelectedMentor(mentor);
                                  }}
                                  className="flex-1 rounded-xl h-11 bg-primary text-black font-black text-[10px] uppercase tracking-widest gold-shimmer"
                                >
                                  Demander un mentorat
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-lg">
                                <DialogHeader className="text-center space-y-4">
                                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    <Award className="h-8 w-8 text-primary" />
                                  </div>
                                  <DialogTitle className="text-3xl font-display font-black gold-resplendant">Candidature Mentorat</DialogTitle>
                                  <DialogDescription className="text-stone-400 italic">
                                    "Décrivez votre projet et vos motivations. {mentor.displayName} étudiera votre dossier sous 48h."
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6 py-6">
                                  <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Titre de votre œuvre (optionnel)</Label>
                                    <Input 
                                      value={requestProject}
                                      onChange={(e) => setRequestProject(e.target.value)}
                                      placeholder="Ex: Les Veilleurs d'Akoma" 
                                      className="h-12 bg-white/5 border-white/10 rounded-xl" 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Pourquoi ce mentor ?</Label>
                                    <Textarea 
                                      value={requestMessage}
                                      onChange={(e) => setRequestMessage(e.target.value)}
                                      placeholder="Présentez votre parcours et ce que vous souhaitez apprendre..." 
                                      className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl italic font-light p-6" 
                                    />
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button 
                                    onClick={handleMentorshipRequest}
                                    disabled={isRequesting}
                                    className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg gold-shimmer shadow-xl shadow-primary/20"
                                  >
                                    {isRequesting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="mr-2 h-5 w-5" /> Transmettre mon Dossier</>}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button asChild variant="outline" className="rounded-xl h-11 w-11 p-0 border-white/10 text-stone-500 hover:text-white">
                              <Link href={`/artiste/${mentor.slug}`}><Info className="h-4 w-4" /></Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 space-y-6">
                  <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                    <Search className="h-10 w-10 text-stone-500" />
                  </div>
                  <p className="text-stone-500 italic font-light">"Aucun maître n'a été trouvé pour ces critères dans les sables du Hub."</p>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setSpecialtyFilter('all'); setAvailabilityFilter('all'); }} className="rounded-full border-primary text-primary">Réinitialiser la quête</Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab: Masterclasses */}
      {activeTab === 'masterclasses' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {masterclasses.map((cls, idx) => (
              <Card key={idx} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-card/50 hover:shadow-2xl transition-all">
                <div className="relative aspect-video">
                  <Image src={cls.thumbnail} alt={cls.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <PlayCircle className="h-8 w-8 text-black fill-current" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-primary text-black font-black uppercase text-[10px]">{cls.category}</Badge>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {cls.duration}
                  </div>
                </div>
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-display font-black leading-tight group-hover:text-primary transition-colors">{cls.title}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase text-stone-500 tracking-widest mt-2">Maître Conférencier : {cls.author}</CardDescription>
                </CardHeader>
                <CardFooter className="px-8 pb-8 pt-0">
                  <Button variant="ghost" className="w-full h-11 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/5 hover:text-primary">
                    Ouvrir le Grimoire <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Live Workshops */}
      {activeTab === 'live' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-stone-900 rounded-[3.5rem] p-12 overflow-hidden relative border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Video className="h-64 w-64 text-primary" /></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <Badge className="bg-rose-500 text-white border-none animate-pulse mb-6 px-4 py-1.5 font-black text-[10px] tracking-widest">SESSION LIVE : CE SOIR À 20H00</Badge>
                  <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant leading-[0.9] tracking-tighter">Atelier <br/>Anatomie & Pose</h2>
                  <p className="text-stone-400 text-lg font-light leading-relaxed italic mt-6">
                    "Session intensive de 2 heures avec Amina Diallo. Apprenez à dessiner des personnages dynamiques sans sacrifier les proportions."
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                    <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Correction en Direct</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                    <MessageSquare className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Q&A Workshop</p>
                  </div>
                </div>
                <Button size="lg" className="h-16 px-12 rounded-full font-black text-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/20 w-full sm:w-auto">
                  Réserver ma Place
                </Button>
              </div>
              <div className="relative aspect-square rounded-[4rem] overflow-hidden border-8 border-stone-950 shadow-2xl bg-black group">
                <Image src="https://picsum.photos/seed/liveart/800/800" alt="Live Session" fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[10000ms]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-rose-500 flex items-center justify-center animate-ping opacity-20" />
                  <div className="absolute h-20 w-20 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl">
                    <Video className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <p className="text-xs font-bold text-white mb-1">Précédent Live :</p>
                  <p className="text-[10px] text-stone-400 italic">"Design Culturel & Masques Traditionnels" &bull; 1.2k vues</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certification Footer */}
      <section className="mt-24 pt-16 border-t border-white/5 text-center space-y-10">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,168,67,0.2)]">
          <Award className="h-12 w-12 text-primary" />
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Certification NexusHub</h2>
          <p className="text-stone-400 font-light leading-relaxed italic">
            "Validez vos acquis auprès des maîtres de la plateforme. Obtenez le badge officiel de certification pour rassurer les lecteurs et augmenter vos chances d'être sélectionné pour le programme **NexusHub Originals**."
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-300"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Storytelling Master</div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-300"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Webtoon Expert</div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-300"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Brand Building</div>
          </div>
        </div>
      </section>
    </div>
  );
}
