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
  Globe,
  AlertCircle,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getCloudinarySignature } from '@/lib/actions/cloudinary-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Story } from '@/lib/types';

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default function EditStoryPage(props: PageProps) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    format: 'Webtoon',
    status: 'En cours',
    isPremium: false,
    isPublished: false,
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
      try {
        const storySnap = await getDoc(doc(db, 'stories', storyId));
        if (storySnap.exists()) {
          const data = storySnap.data() as Story;
          if (data.artistId !== user.uid) {
            router.push('/dashboard/creations');
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
            coverUrl: data.coverImage.imageUrl,
          });
          setCoverPreview(data.coverImage.imageUrl);
        } else {
          router.push('/dashboard/creations');
        }
      } catch (e) {
        router.push('/dashboard/creations');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [storyId, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.genre) {
      toast({ title: "Titre et genre requis", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      let finalCoverUrl = formData.coverUrl;

      if (newCoverFile) {
        setIsUploading(true);
        try {
          const folder = `nexushub/covers/${storyId}`;
          const { timestamp, signature, apiKey, cloudName } = await getCloudinarySignature({ folder });

          const uploadData = new FormData();
          uploadData.append('file', newCoverFile);
          uploadData.append('api_key', apiKey!);
          uploadData.append('timestamp', timestamp.toString());
          uploadData.append('signature', signature);
          uploadData.append('folder', folder);

          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: uploadData
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Cloudinary raw error:", errorText);
            let errorMessage = "L'envoi de la couverture a échoué.";
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {}
            throw new Error(errorMessage);
          }
          const result = await response.json();
          finalCoverUrl = result.secure_url;
        } catch (error: any) {
          console.error("Cloudinary error:", error);
          throw new Error(error.message);
        } finally {
          setIsUploading(false);
        }
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
        'coverImage.imageUrl': finalCoverUrl,
        updatedAt: serverTimestamp()
      });

      toast({ title: "Légende mise à jour !" });
      router.push(`/dashboard/creations/${storyId}`);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <Button onClick={handleSave} disabled={isSaving || isUploading} className="rounded-xl h-14 bg-primary text-black font-black px-10 shadow-xl">
          {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : "Enregistrer les modifications"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-12">
        <Card className="bg-stone-900/50 border-white/5 rounded-[2.5rem] p-8 space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-stone-500">Titre</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-14 bg-white/5 border-white/5 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-stone-500">Synopsis</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[180px] bg-white/5 border-white/10 rounded-2xl p-6 italic" />
            </div>
          </div>
        </Card>

        <aside className="space-y-8">
          <Card className="bg-stone-900 border-white/5 rounded-[2.5rem] p-8 text-center space-y-6">
            <Label className="text-[10px] uppercase font-black text-stone-500">Couverture via CDN</Label>
            <div className="relative group mx-auto w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              {coverPreview && <Image src={coverPreview} alt="Preview" fill className="object-cover" />}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud className="h-8 w-8 text-white mb-2" />
                <span className="text-[10px] font-black uppercase text-white">Changer</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            {isUploading && <p className="text-[10px] font-black text-primary animate-pulse uppercase">Upload Cloudinary...</p>}
          </Card>
          
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex gap-3">
            <Cloud className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-[10px] text-stone-400 italic">Cloudinary remplace désormais Firebase Storage pour une meilleure gestion des médias.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
