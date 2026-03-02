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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  increment, 
  setDoc, 
  writeBatch, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Story } from '@/lib/types';

interface PageProps {
  params: Promise<{ storyId: string }>;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
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
          toast({ 
            title: "Accès refusé", 
            description: "Vous n'avez pas les droits pour modifier ce récit.",
            variant: "destructive" 
          });
          return;
        }
        
        setStory({ id: storySnap.id, ...data });
      } else {
        router.push('/dashboard/creations');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [storyId, router, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validatedImages: ImageFile[] = [];

    for (const file of files) {
      validatedImages.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        progress: 0
      });
    }

    if (validatedImages.length > 0) {
      setSelectedImages(prev => [...prev, ...validatedImages]);
    }
    
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
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
      toast({ title: "Données manquantes", description: "Veuillez donner un titre et ajouter au moins une page.", variant: "destructive" });
      return;
    }

    if (pubMode === 'scheduled' && !scheduledDate) {
      toast({ title: "Date manquante", description: "Veuillez choisir une date de publication.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const chapterNumber = (story?.chapterCount || 0) + 1;
      const chapterRef = collection(db, 'stories', storyId, 'chapters');
      const newChapterDocRef = doc(chapterRef);
      
      const pagesData = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        
        setIsCompressing(true);
        const compressedBlob = await compressImage(img.file, 1600, 0.85);
        setIsCompressing(false);

        const storagePath = `chapters/${storyId}/${newChapterDocRef.id}/page_${i}.jpg`;
        const storageRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob);
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        pagesData.push({
          imageUrl: downloadURL,
          width: 0,
          height: 0
        });
      }

      const chapterStatus = pubMode === 'now' ? 'Publié' : 'Programmé';
      const scheduledTimestamp = pubMode === 'scheduled' ? Timestamp.fromDate(new Date(scheduledDate)) : null;

      await setDoc(newChapterDocRef, {
        id: newChapterDocRef.id,
        storyId,
        title,
        chapterNumber,
        slug: `chapitre-${chapterNumber}`,
        pages: pagesData,
        isPremium,
        afriCoinsPrice: isPremium ? afriCoinsPrice : 0,
        isLocked: false,
        status: chapterStatus,
        scheduledAt: scheduledTimestamp,
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: pubMode === 'now' ? serverTimestamp() : null,
        releaseDate: pubMode === 'now' ? serverTimestamp() : scheduledTimestamp
      });

      await updateDoc(doc(db, 'stories', storyId), {
        chapterCount: increment(1),
        updatedAt: serverTimestamp()
      });

      if (story && pubMode === 'now') {
        const subsQuery = query(collection(db, 'users'), 
          where('followedArtists', 'array-contains', story.artistId));
        const subsSnap = await getDocs(subsQuery);
        
        const batch = writeBatch(db);
        subsSnap.docs.forEach(sub => {
          const notifRef = doc(collection(db, 'users', sub.id, 'notifications'));
          batch.set(notifRef, {
            type: 'new_chapter', 
            storyId: story.id, 
            storyTitle: story.title,
            storyCoverUrl: story.coverImage.imageUrl,
            chapterNumber, 
            chapterTitle: title,
            artistName: story.artistName,
            read: false, 
            createdAt: serverTimestamp()
          });
        });
        
        await batch.commit();
        toast({ title: `✅ Publié ! ${subsSnap.size} abonnés notifiés.` });
      } else if (pubMode === 'scheduled') {
        toast({ title: "📅 Épisode programmé", description: `Sortie prévue le ${new Date(scheduledDate).toLocaleString()}.` });
      }

      router.push(`/dashboard/creations/${storyId}`);
    } catch (error: any) {
      console.error(error);
      setIsCompressing(false);
      toast({ title: "Erreur de publication", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="text-stone-500 font-display font-black uppercase tracking-widest text-[10px]">Chargement de l'Atelier...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2">
            <ArrowLeft className="h-4 w-4" /> Retour à l'Atelier
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Layers className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tighter text-white">Nouveau Chapitre</h1>
              <p className="text-stone-500 italic font-light">Ajoutez un nouvel épisode à "{story?.title}".</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isCompressing || !title.trim() || selectedImages.length === 0}
            className="flex-1 md:flex-none rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black gold-shimmer px-10 shadow-xl shadow-emerald-500/20"
          >
            {isCompressing ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Compression...</>
            ) : isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {pubMode === 'now' ? 'Publication...' : 'Programmation...'}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> {pubMode === 'now' ? "Publier l'Épisode" : "Programmer l'Épisode"}</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-12">
        <div className="space-y-8">
          <Card className="bg-stone-900/50 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
            <div className="space-y-10">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'épisode</Label>
                <Input 
                  placeholder="Ex: L'Éveil des Ancêtres" 
                  className="h-14 text-xl bg-white/5 border-white/5 rounded-2xl focus:border-primary text-white font-display" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Mode de publication
                  </Label>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter italic">Choisissez quand votre œuvre sera visible.</p>
                </div>

                <RadioGroup 
                  value={pubMode} 
                  onValueChange={(val: any) => setPubMode(val)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="now" id="pub-now" className="sr-only" />
                    <Label 
                      htmlFor="pub-now" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all",
                        pubMode === 'now' ? "border-primary bg-primary/10 text-primary" : "border-white/5 bg-white/5 text-stone-500 hover:bg-white/10"
                      )}
                    >
                      <Zap className="h-6 w-6 mb-2" />
                      <span className="font-black text-xs uppercase">Publier maintenant</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="scheduled" id="pub-later" className="sr-only" />
                    <Label 
                      htmlFor="pub-later" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all",
                        pubMode === 'scheduled' ? "border-primary bg-primary/10 text-primary" : "border-white/5 bg-white/5 text-stone-500 hover:bg-white/10"
                      )}
                    >
                      <Calendar className="h-6 w-6 mb-2" />
                      <span className="font-black text-xs uppercase">Programmer</span>
                    </Label>
                  </div>
                </RadioGroup>

                {pubMode === 'scheduled' && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary ml-1">Date et heure de sortie</Label>
                    <Input 
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-12 bg-black/40 border-primary/20 rounded-xl text-stone-200"
                    />
                    <p className="text-[9px] text-stone-500 italic">L'épisode sera automatiquement débloqué à cette date.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-bold text-white flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" /> Chapitre Premium
                    </Label>
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter italic">Réservé aux membres payant en AfriCoins</p>
                  </div>
                  <Switch checked={isPremium} onCheckedChange={setIsPremium} />
                </div>

                {isPremium && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary ml-1">Prix en AfriCoins (1-50)</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <Input 
                          type="number"
                          min={1}
                          max={50}
                          value={afriCoinsPrice}
                          onChange={(e) => {
                            let val = parseInt(e.target.value) || 0;
                            if (val > 50) val = 50;
                            setAfriCoinsPrice(val);
                          }}
                          className="h-14 pl-12 bg-black/40 border-primary/20 rounded-2xl text-xl font-black text-white"
                        />
                      </div>
                      <Badge className="h-14 px-6 rounded-2xl bg-primary/10 text-primary border-primary/20 font-black text-sm">🪙 COINS</Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Planches de l'épisode ({selectedImages.length})</Label>
                
                <div className="grid gap-4">
                  {selectedImages.map((img, idx) => (
                    <div key={img.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group animate-in slide-in-from-left-2 duration-300">
                      <div className="h-10 w-10 flex items-center justify-center bg-stone-800 rounded-xl font-black text-stone-500 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="relative h-20 w-14 rounded-lg overflow-hidden shadow-lg border border-white/10 shrink-0">
                        <Image src={img.preview} alt="Page" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{img.file.name}</p>
                        <p className="text-[9px] text-stone-500 uppercase font-black">{(img.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500 hover:text-white" onClick={() => moveImage(idx, 'up')} disabled={idx === 0}><ChevronUp className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500 hover:text-white" onClick={() => moveImage(idx, 'down')} disabled={idx === selectedImages.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500 hover:text-rose-500" onClick={() => removeImage(img.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}

                  <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/50 transition-all cursor-pointer group">
                    <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform mb-4 shadow-xl">
                      <UploadCloud className="h-8 w-8 text-primary" />
                    </div>
                    <span className="font-display font-black text-white">Ajouter des planches</span>
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Multi-sélection autorisée (Max 10Mo/page)</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card className="bg-stone-950 border-none rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Sparkles className="h-24 w-24 text-primary" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" /> Détails de l'Épisode
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Numéro</span>
                <span className="text-2xl font-black text-white">#{ (story?.chapterCount || 0) + 1 }</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Statut</span>
                <Badge className={cn(
                  "border-none uppercase text-[8px] font-black",
                  pubMode === 'now' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                )}>
                  {pubMode === 'now' ? 'Direct' : 'Planifié'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Type</span>
                {isPremium ? (
                  <Badge className="bg-primary text-black border-none uppercase text-[8px] font-black">Premium</Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black">Gratuit</Badge>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Pages</span>
                <span className="text-xl font-black text-white">{selectedImages.length}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Conseil de l'Atelier</h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">
              "Programmer vos sorties à l'avance permet de maintenir un rythme régulier, ce que les algorithmes du Hub et les lecteurs apprécient particulièrement."
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
