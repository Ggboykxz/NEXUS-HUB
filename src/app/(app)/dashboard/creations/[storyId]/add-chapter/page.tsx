'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  UploadCloud, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Info,
  Crown,
  Coins,
  Clock,
  Calendar,
  Zap,
  AlertTriangle,
  Cloud,
  FileUp,
  Settings2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  serverTimestamp, 
  updateDoc, 
  increment, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import { getCloudinarySignature } from '@/lib/actions/cloudinary-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Story } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface PageProps {
  params: Promise<{ storyId: string }>;
}

interface ImageFile {
  id: string;
  file: File | Blob;
  preview: string;
  progress: number;
  name: string;
  size: number;
}

const compressImage = (file: File, maxWidth: number, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('La conversion de la planche a échoué.'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function AddChapterPage(props: PageProps) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [title, setTitle] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [afriCoinsPrice, setAfriCoinsPrice] = useState(5);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);

  const [pubMode, setPubMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      
      const storyRef = doc(db, 'stories', storyId);
      const storySnap = await getDoc(storyRef);
      
      if (storySnap.exists()) {
        const data = storySnap.data() as Story;
        if (data.artistId !== user.uid) {
          router.push('/dashboard/creations');
          toast({ title: "Accès refusé", variant: "destructive" });
          return;
        }
        setStory({ ...data, id: storySnap.id });
      } else {
        router.push('/dashboard/creations');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [storyId, router, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    const compressedImages: ImageFile[] = [];
    try {
      const compressionPromises = files.map(async (file) => {
        const compressedBlob = await compressImage(file, 1200, 0.8);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file: compressedBlob,
          preview: URL.createObjectURL(compressedBlob),
          progress: 0,
          name: file.name,
          size: compressedBlob.size,
        };
      });

      const results = await Promise.all(compressionPromises);
      setSelectedImages(prev => [...prev, ...results]);
      toast({ title: `${results.length} planches ajoutées`, description: "Optimisées pour le Web." });
    } catch (error) {
      toast({ title: "Erreur de traitement", variant: "destructive" });
    } finally {
      setIsCompressing(false);
    }
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...selectedImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setSelectedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!title.trim() || selectedImages.length === 0) {
      toast({ title: "Données manquantes", description: "Veuillez remplir le titre et ajouter au moins une planche.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const chapterNumber = (story?.chapterCount || 0) + 1;
      const chapterId = `ch${chapterNumber}-${Math.floor(Math.random() * 1000)}`;
      const newChapterDocRef = doc(db, 'stories', storyId, 'chapters', chapterId);
      
      const pagesData = [];
      const folder = `nexushub/chapters/${storyId}`;
      
      // Récupération sécurisée de la config depuis le serveur
      const config = await getCloudinarySignature({ folder });
      const { timestamp, signature, apiKey, cloudName, uploadPreset } = config;

      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        
        const formData = new FormData();
        formData.append('file', img.file);
        formData.append('api_key', apiKey!);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: { message: errorText } };
          }
          throw new Error(errorData.error?.message || "L'envoi vers Cloudinary a échoué.");
        }

        const result = await response.json();
        pagesData.push({ 
          imageUrl: result.secure_url, 
          width: result.width, 
          height: result.height 
        });
        
        setUploadProgress(((i + 1) / selectedImages.length) * 100);
      }

      const chapterStatus = pubMode === 'now' ? 'Publié' : 'Programmé';
      const scheduledTimestamp = pubMode === 'scheduled' ? Timestamp.fromDate(new Date(scheduledDate)) : null;

      await setDoc(newChapterDocRef, {
        id: chapterId,
        storyId,
        title,
        chapterNumber,
        slug: `chapitre-${chapterNumber}`,
        pages: pagesData,
        isPremium,
        afriCoinsPrice: isPremium ? afriCoinsPrice : 0,
        status: chapterStatus,
        scheduledAt: scheduledTimestamp,
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: pubMode === 'now' ? serverTimestamp() : null
      });

      await updateDoc(doc(db, 'stories', storyId), {
        chapterCount: increment(1),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Épisode publié !", description: "Vos planches sont prêtes pour la lecture mondiale." });
      router.push(`/dashboard/creations/${storyId}`);
    } catch (error: any) {
      console.error(error);
      toast({ 
        title: "Échec de la publication", 
        description: error.message || "Une erreur est survenue lors de l'upload.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12 space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-stone-900/50 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><FileUp className="h-48 w-48 text-primary" /></div>
        <div className="space-y-3 relative z-10">
          <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest mb-2">
            <ArrowLeft className="h-4 w-4" /> Retour à l'Atelier
          </Link>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter">Nouveau Chapitre</h1>
          <p className="text-stone-500 italic font-light text-sm">Série : <span className="text-primary font-bold">{story?.title}</span></p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isCompressing || !title.trim() || selectedImages.length === 0}
            className="rounded-2xl h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 shadow-xl shadow-emerald-500/20 text-lg gold-shimmer"
          >
            {isSubmitting ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Envoi ({uploadProgress.toFixed(0)}%)</> : <><Cloud className="mr-3 h-6 w-6" /> Publier l'épisode</>}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,380px] gap-12 items-start">
        <div className="space-y-8">
          <Card className="bg-stone-950 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-display font-bold">Configuration du Récit</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-10">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'épisode</Label>
                <Input 
                  placeholder="Ex: Le Réveil du Gardien" 
                  className="h-14 bg-white/5 border-white/10 rounded-2xl text-white font-display text-lg" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Séquence des Planches ({selectedImages.length})</Label>
                  <Button variant="ghost" onClick={() => setSelectedImages([])} className="h-6 text-[8px] font-black uppercase text-rose-500 hover:bg-rose-500/10">Tout effacer</Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {selectedImages.map((img, idx) => (
                    <div key={img.id} className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-primary/20 transition-all shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                      <div className="h-12 w-12 flex items-center justify-center bg-stone-900 rounded-2xl font-display font-black text-xl text-stone-700 group-hover:text-primary transition-colors">{idx + 1}</div>
                      <div className="relative h-24 w-16 rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
                        <Image src={img.preview} alt="Page" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{img.name}</p>
                        <p className="text-[10px] text-stone-500 italic mt-1">{(img.size / 1024).toFixed(0)} KB &bull; Web-ready</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/5 rounded-lg" onClick={() => moveImage(idx, 'up')} disabled={idx === 0}><ChevronUp className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/5 rounded-lg" onClick={() => moveImage(idx, 'down')} disabled={idx === selectedImages.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-500 bg-rose-500/5 rounded-xl hover:bg-rose-500/20" onClick={() => removeImage(img.id)}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  ))}

                  <label className={cn(
                    "flex flex-col items-center justify-center py-20 border-4 border-dashed rounded-[3rem] transition-all cursor-pointer group",
                    selectedImages.length === 0 ? "bg-primary/[0.02] border-primary/20" : "bg-white/[0.02] border-white/10"
                  )}>
                    <UploadCloud className={cn("h-16 w-16 mb-6 transition-transform group-hover:scale-110", selectedImages.length === 0 ? "text-primary" : "text-stone-700")} />
                    <span className="font-display font-black text-xl text-white">Importer les planches</span>
                    <p className="text-stone-500 text-xs italic mt-2">JPG ou PNG &bull; Jusqu'à 10MB par fichier</p>
                    <input type="file" multiple accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8 sticky top-24">
          <Card className="bg-stone-900 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="h-32 w-32 text-primary" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Options de Sortie
            </h4>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold flex items-center gap-2 text-primary"><Crown className="h-3.5 w-3.5" /> Premium</Label>
                    <p className="text-[8px] text-stone-500 uppercase font-black">Accès payant</p>
                  </div>
                  <Switch checked={isPremium} onCheckedChange={setIsPremium} />
                </div>
                {isPremium && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] uppercase font-black text-stone-500 ml-1">Prix en AfriCoins</Label>
                    <Input 
                      type="number" 
                      value={afriCoinsPrice} 
                      onChange={(e) => setAfriCoinsPrice(Number(e.target.value))} 
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-black text-primary"
                    />
                  </div>
                )}
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black text-stone-500 ml-1">Planification</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => setPubMode('now')} 
                    variant={pubMode === 'now' ? 'default' : 'outline'}
                    className={cn("rounded-xl h-11 text-[9px] font-black uppercase", pubMode === 'now' ? "bg-primary text-black" : "border-white/10 text-stone-500")}
                  >
                    Direct
                  </Button>
                  <Button 
                    onClick={() => setPubMode('scheduled')} 
                    variant={pubMode === 'scheduled' ? 'default' : 'outline'}
                    className={cn("rounded-xl h-11 text-[9px] font-black uppercase", pubMode === 'scheduled' ? "bg-primary text-black" : "border-white/10 text-stone-500")}
                  >
                    Programmé
                  </Button>
                </div>
                {pubMode === 'scheduled' && (
                  <Input 
                    type="datetime-local" 
                    value={scheduledDate} 
                    onChange={(e) => setScheduledDate(e.target.value)} 
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-xs" 
                  />
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-widest flex items-center gap-2"><Sparkles className="h-4 w-4" /> Nexus Insights</h4>
            <p className="text-[10px] text-stone-400 leading-relaxed italic font-light">
              "L'IA recommande de ne pas dépasser 40 planches par épisode pour maintenir un engagement optimal sur mobile. Votre moyenne actuelle est excellente."
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
