'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Sparkles, LayoutGrid, FileText, ChevronRight, 
  ArrowLeft, Globe, Rocket, Check, UploadCloud, ShieldCheck, Zap,
  BookOpen, Palette, Info
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
    if (step === 1 && (!formData.title.trim() || !formData.description.trim())) {
      toast({ title: "Informations requises", description: "Veuillez donner un titre et un synopsis à votre légende.", variant: "destructive" });
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

      toast({ title: "Légende Invoquée !", description: "Bienvenue dans votre Atelier de création." });
      router.push(`/dashboard/creations/${finalSlug}`);
    } catch (error) {
      toast({ title: "Erreur de création", description: "Impossible de graver votre légende pour le moment.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-950"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 min-h-screen">
      {/* HEADER AVEC STEPPER */}
      <header className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Studio de Production Nexus</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black font-display tracking-tighter text-white">Graver une <span className="gold-resplendant">Légende</span></h1>
        
        <div className="flex items-center justify-center gap-4 mt-12 max-w-md mx-auto">
          {[
            { id: 1, label: 'Concept', icon: FileText },
            { id: 2, label: 'Identité', icon: Globe },
            { id: 3, label: 'Vitrine', icon: Palette }
          ].map((s) => (
            <div key={s.id} className="flex flex-1 items-center gap-4 group">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                  step === s.id ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(212,168,67,0.4)]" : 
                  step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : 
                  "bg-stone-900 border-white/5 text-stone-600"
                )}>
                  {step > s.id ? <Check className="h-6 w-6 stroke-[3]" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-widest", step >= s.id ? "text-white" : "text-stone-700")}>{s.label}</span>
              </div>
              {s.id < 3 && (
                <div className={cn("h-0.5 flex-1 mb-4 rounded-full transition-colors duration-500", step > s.id ? "bg-emerald-500" : "bg-white/5")} />
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr,320px] gap-12 items-start">
        <Card className="bg-stone-900/50 backdrop-blur-2xl rounded-[3rem] border-white/5 border-t-primary/20 border-t-2 shadow-2xl overflow-hidden">
          <CardContent className="p-8 md:p-16">
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-4">
                  <h2 className="text-2xl font-display font-black text-white">Les Fondations</h2>
                  <p className="text-stone-500 italic text-sm font-light">"Chaque grand univers commence par un nom et une intention."</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'œuvre</Label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                      placeholder="Ex: Le Chant de l'Orisha" 
                      className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold focus:border-primary shadow-inner" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Synopsis (L'âme du récit)</Label>
                    <Textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      placeholder="Décrivez l'enjeu principal de votre histoire en quelques lignes percutantes..." 
                      className="min-h-[200px] bg-white/5 border-white/10 rounded-[2rem] p-8 italic font-light text-lg focus:border-primary shadow-inner" 
                    />
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer shadow-xl">
                  Suivant <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-4">
                  <h2 className="text-2xl font-display font-black text-white">L'Identité Culturelle</h2>
                  <p className="text-stone-500 italic text-sm font-light">"Classez votre œuvre pour qu'elle trouve son public idéal."</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black text-stone-500 ml-1">Genre Narratif</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Action', 'Mythologie', 'Afrofuturisme', 'Romance', 'Historique'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({...formData, genre: g})}
                          className={cn(
                            "h-12 rounded-xl text-xs font-bold border transition-all text-left px-4 flex items-center justify-between",
                            formData.genre === g ? "bg-primary border-primary text-black shadow-lg" : "bg-white/5 border-white/5 text-stone-400 hover:border-white/20"
                          )}
                        >
                          {g}
                          {formData.genre === g && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black text-stone-500 ml-1">Format de Lecture</Label>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'Webtoon', icon: LayoutGrid, desc: 'Scroll vertical infini.' },
                        { id: 'BD', icon: BookOpen, desc: 'Pagination classique (Albums).' },
                        { id: 'Roman Illustré', icon: FileText, desc: 'Texte avec visuels clés.' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormData({...formData, format: f.id as any})}
                          className={cn(
                            "p-5 rounded-2xl border transition-all text-left flex items-start gap-4",
                            formData.format === f.id ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-stone-500"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg bg-white/5", formData.format === f.id && "text-primary")}><f.icon className="h-5 w-5" /></div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest">{f.id}</p>
                            <p className="text-[10px] italic font-light opacity-60">{f.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl font-bold text-stone-500 hover:text-white">Retour</Button>
                  <Button onClick={handleNext} className="flex-[2] h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer shadow-xl">Suivant</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-display font-black text-white">La Vitrine</h2>
                  <p className="text-stone-500 italic text-sm font-light">"La couverture est le premier contact entre votre univers et le lecteur."</p>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <div className="relative group w-64 aspect-[2/3] rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl transition-all hover:border-primary/50">
                    {coverPreview ? (
                      <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <Palette className="h-12 w-12 text-stone-800" />
                        <p className="text-[10px] text-stone-700 uppercase font-black tracking-widest">Aucune image sélectionnée</p>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer border-4 border-dashed border-primary/40 m-3 rounded-[2rem]">
                      <UploadCloud className="h-10 w-10 text-white mb-2 animate-bounce" />
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">Choisir l'image</span>
                      <p className="text-[8px] text-stone-400 mt-1">Ratio conseillé 2:3</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl font-bold text-stone-500 hover:text-white">Retour</Button>
                  <Button 
                    onClick={handleFinalSubmit} 
                    disabled={isCreating} 
                    className="flex-[2] h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
                  >
                    {isCreating ? <><Loader2 className="animate-spin h-6 w-6 mr-3" /> Incantation...</> : <><Rocket className="mr-3 h-6 w-6" /> Lancer mon Projet</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-8 sticky top-24">
          <Card className="bg-stone-900 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck className="h-32 w-32" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" /> Conseils Pro
            </h4>
            <div className="space-y-6">
              <p className="text-xs text-stone-400 leading-relaxed italic font-light">
                {step === 1 && "Un bon synopsis doit poser le 'Qui', le 'Où' et surtout le 'Pourquoi' dès les premières lignes."}
                {step === 2 && "Le format Webtoon est recommandé pour maximiser vos revenus via mobile (90% de notre audience)."}
                {step === 3 && "Privilégiez une image claire avec un seul personnage principal pour attirer l'œil dans les classements."}
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-white truncate">Statut Initial</p>
                  <p className="text-[8px] text-stone-500 italic">Programme Draft Activé</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2.5rem] p-8 text-center space-y-4">
            <div className="mx-auto bg-emerald-500/10 p-3 rounded-full w-fit"><Check className="h-6 w-6 text-emerald-500" /></div>
            <h4 className="font-bold text-white text-sm">Propriété Garantie</h4>
            <p className="text-[10px] text-stone-500 italic leading-relaxed">
              Vos droits d'auteur sont protégés. NexusHub n'agit que comme plateforme de diffusion et agent de promotion.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
