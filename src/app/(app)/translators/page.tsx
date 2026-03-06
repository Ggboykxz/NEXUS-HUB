'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, Award, Coins, Heart, MessageSquare, 
  ChevronRight, Sparkles, Star, Globe, History, 
  ShieldCheck, ArrowRight, Zap, Flame, LayoutGrid,
  CheckCircle2, BookOpen, Users, Building2, Loader2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/checkbox-ui-fix";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TranslatorsProgramPage() {
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [experience, setExperience] = useState('Débutant');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data());
      }
      setLoadingProfile(false);
    });
    return unsub;
  }, []);

  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ['translation-missions'],
    queryFn: async () => {
      const q = query(collection(db, 'translationMissions'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const handleApplyClick = () => {
    if (!currentUser) {
      openAuthModal('postuler au programme de traduction');
      return;
    }
    setIsDialogOpen(true);
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLangs(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async () => {
    if (selectedLangs.length === 0) {
      toast({ title: "Sélection requise", description: "Choisissez au moins une langue cible.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isTranslator: true,
        translatorLanguages: selectedLangs,
        translatorLevel: 'contributeur',
        translatorExperience: experience,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Candidature validée !",
        description: "Vous êtes désormais membre du programme des traducteurs.",
      });
      setIsDialogOpen(false);
      setUserProfile((prev: any) => ({ ...prev, isTranslator: true }));
    } catch (e: any) {
      toast({ title: "Erreur", description: "Impossible de valider votre candidature.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiers = [
    {
      title: "🌱 Contributeur",
      condition: "1er chapitre traduit",
      reward: "+10 🪙 / chapitre",
      benefits: ["Badge Apprenti", "Accès Studio IA"],
      color: "border-blue-500/20 bg-blue-500/[0.02]"
    },
    {
      title: "🏆 Certifié Nexus",
      condition: "50 chapitres validés",
      reward: "+25 🪙 / chapitre",
      benefits: ["Priorité Missions Pro", "Signature officielle"],
      color: "border-emerald-500/20 bg-emerald-500/[0.02]"
    },
    {
      title: "👑 Maître Linguiste",
      condition: "Expertise Dialectale",
      reward: "Tarif Libre + Bonus IP",
      benefits: ["Consultant World-Building", "Rôle Sage Forum"],
      color: "border-primary/20 bg-primary/[0.02]"
    }
  ];

  const availableLangs = [
    { id: 'en', label: 'Anglais (EN)' },
    { id: 'sw', label: 'Swahili (SW)' },
    { id: 'ha', label: 'Hausa (HA)' },
    { id: 'am', label: 'Amharique (AM)' },
    { id: 'ar', label: 'Arabe (AR)' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="relative py-24 bg-stone-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center space-y-8">
          <Badge variant="outline" className="mb-4 border-emerald-500/20 text-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Ambassadeurs de l'Ombre</Badge>
          <h1 className="text-5xl md:text-8xl font-display font-black text-white tracking-tighter leading-none gold-resplendant">
            Traduisez, <br/>Connectez, <span className="text-emerald-500">Gagnez.</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto font-light italic leading-relaxed">
            "NexusHub est le pont entre les cultures. Rejoignez notre programme de traducteurs, aidez les artistes à s'exporter et soyez rémunéré en AfriCoins."
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button 
              onClick={handleApplyClick}
              size="lg" 
              className={cn(
                "rounded-full px-12 h-16 font-black text-xl shadow-2xl transition-all",
                userProfile?.isTranslator 
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30 cursor-default" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
              )}
            >
              {loadingProfile ? <Loader2 className="animate-spin h-6 w-6" /> : userProfile?.isTranslator ? "Vous êtes Traducteur" : "Postuler au Programme"}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 container max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-display font-black uppercase tracking-tight">Le Parcours du Traducteur</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={cn("relative overflow-hidden border-2 transition-all hover:shadow-2xl rounded-[2.5rem]", tier.color)}>
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black font-display">{tier.title}</CardTitle>
                <CardDescription className="text-xs font-bold text-stone-500 italic mt-1">{tier.condition}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest">Rémunération de base</p>
                  <p className="text-3xl font-black text-primary">{tier.reward}</p>
                </div>
                <ul className="space-y-2">
                  {tier.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-24 container max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black uppercase tracking-tight">Missions Ouvertes</h2>
            <p className="text-muted-foreground italic">"Des artistes attendent votre expertise."</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingMissions ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : missions.length > 0 ? missions.map((m, i) => (
            <Card key={i} className="bg-card/50 border-border/50 rounded-3xl hover:border-primary/30 transition-all group p-6">
              <div className="flex justify-between items-start mb-6">
                <Badge className={cn("bg-stone-100 text-stone-600 border-none px-3 uppercase text-[8px] font-black tracking-widest", m.status === 'Urgent' && "bg-rose-100 text-rose-600")}>{m.status}</Badge>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary font-black text-sm">{m.reward}</div>
              </div>
              <h4 className="text-xl font-display font-black mb-2 truncate">{m.title}</h4>
              <div className="flex items-center gap-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-6 pt-4 border-t border-border/50">
                <Globe className="h-3 w-3 text-primary" /> {m.from} <ArrowRight className="h-3 w-3" /> {m.to}
              </div>
              <Button className="w-full rounded-xl bg-white/5 border border-white/10 text-foreground font-black group-hover:bg-primary group-hover:text-black transition-all">Postuler à la mission</Button>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <p className="text-stone-500 italic">Aucune mission de traduction n'est disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-lg">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto bg-emerald-500/10 p-4 rounded-full w-fit">
              <Languages className="h-8 w-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-3xl font-display font-black gold-resplendant">Candidature Traducteur</DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-6">
            <div className="space-y-4">
              <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Langues Cibles (FR → ...)</Label>
              <div className="grid grid-cols-2 gap-4">
                {availableLangs.map((lang) => (
                  <div key={lang.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                    <Checkbox 
                      id={lang.id} 
                      checked={selectedLangs.includes(lang.id)}
                      onCheckedChange={() => toggleLanguage(lang.id)}
                    />
                    <label htmlFor={lang.id} className="text-xs font-bold cursor-pointer">{lang.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || selectedLangs.length === 0}
              className="w-full h-14 rounded-xl bg-emerald-500 text-black font-black text-lg gold-shimmer"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer ma Candidature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
