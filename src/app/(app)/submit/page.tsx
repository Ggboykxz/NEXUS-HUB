'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Globe, ChevronRight, CheckCircle2, UploadCloud, Loader2, ShieldAlert, Image as ImageIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    format: 'Webtoon' as any,
    description: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Fichier trop lourd", description: "La taille maximale est de 5Mo.", variant: "destructive" });
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResendEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        toast({ title: "Email envoyé", description: "Vérifiez votre boîte de réception." });
      } catch (e) {
        toast({ title: "Erreur", description: "Impossible de renvoyer l'email.", variant: "destructive" });
      }
    }
  };

  const handleCreate = async () => {
    if (!user) {
      openAuthModal('lancer votre premier projet');
      return;
    }

    if (!user.emailVerified) {
      toast({ title: "Email non vérifié", description: "Veuillez valider votre email pour publier.", variant: "destructive" });
      return;
    }

    if (!coverFile) {
      toast({ title: "Image manquante", description: "Veuillez ajouter une image de couverture.", variant: "destructive" });
      return;
    }
    
    setIsCreating(true);
    try {
      // 1. Upload cover to Storage
      const timestamp = Date.now();
      const storagePath = `covers/${user.uid}/${timestamp}_${coverFile.name}`;
      const storageRef = ref(storage, storagePath);
      
      const uploadResult = await uploadBytes(storageRef, coverFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Generate Unique Slug
      let baseSlug = formData.title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, where('slug', '==', baseSlug));
      const querySnapshot = await getDocs(q);
      
      let finalSlug = baseSlug;
      if (!querySnapshot.empty) {
        // Append a random 4-digit suffix if collision detected
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalSlug = `${baseSlug}-${randomSuffix}`;
      }

      // 3. Create Firestore doc
      const storyData = {
        ...formData,
        artistId: user.uid,
        artistName: user.displayName || 'Artiste Nexus',
        coverImage: {
          imageUrl: downloadURL,
          width: 0,
          height: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: false,
        isBanned: false,
        isOriginal: false,
        isPremium: false,
        views: 0,
        likes: 0,
        subscriptions: 0,
        chapterCount: 0,
        rating: 0,
        slug: finalSlug,
        genreSlug: formData.genre.toLowerCase(),
        tags: [formData.genre],
      };

      await addDoc(storiesRef, storyData);

      toast({
        title: "Légende créée !",
        description: "Votre œuvre a été enregistrée avec succès.",
      });
      
      router.push('/dashboard/creations');
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Échec de la création",
        description: error.message || "Une erreur est survenue lors de l'envoi.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="text-stone-500 font-display font-black uppercase tracking-[0.2em] text-[10px]">Chargement de l'atelier...</p>
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <div className="container mx-auto max-xl px-4 py-24 text-center">
        <ShieldAlert className="h-16 w-16 text-orange-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 font-display">Vérifiez votre Identité</h1>
        <p className="text-muted-foreground mb-8 italic">
          "Pour garantir la sécurité de la communauté, les messagers doivent prouver leur identité avant de partager leurs récits."
        </p>
        <div className="flex flex-col gap-4">
          <Button onClick={handleResendEmail} className="rounded-full h-12 gold-shimmer">Renvoyer le lien de vérification</Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>J'ai vérifié mon email</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, label: "Récit", icon: BookOpen },
    { id: 2, label: "Format", icon: Users },
    { id: 3, label: "Vitrine", icon: Globe },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="text-center mb-16 space-y-4">
        <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Éclosion Créative</Badge>
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">Lancez votre <span className="gold-resplendant">Légende</span></h1>
        <p className="text-lg text-stone-400 max-w-2xl mx-auto italic font-light">
          "Votre vision mérite un public mondial. Suivez ces étapes pour initialiser votre univers dans les archives de NexusHub."
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* PROGRESS STEPPER */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                step === s.id ? "bg-primary border-primary text-black shadow-[0_0_25px_rgba(212,168,67,0.4)] scale-110" : 
                step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-stone-900 border-white/5 text-stone-600"
              )}>
                {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-widest", step === s.id ? "text-primary" : "text-stone-600")}>{s.label}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-white/5 bg-stone-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="p-10 pb-0">
            <CardTitle className="text-2xl font-display font-black text-white flex items-center gap-3">
              {steps[step - 1].label}
            </CardTitle>
            <CardDescription className="italic text-stone-500">"Les données sont transmises via un tunnel sécurisé vers nos serveurs."</CardDescription>
          </CardHeader>
          
          <CardContent className="p-10 space-y-8 min-h-[450px]">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'œuvre</Label>
                  <Input 
                    placeholder="Ex: Les Guerriers du Kasaï" 
                    className="h-14 text-xl bg-white/5 border-white/5 rounded-2xl focus:border-primary text-white font-display" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Genre Principal</Label>
                    <Select onValueChange={(val) => setFormData({...formData, genre: val})}>
                      <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-bold">
                        <SelectValue placeholder="Choisir un destin" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-white/10 rounded-2xl">
                        <SelectItem value="Mythologie">Mythologie</SelectItem>
                        <SelectItem value="Afrofuturisme">Afrofuturisme</SelectItem>
                        <SelectItem value="Histoire">Histoire</SelectItem>
                        <SelectItem value="Action">Action</SelectItem>
                        <SelectItem value="Romance">Romance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Visibilité</Label>
                    <div className="h-14 flex items-center px-6 bg-white/5 border border-white/5 rounded-2xl text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <ShieldAlert className="h-4 w-4 mr-2 text-primary" /> Brouillon Privé
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Synopsis</Label>
                  <Textarea 
                    placeholder="Décrivez votre univers et vos héros..." 
                    className="min-h-[180px] bg-white/5 border-white/5 rounded-[2rem] p-8 text-lg font-light italic text-white focus:border-primary" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="space-y-6">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 block text-center">Format de Lecture</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'Webtoon', icon: LayoutGrid, desc: 'Scroll vertical infini' },
                      { id: 'BD', icon: BookOpen, desc: 'Lecture paginée classique' },
                      { id: 'One-shot', icon: Zap, desc: 'Récit complet court' }
                    ].map((f) => (
                      <div key={f.id} className="relative">
                        <input 
                          type="radio" 
                          name="format" 
                          id={f.id} 
                          className="peer sr-only" 
                          checked={formData.format === f.id}
                          onChange={() => setFormData({...formData, format: f.id as any})}
                        />
                        <label htmlFor={f.id} className="flex flex-col items-center justify-center p-8 border-2 border-white/5 bg-white/5 rounded-[2rem] cursor-pointer transition-all hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/10 group">
                          <f.icon className="h-8 w-8 mb-4 text-stone-600 group-hover:text-primary transition-colors" />
                          <span className="font-display font-black text-white text-lg">{f.id}</span>
                          <span className="text-[8px] uppercase font-bold text-stone-500 mt-1 tracking-tighter">{f.desc}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] text-center space-y-2">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Note de l'Atelier</p>
                  <p className="text-xs text-stone-400 italic">"Le format Webtoon est recommandé pour une visibilité optimale sur mobile (Gabon & Afrique de l'Ouest)."</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 text-center">
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Image de Couverture (Format 2:3)</Label>
                  <div className="flex justify-center">
                    <div className="relative group">
                      {coverPreview ? (
                        <div className="relative w-48 h-72 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10">
                          <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                          <button 
                            onClick={() => {setCoverFile(null); setCoverPreview(null);}}
                            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:bg-rose-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-48 h-72 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer group">
                          <UploadCloud className="h-12 w-12 text-stone-700 group-hover:text-primary transition-all mb-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-600 group-hover:text-primary">Choisir un fichier</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-4 bg-stone-950/50 p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Prêt pour l'Immortalité ?</h3>
                  <p className="text-xs text-stone-500 leading-relaxed italic font-light">
                    "En lançant le projet, vous initialisez votre espace de création sécurisé. Vous pourrez ensuite ajouter vos chapitres, utiliser l'IA éditoriale et gérer votre équipe."
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center p-10 bg-white/5 border-t border-white/5">
            <Button 
              variant="ghost" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || isCreating}
              className="rounded-xl px-8 h-12 font-bold text-stone-500 hover:text-white"
            >
              Précédent
            </Button>
            
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className="rounded-xl px-10 h-12 font-black bg-primary text-black gold-shimmer">
                Suivant <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                disabled={isCreating || !formData.title || !formData.genre || !coverFile}
                className="rounded-xl px-12 h-14 font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] group"
              >
                {isCreating ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Forgeage du Récit...</> : "Lancer le Projet de Vie"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
