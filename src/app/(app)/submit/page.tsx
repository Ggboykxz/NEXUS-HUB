
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Sparkles, LayoutGrid, FileText, ChevronRight, 
  ArrowLeft, Globe, Rocket, Check, UploadCloud, ShieldCheck, Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    format: 'Webtoon' as 'Webtoon' | 'BD' | 'Roman Illustré',
    genre: 'Action',
    tags: '',
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

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

  const handleFinalSubmit = async () => {
    if (!user) return;
    setIsCreating(true);

    try {
      let finalCoverUrl = 'https://picsum.photos/seed/placeholder/600/900';

      if (coverFile) {
        const { timestamp, signature, apiKey, cloudName } = await getCloudinarySignature();
        const uploadData = new FormData();
        uploadData.append('file', coverFile);
        uploadData.append('api_key', apiKey!);
        uploadData.append('timestamp', timestamp.toString());
        uploadData.append('signature', signature);
        uploadData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
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

      const slug = formData.title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

      await setDoc(doc(db, "stories", finalSlug), {
        id: finalSlug,
        slug: finalSlug,
        title: formData.title.trim(),
        description: formData.description.trim(),
        format: formData.format,
        genre: formData.genre,
        genreSlug: formData.genre.toLowerCase(),
        artistId: user.uid,
        artistName: user.displayName || 'Artiste Nexus',
        coverImage: { imageUrl: finalCoverUrl },
        isPublished: false,
        views: 0,
        likes: 0,
        chapterCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Légende Invoquée !", description: "Bienvenue dans votre Atelier." });
      router.push(`/dashboard/creations/${finalSlug}`);
    } catch (error) {
      toast({ title: "Erreur de création", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-950"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 min-h-screen flex flex-col items-center">
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Studio de Production</Badge>
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">Graver une <span className="gold-resplendant">Légende</span></h1>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-black text-xs transition-all", step === s ? "bg-primary text-black shadow-xl" : step > s ? "bg-emerald-500 text-white" : "bg-white/5 text-stone-600")}>
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={cn("h-0.5 w-12", step > s ? "bg-emerald-500" : "bg-white/5")} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full bg-stone-900/50 backdrop-blur-xl rounded-[3rem] border-white/5 border-t-primary/20 border-t-2">
        <CardContent className="p-8 md:p-16">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Titre de l'œuvre</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Les Chroniques du Sahel" className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Synopsis</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="De quoi parle votre histoire ?" className="min-h-[150px] bg-white/5 border-white/10 rounded-[2rem] p-6 italic" />
              </div>
              <Button onClick={handleNext} className="w-full h-14 rounded-2xl bg-white text-black font-black">Suivant</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black text-stone-500">Genre Principal</Label>
                  <select className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-4 text-white" value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})}>
                    {['Action', 'Mythologie', 'Afrofuturisme', 'Romance'].map(g => <option key={g} value={g} className="bg-stone-900">{g}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black text-stone-500">Format</Label>
                  <select className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-4 text-white" value={formData.format} onChange={(e) => setFormData({...formData, format: e.target.value as any})}>
                    {['Webtoon', 'BD', 'Roman Illustré'].map(f => <option key={f} value={f} className="bg-stone-900">{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold">Retour</Button>
                <Button onClick={handleNext} className="flex-[2] h-14 rounded-2xl bg-white text-black font-black">Suivant</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col items-center gap-8">
                <div className="relative group w-64 aspect-[2/3] rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                  {coverPreview ? <Image src={coverPreview} alt="Preview" fill className="object-cover" /> : <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-stone-600 font-black text-[10px] uppercase">Aucune image</div>}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer border-4 border-dashed border-primary/40 m-2 rounded-2xl">
                    <UploadCloud className="h-10 w-10 text-white mb-2" />
                    <span className="text-[10px] font-black uppercase text-white">Importer Couverture</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl font-bold">Retour</Button>
                <Button onClick={handleFinalSubmit} disabled={isCreating} className="flex-[2] h-14 rounded-2xl bg-primary text-black font-black gold-shimmer shadow-xl shadow-primary/20">
                  {isCreating ? <Loader2 className="animate-spin h-6 w-6" /> : "Invoquer ma Légende"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
