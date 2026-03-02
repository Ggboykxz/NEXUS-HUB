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
  Coins
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
  collectionGroup, 
  query, 
  where, 
  getDocs 
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

/**
 * Utility function to compress images on the client side using Canvas API.
 */
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
        
        // Ownership Check (Défense en profondeur côté client)
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

  const validatePage = async (file: File): Promise<boolean> => {
    // 1. Type check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Format invalide", description: `${file.name} : Utilisez du JPG, PNG ou WebP.`, variant: "destructive" });
      return false;
    }

    // 2. Size check (10MB for pages)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: `${file.name} : Max 10Mo par page.`, variant: "destructive" });
      return false;
    }

    // 3. Dimensions check (at least 600px wide)
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.naturalWidth < 600) {
          toast({ title: "Largeur insuffisante", description: `${file.name} : Largeur min. 600px requise.`, variant: "destructive" });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        toast({ title: "Erreur de lecture", description: `Impossible de lire ${file.name}.`, variant: "destructive" });
        resolve(false);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validatedImages: ImageFile[] = [];

    for (const file of files) {
      const isValid = await validatePage(file);
      if (isValid) {
        validatedImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          progress: 0
        });
      }
    }

    if (validatedImages.length > 0) {
      setSelectedImages(prev => [...prev, ...validatedImages]);
    }
    
    // Reset input value to allow re-selecting the same file if needed
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
        status: 'Publié',
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        releaseDate: serverTimestamp()
      });

      await updateDoc(doc(db, 'stories', storyId), {
        chapterCount: increment(1),
        updatedAt: serverTimestamp()
      });

      const subscribersQuery = query(
        collectionGroup(db, 'subscriptions'),
        where('artistId', '==', story?.artistId)
      );
      
      const subscribersSnap = await getDocs(subscribersQuery);
      
      if (!subscribersSnap.empty) {
        let batch = writeBatch(db);
        let count = 0;

        for (const subDoc of subscribersSnap.docs) {
          const subscriberId = subDoc.ref.parent.parent?.id;
          if (!subscriberId) continue;

          const notifRef = doc(collection(db, 'users', subscriberId, 'notifications'));
          batch.set(notifRef, {
            type: 'chapter',
            storyId: storyId,
            storyTitle: story?.title,
            chapterTitle: title,
            chapterNumber: chapterNumber,
            artistId: story?.artistId,
            artistName: story?.artistName,
            fromDisplayName: story?.artistName,
            fromPhoto: currentUser?.photoURL || '',
            message: `vient de publier l'épisode ${chapterNumber} de "${story?.title}"`,
            link: `/read/${storyId}`,
            read: false,
            createdAt: serverTimestamp()
          });

          count++;
          if (count === 500) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }

        if (count > 0) {
          await batch.commit();
        }
      }

      toast({ title: "Épisode publié !", description: `Le chapitre ${chapterNumber} est maintenant en ligne.` });
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
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publication...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Publier l'Épisode</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-12">
        <div className="space-y-8">
          <Card className="bg-stone-900/50 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'épisode</Label>
                <Input 
                  placeholder="Ex: L'Éveil des Ancêtres" 
                  className="h-14 text-xl bg-white/5 border-white/5 rounded-2xl focus:border-primary text-white font-display" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
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
                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary ml-1">Prix en AfriCoins</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <Input 
                          type="number"
                          value={afriCoinsPrice}
                          onChange={(e) => setAfriCoinsPrice(parseInt(e.target.value) || 0)}
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
                <span className="text-xs text-stone-500 font-bold uppercase">Type</span>
                {isPremium ? (
                  <Badge className="bg-primary text-black border-none uppercase text-[8px] font-black">Premium</Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black">Gratuit</Badge>
                )}
              </div>
              {isPremium && (
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-xs text-stone-500 font-bold uppercase">Coût</span>
                  <span className="text-xl font-black text-primary">{afriCoinsPrice} 🪙</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Pages</span>
                <span className="text-xl font-black text-white">{selectedImages.length}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Conseil de l'Atelier</h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">
              "L'IA Nexus compresse désormais vos planches avant l'envoi pour préserver votre bande passante et accélérer la mise en ligne."
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
