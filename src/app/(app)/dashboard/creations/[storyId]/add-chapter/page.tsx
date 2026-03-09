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
  Zap,
  AlertTriangle
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
      toast({ title: "Données manquantes", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const chapterNumber = (story?.chapterCount || 0) + 1;
      const newChapterDocRef = doc(collection(db, 'stories', storyId, 'chapters'));
      
      const pagesData = [];
      const totalSize = selectedImages.reduce((acc, img) => acc + img.size, 0);
      let uploadedSize = 0;

      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        const storagePath = `chapters/${storyId}/${newChapterDocRef.id}/page_${i}.jpg`;
        
        try {
          const storageRef = ref(storage, storagePath);
          const uploadTask = uploadBytesResumable(storageRef, img.file as Blob);

          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const overallProgress = ((uploadedSize + snapshot.bytesTransferred) / totalSize) * 100;
                setUploadProgress(overallProgress);
              },
              (error) => reject(error),
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                pagesData.push({ imageUrl: downloadURL, width: 0, height: 0 });
                uploadedSize += img.size;
                resolve();
              }
            );
          });
        } catch (storageErr: any) {
          console.error("Storage Error:", storageErr);
          if (storageErr.code === 'storage/unauthorized' || storageErr.code === 'storage/unknown') {
            throw new Error("Configuration de stockage Firebase manquante ou incorrecte. Veuillez contacter l'administrateur.");
          }
          throw storageErr;
        }
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

      toast({ title: "Chapitre publié avec succès !" });
      router.push(`/dashboard/creations/${storyId}`);
    } catch (error: any) {
      console.error(error);
      toast({ 
        title: "Échec de la publication", 
        description: error.message || "Une erreur est survenue lors de l'envoi des planches.",
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
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-xs uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <h1 className="text-4xl font-bold font-display tracking-tighter text-white">Nouveau Chapitre</h1>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || isCompressing || !title.trim() || selectedImages.length === 0}
          className="rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 shadow-xl"
        >
          {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi ({uploadProgress.toFixed(0)}%)</> : <><Sparkles className="mr-2 h-5 w-5" /> Publier</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-12">
        <div className="space-y-8">
          <Card className="bg-stone-900/50 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
            <div className="space-y-10">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Titre de l'épisode</Label>
                <Input 
                  placeholder="Ex: L'Éveil des Ancêtres" 
                  className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-display" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Planches ({selectedImages.length})</Label>
                <div className="grid gap-4">
                  {selectedImages.map((img, idx) => (
                    <div key={img.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="h-8 w-8 flex items-center justify-center bg-stone-800 rounded-lg font-black text-stone-500 shrink-0">{idx + 1}</div>
                      <div className="relative h-16 w-12 rounded overflow-hidden shrink-0">
                        <Image src={img.preview} alt="Page" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{img.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveImage(idx, 'up')} disabled={idx === 0}><ChevronUp className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveImage(idx, 'down')} disabled={idx === selectedImages.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeImage(img.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}

                  <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <UploadCloud className="h-8 w-8 text-primary mb-4" />
                    <span className="font-display font-black text-white">Ajouter des planches</span>
                    <input type="file" multiple accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card className="bg-stone-950 border-none rounded-[2rem] p-8 text-white">
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" /> Détails
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Épisode</span>
                <span className="text-xl font-black text-white">#{ (story?.chapterCount || 0) + 1 }</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-stone-500 font-bold uppercase">Pages</span>
                <span className="text-xl font-black text-white">{selectedImages.length}</span>
              </div>
            </div>
          </Card>

          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-200/70 italic leading-relaxed">
              En cas d'erreur de stockage, vérifiez que votre bucket Firebase Storage est bien initialisé dans votre console Firebase.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
