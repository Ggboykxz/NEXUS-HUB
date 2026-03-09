'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Sparkles, LayoutGrid, FileText, ChevronRight, 
  ArrowLeft, Globe, Palette, Rocket, Check, Info, UploadCloud,
  Zap, ShieldCheck, Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getCloudinarySignature } from '@/lib/actions/cloudinary-actions';

type Step = 1 | 2 | 3;

export default function SubmitPage() {
  const [step, setStep] = useState<Step>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    format: 'Webtoon' as 'Webtoon' | 'BD' | 'Roman Illustré',
    genre: 'Action',
    region: 'Afrique de l\'Ouest',
    tags: '',
    coverUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-7543974359-3b6f7.firebasestorage.app/o/assets%2Fplaceholder.png?alt=media'
  });

  // Cover Upload State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" });
      return;
    }
    setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => setStep((prev) => (prev - 1) as Step);

  const handleFinalSubmit = async () => {
    if (!user) return;
    setIsCreating(true);

    try {
      let finalCoverUrl = formData.coverUrl;

      // 1. Upload Cover to Cloudinary if file selected
      if (coverFile) {
        setIsUploading(true);
        const { timestamp, signature, apiKey, cloudName } = await getCloudinarySignature();
        
        const uploadData = new FormData();
        uploadData.append('file', coverFile);
        uploadData.append('api_key', apiKey!);
        uploadData.append('timestamp', timestamp.toString());
        uploadData.append('signature', signature);
        uploadData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        uploadData.append('folder', 'nexushub/covers');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadData
        });

        if (res.ok) {
          const result = await res.json();
          finalCoverUrl = result.secure_url;
        }
      }

      // 2. Create Story Document
      const slug = formData.title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

      const storyData = {
        id: finalSlug,
        slug: finalSlug,
        title: formData.title.trim(),
        description: formData.description.trim(),
        format: formData.format,
        status: "En cours",
        genre: formData.genre,
        genreSlug: formData.genre.toLowerCase(),
        region: formData.region,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        artistId: user.uid,
        artistName: user.displayName || 'Artiste Nexus',
        coverImage: { imageUrl: finalCoverUrl },
        isPublished: false,
        isBanned: false,
        isPremium: false,
        views: 0,
        likes: 0,
        chapterCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "stories", finalSlug), storyData);

      toast({ title: "Légende Invoquée !", description: "Bienvenue dans votre Atelier." });
      router.push(`/dashboard/creations/${finalSlug}`);

    } catch (error) {
      console.error(error);
      toast({ title: "Erreur de création", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 min-h-screen flex flex-col items-center">
      {/* HEADER SECTION */}
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">
          Studio de Production
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">
          Graver une <span className="gold-resplendant">Légende</span>
        </h1>
        
        {/* STEPPER INDICATOR */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500",
                step === s ? "bg-primary text-black shadow-[0_0_20px_rgba(212,168,67,0.4)] scale-110" : 
                step > s ? "bg-emerald-500 text-white" : "bg-white/5 text-stone-600 border border-white/5"
              )}>
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={cn("h-0.5 w-12 rounded-full", step > s ? "bg-emerald-500" : "bg-white/5")} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full shadow-2xl border-white/5 bg-stone-900/50 backdrop-blur-xl rounded-[3rem] overflow-hidden border-t-primary/20 border-t-2">
        <CardContent className="p-8 md:p-16">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black text-white flex items-center gap-3">
                  <FileText className="text-primary h-8 w-8" /> L'Âme du Récit
                </h2>
                <p className="text-stone-500 italic font-light">"Définissez les bases de votre univers."</p>
              </div>

              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'œuvre</Label>
                  <Input 
                    placeholder="Ex: Les Chroniques du Sahel" 
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:border-primary"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Synopsis</Label>
                  <Textarea 
                    placeholder="De quoi parle votre histoire ? Captez l'attention des lecteurs en quelques lignes." 
                    className="min-h-[150px] bg-white/5 border-white/10 rounded-[2rem] p-6 text-white italic font-light focus:border-primary"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Webtoon', 'BD', 'Roman Illustré'].map((f) => (
                    <button 
                      key={f}
                      onClick={() => setFormData({...formData, format: f as any})}
                      className={cn(
                        "p-6 rounded-2xl border-2 transition-all text-left group",
                        formData.format === f ? "border-primary bg-primary/10 shadow-lg shadow-primary/5" : "border-white/5 bg-white/5 opacity-60 hover:opacity-100"
                      )}
                    >
                      <LayoutGrid className={cn("h-6 w-6 mb-3", formData.format === f ? "text-primary" : "text-stone-600")} />
                      <p className="font-bold text-sm text-white">{f}</p>
                      <p className="text-[8px] uppercase font-black text-stone-500 mt-1">Format standard</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: IDENTITY */}
          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black text-white flex items-center gap-3">
                  <Globe className="text-emerald-500 h-8 w-8" /> Identité Culturelle
                </h2>
                <p className="text-stone-500 italic font-light">"Ancrez votre récit dans une région et un genre."</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Genre Principal</Label>
                  <select 
                    className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-4 text-white appearance-none outline-none focus:border-primary"
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  >
                    {['Action', 'Mythologie', 'Afrofuturisme', 'Romance', 'Horreur', 'Tranche de vie'].map(g => (
                      <option key={g} value={g} className="bg-stone-900">{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Région d'Inspiration</Label>
                  <select 
                    className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-4 text-white appearance-none outline-none focus:border-primary"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                  >
                    {['Afrique de l\'Ouest', 'Afrique Centrale', 'Afrique de l\'Est', 'Afrique Australe', 'Maghreb', 'Diaspora'].map(r => (
                      <option key={r} value={r} className="bg-stone-900">{r}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Mots-clés (séparés par des virgules)</Label>
                  <Input 
                    placeholder="Ex: magie, tradition, technologie, combat" 
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4">
                <Sparkles className="h-6 w-6 text-primary shrink-0" />
                <p className="text-xs text-stone-400 italic leading-relaxed">
                  Conseil : "Le genre **Afrofuturisme** combiné à la région **Afrique de l'Est** est particulièrement recherché par les lecteurs du Hub en ce moment."
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: VITRINE (COVER) */}
          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-display font-black text-white">La Vitrine Sacrée</h2>
                <p className="text-stone-500 italic font-light">"La couverture est le premier portail vers votre univers."</p>
              </div>

              <div className="flex flex-col items-center gap-8">
                <div className="relative group w-64 aspect-[2/3] rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-stone-800 flex flex-col items-center justify-center p-8 text-center">
                      <Palette className="h-12 w-12 text-stone-700 mb-4" />
                      <p className="text-[10px] uppercase font-black text-stone-600">Aucune image sélectionnée</p>
                    </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer border-4 border-dashed border-primary/40 m-2 rounded-2xl">
                    <UploadCloud className="h-10 w-10 text-white mb-2" />
                    <span className="text-[10px] font-black uppercase text-white">Importer Couverture</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    <p className="text-[10px] uppercase font-black text-stone-400">Hébergement Sécurisé Cloudinary</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <Zap className="h-6 w-6 text-amber-500" />
                    <p className="text-[10px] uppercase font-black text-stone-400">Diffusion CDN Optimisée</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex items-center gap-4 mt-16 pt-8 border-t border-white/5">
            {step > 1 && (
              <Button onClick={handleBack} variant="ghost" className="h-14 px-8 rounded-xl font-bold text-stone-500">
                <ArrowLeft className="mr-2 h-5 w-5" /> Retour
              </Button>
            )}
            
            {step < 3 ? (
              <Button onClick={handleNext} className="flex-1 h-14 rounded-xl bg-white text-black font-black text-lg group">
                Étape Suivante <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinalSubmit} 
                disabled={isCreating}
                className="flex-1 h-14 rounded-xl bg-primary text-black font-black text-lg shadow-xl shadow-primary/20 gold-shimmer"
              >
                {isCreating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Incursion en cours...</> : <><Rocket className="mr-2 h-5 w-5" /> Invoquer ma Légende</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-stone-700 uppercase tracking-[0.4em] font-bold mt-12">
        NexusHub Publishing Pipeline v4.0 — 2026
      </p>
    </div>
  );
}
