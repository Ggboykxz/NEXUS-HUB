'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
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

export default function AddChapterPage(props: PageProps) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Clean up blob URLs to avoid memory leaks
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
      const newChapterDocRef = doc(chapterRef); // Pre-generate ID for storage path
      
      // 1. Upload Images
      const pagesData = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        const storagePath = `chapters/${storyId}/${newChapterDocRef.id}/${i}_${img.file.name}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(storageRef, img.file);
        
        // Tracking progress for UI if needed (simple await here for robustness)
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        pagesData.push({
          imageUrl: downloadURL,
          width: 0,
          height: 0
        });
      }

      // 2. Create Chapter Doc
      await setDoc(newChapterDocRef, {
        id: newChapterDocRef.id,
        storyId,
        title,
        chapterNumber,
        slug: `chapitre-${chapterNumber}`,
        pages: pagesData,
        isPremium: false,
        isLocked: false,
        status: 'Publié',
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        releaseDate: serverTimestamp()
      });

      // 3. Update parent story
      await updateDoc(doc(db, 'stories', storyId), {
        chapterCount: increment(1),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Épisode publié !", description: `Le chapitre ${chapterNumber} est maintenant en ligne.` });
      router.push(`/dashboard/creations/${storyId}`);
    } catch (error: any) {
      console.error(error);
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
            disabled={isSubmitting || !title.trim() || selectedImages.length === 0}
            className="flex-1 md:flex-none rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black gold-shimmer px-10 shadow-xl shadow-emerald-500/20"
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</> : <><Sparkles className="mr-2 h-5 w-5" /> Publier l'Épisode</>}
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
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Multi-sélection autorisée (Max 5Mo/page)</span>
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
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black">Gratuit</Badge>
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
              "Assurez-vous que l'ordre des planches est correct. Les lecteurs apprécient une transition fluide entre les cases."
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
