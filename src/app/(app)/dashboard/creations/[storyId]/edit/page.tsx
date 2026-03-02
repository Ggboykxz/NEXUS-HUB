'use client';

import { use, useState, useEffect } from 'react';
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
  Trash2, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Info,
  Crown,
  PenSquare,
  ShieldCheck,
  LayoutGrid,
  BookOpen,
  Zap,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Story } from '@/lib/types';

interface PageProps {
  params: Promise<{ storyId: string }>;
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
            else reject(new Error('La conversion de l\'image a échoué.'));
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

export default function EditStoryPage(props: PageProps) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    format: 'Webtoon',
    status: 'En cours',
    isPremium: false,
    isPublished: false,
    tags: [] as string[],
    universeId: '',
    coverUrl: '',
  });

  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      
      try {
        const storyRef = doc(db, 'stories', storyId);
        const storySnap = await getDoc(storyRef);
        
        if (storySnap.exists()) {
          const data = storySnap.data() as Story;
          
          if (data.artistId !== user.uid) {
            router.push('/dashboard/creations');
            toast({ 
              title: "Accès refusé", 
              description: "Vous n'avez pas les droits pour modifier cette légende.",
              variant: "destructive" 
            });
            return;
          }
          
          setFormData({
            title: data.title,
            description: data.description,
            genre: data.genre,
            format: data.format,
            status: data.status || 'En cours',
            isPremium: data.isPremium || false,
            isPublished: data.isPublished || false,
            tags: data.tags || [],
            universeId: data.universeId || '',
            coverUrl: data.coverImage.imageUrl,
          });
          setCoverPreview(data.coverImage.imageUrl);
        } else {
          router.push('/dashboard/creations');
        }
      } catch (e) {
        console.error(e);
        router.push('/dashboard/creations');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [storyId, router, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Fichier trop lourd", description: "La couverture ne doit pas dépasser 5Mo.", variant: "destructive" });
        return;
      }
      setNewCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.genre) {
      toast({ title: "Données manquantes", description: "Le titre et le genre sont obligatoires.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      let finalCoverUrl = formData.coverUrl;

      if (newCoverFile) {
        setIsCompressing(true);
        const compressedBlob = await compressImage(newCoverFile, 1200, 0.85);
        setIsCompressing(false);

        const storagePath = `stories/${storyId}/cover_${Date.now()}.jpg`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob);
        await uploadTask;
        finalCoverUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        genreSlug: formData.genre.toLowerCase(),
        format: formData.format,
        status: formData.status,
        isPremium: formData.isPremium,
        isPublished: formData.isPublished,
        universeId: formData.universeId || null,
        'coverImage.imageUrl': finalCoverUrl,
        updatedAt: serverTimestamp()
      });

      toast({ title: "Modifications enregistrées", description: "Votre légende a été mise à jour avec succès." });
      router.push(`/dashboard/creations/${storyId}`);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Erreur de sauvegarde", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
      setIsCompressing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="text-stone-500 font-display font-black uppercase tracking-widest text-[10px]">Chargement des archives...</p>
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
              <PenSquare className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tighter text-white">Éditer la Légende</h1>
              <p className="text-stone-500 italic font-light">Modifiez les fondations de votre univers.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isCompressing}
            className="flex-1 md:flex-none rounded-xl h-14 bg-primary text-black font-black gold-shimmer px-10 shadow-xl shadow-primary/20"
          >
            {isCompressing ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Compression...</>
            ) : isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sauvegarde...</>
            ) : (
              <><CheckCircle2 className="mr-2 h-5 w-5" /> Enregistrer les changements</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-12">
        <div className="space-y-8">
          <Card className="bg-stone-900/50 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'œuvre</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="h-14 text-xl bg-white/5 border-white/5 rounded-2xl focus:border-primary text-white font-display" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Genre Principal</Label>
                  <Select value={formData.genre} onValueChange={(val) => setFormData({...formData, genre: val})}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-bold">
                      <SelectValue />
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
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Statut du Récit</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-white/10 rounded-2xl">
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="Terminé">Terminé</SelectItem>
                      <SelectItem value="À venir">À venir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Synopsis</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[180px] bg-white/5 border-white/5 rounded-[2rem] p-8 text-lg font-light italic text-white focus:border-primary" 
                />
              </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
              <h3 className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4" /> Paramètres Avancés
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-white">Visible au public</Label>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">Rendre l'œuvre disponible</p>
                  </div>
                  <Switch checked={formData.isPublished} onCheckedChange={(val) => setFormData({...formData, isPublished: val})} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-white flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" /> Premium
                    </Label>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">Exiger des AfriCoins</p>
                  </div>
                  <Switch checked={formData.isPremium} onCheckedChange={(val) => setFormData({...formData, isPremium: val})} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Lien vers un Univers Partagé</Label>
                <Input 
                  value={formData.universeId}
                  onChange={(e) => setFormData({...formData, universeId: e.target.value})}
                  placeholder="ID de l'univers (ex: nexushub-originals)"
                  className="h-12 bg-black/40 border-white/10 rounded-xl text-stone-300"
                />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card className="bg-stone-900 border-white/5 rounded-[2.5rem] p-8 text-center space-y-6">
            <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Image de Couverture</Label>
            <div className="relative group mx-auto w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              {coverPreview && (
                <Image src={coverPreview} alt="Preview" fill className="object-cover" />
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud className="h-8 w-8 text-white mb-2" />
                <span className="text-[10px] font-black uppercase text-white">Changer</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-[9px] text-stone-500 uppercase font-bold tracking-tighter">Format recommandé : 2:3 (1200x1800px)</p>
          </Card>

          <Card className="bg-stone-950 border-none rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck className="h-24 w-24 text-primary" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" /> Intégrité Narrative
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Format fixe</span>
                <span className="text-sm font-black text-white">{formData.format}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Visibilité</span>
                <Badge className={cn("text-[8px] font-black uppercase", formData.isPublished ? "bg-emerald-500" : "bg-amber-500")}>
                  {formData.isPublished ? 'En ligne' : 'Brouillon'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Aide de l'Atelier</h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">
              "Modifier les métadonnées peut affecter votre position dans les classements. L'IA Nexus recommande de garder une cohérence dans vos tags et genres."
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
