'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  MessageSquare, 
  Twitter, 
  Instagram, 
  Facebook, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Send,
  HelpCircle,
  ShieldAlert,
  Handshake,
  Newspaper
} from 'lucide-react';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Support technique',
    message: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
          email: user.email || ''
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Champs manquants", description: "Veuillez remplir toutes les informations requises.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      setIsSubmitted(true);
      toast({ title: "Message envoyé !", description: "Notre équipe vous répondra dans les plus brefs délais." });
    } catch (error) {
      console.error("Contact error:", error);
      toast({ title: "Erreur d'envoi", description: "Impossible de transmettre votre message pour le moment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-32 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-emerald-500/10 p-6 rounded-full w-fit mx-auto mb-8 border border-emerald-500/20 shadow-2xl">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-4 tracking-tighter">Message Transmis !</h1>
        <p className="text-stone-400 text-lg italic font-light mb-12">
          "Votre voix a été portée jusqu'aux scribes du Hub. Nous étudions votre demande avec attention."
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-10 h-14 bg-primary text-black font-black">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-white/10 text-white" onClick={() => setIsSubmitted(false)}>
            Envoyer un autre message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Centre de Liaison</Badge>
            <h1 className="text-4xl md:text-6xl font-black font-display text-white tracking-tighter leading-none">Contactez <span className="gold-resplendant">le Hub</span></h1>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto italic font-light">
                "Une question, une suggestion ou une demande de partenariat ? Nos gardiens sont à votre écoute."
            </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Card className="border-none bg-stone-900/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="h-1.5 w-full bg-primary" />
                <CardHeader className="p-10 pb-0">
                    <CardTitle className="flex items-center gap-3 text-2xl font-display font-bold">
                        <MessageSquare className="text-primary h-6 w-6" />
                        Envoyer un message
                    </CardTitle>
                    <CardDescription className="italic text-stone-500">
                        "Réponse moyenne sous 24h à 48h ouvrées."
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                              <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Votre nom</Label>
                              <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Prénom Nom" 
                                className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary text-white" 
                              />
                          </div>
                          <div className="space-y-3">
                              <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Votre email</Label>
                              <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="email@example.com" 
                                className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary text-white" 
                              />
                          </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Sujet de la demande</Label>
                            <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
                              <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-medium">
                                <SelectValue placeholder="Choisir un sujet" />
                              </SelectTrigger>
                              <SelectContent className="bg-stone-900 border-white/10 text-white">
                                <SelectItem value="Support technique">Support technique</SelectItem>
                                <SelectItem value="Signalement">Signalement</SelectItem>
                                <SelectItem value="Partenariat">Partenariat</SelectItem>
                                <SelectItem value="Presse">Presse</SelectItem>
                                <SelectItem value="Autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest ml-1">Votre message</Label>
                            <Textarea 
                              value={formData.message}
                              onChange={(e) => setFormData({...formData, message: e.target.value})}
                              placeholder="Décrivez votre demande en quelques lignes..." 
                              className="min-h-[180px] bg-white/5 border-white/10 rounded-2xl p-6 text-white italic font-light focus:border-primary" 
                            />
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg gold-shimmer shadow-xl shadow-primary/20"
                        >
                          {isSubmitting ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Transmission...</> : <><Send className="mr-3 h-5 w-5" /> Envoyer ma demande</>}
                        </Button>
                    </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
                 <Card className="bg-stone-900/30 border-white/5 rounded-[2rem] p-8 group hover:border-primary/20 transition-all shadow-xl">
                    <CardHeader className="p-0 mb-6">
                         <CardTitle className="flex items-center gap-3 text-lg font-display">
                            <div className="bg-primary/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform"><Mail className="text-primary h-5 w-5" /></div>
                            Par email
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-2">
                        <p className="text-stone-500 text-xs italic">Pour les demandes générales et le support :</p>
                        <a href="mailto:contact@nexushub.com" className="text-xl text-white font-black hover:text-primary transition-colors block">
                            contact@nexushub.com
                        </a>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: HelpCircle, title: "Aide Rapide", desc: "Consultez notre FAQ.", href: "/faq", color: "text-blue-500 bg-blue-500/10" },
                    { icon: ShieldAlert, title: "Sécurité", desc: "Signaler un abus.", href: "/forums", color: "text-rose-500 bg-rose-500/10" },
                    { icon: Handshake, title: "Business", desc: "Nos programmes Pro.", href: "/pro", color: "text-emerald-500 bg-emerald-500/10" },
                    { icon: Newspaper, title: "Presse", desc: "Dossier de presse.", href: "/blog", color: "text-amber-500 bg-amber-500/10" },
                  ].map((item, i) => (
                    <Link key={i} href={item.href}>
                      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg", item.color)}><item.icon className="h-4 w-4" /></div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                          <p className="text-[10px] text-stone-500 uppercase font-black tracking-tighter">{item.desc}</p>
                        </div>
                        <ArrowRight className="h-3 w-3 ml-auto text-stone-700" />
                      </Card>
                    </Link>
                  ))}
                </div>

                 <Card className="bg-stone-900/30 border-white/5 rounded-[2rem] p-8 shadow-xl">
                    <CardHeader className="p-0 mb-6">
                         <CardTitle className="text-lg font-display">Suivez-nous</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                       <p className="text-stone-500 text-xs italic">"Restez au cœur des légendes sur nos réseaux."</p>
                       <div className="flex gap-3">
                          <Button asChild variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white hover:text-primary hover:border-primary/50 transition-all">
                            <Link href="#"><Twitter className="h-5 w-5" /></Link>
                          </Button>
                          <Button asChild variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white hover:text-primary hover:border-primary/50 transition-all">
                            <Link href="#"><Instagram className="h-5 w-5" /></Link>
                          </Button>
                          <Button asChild variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white hover:text-primary hover:border-primary/50 transition-all">
                            <Link href="#"><Facebook className="h-5 w-5" /></Link>
                          </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all",
      variant === 'outline' ? "border" : "bg-primary text-black",
      className
    )}>
      {children}
    </span>
  );
}
