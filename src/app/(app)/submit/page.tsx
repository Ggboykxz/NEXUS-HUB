'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Globe, ChevronRight, CheckCircle2, UploadCloud, Loader2, ShieldAlert, Image as ImageIcon, X, Zap, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";

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
            else reject(new Error('Image compression failed.'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(new Error('Image could not be loaded: ' + err));
    };
    reader.onerror = (err) => reject(new Error('File could not be read: ' + err));
  });
};

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    format: 'Webtoon' as any,
    description: '',
    universeId: '',
    universeRelation: 'Original' as any,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const validateCover = async (file: File): Promise<boolean> => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid Format", description: "Please use JPG, PNG, or WebP.", variant: "destructive" });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Cover image must not exceed 5MB.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = await validateCover(file);
      if (isValid) {
        setCoverFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        e.target.value = '';
      }
    }
  };

  const handleCreate = async () => {
    if (!user) {
      openAuthModal('to launch your first project');
      return;
    }
    if (!coverFile) {
      toast({ title: "Missing Image", description: "Please add a cover image.", variant: "destructive" });
      return;
    }
    
    setIsCreating(true);
    try {
      setCreationStatus("Checking title...");
      let slug = formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      const storyRef = doc(db, "stories", slug);
      const storySnap = await getDoc(storyRef);
      if (storySnap.exists()) {
        slug = `${slug}-${Date.now()}`;
      }
      
      setCreationStatus("Compressing image...");
      const compressedBlob = await compressImage(coverFile, 1200, 0.85);
      
      const storageRef = ref(storage, `covers/${user.uid}/${slug}-${coverFile.name}`);
      console.log(`Attempting to upload to: ${storageRef.fullPath}`);
      setCreationStatus("Uploading cover (0%)...");

      await uploadBytes(storageRef, compressedBlob);
      console.log("Upload successful!");

      setCreationStatus("Getting download URL...");
      const publicUrl = await getDownloadURL(storageRef);

      setCreationStatus("Finalizing legend...");
      const storyData = {
        slug,
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        genreSlug: formData.genre.toLowerCase(),
        format: formData.format,
        artistId: user.uid,
        artistName: user.displayName || 'Nexus Artist',
        coverImage: { imageUrl: publicUrl },
        universeId: formData.universeId || null,
        universeRelation: formData.universeId ? formData.universeRelation : 'Original',
        isPublished: false,
        isBanned: false,
        isOriginal: true,
        isPremium: false,
        views: 0,
        likes: 0,
        subscriptions: 0,
        chapterCount: 0,
        rating: 0,
        tags: [formData.genre],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "stories", slug), storyData);

      toast({
        title: "Legend Created!",
        description: "Your work has been successfully saved.",
      });
      
      router.push('/dashboard/creations');
    } catch (error: any) {
      console.error("Client-side submission error:", error);
      setCreationStatus('');
      toast({
        title: "Creation Failed",
        description: `Error: ${error.message}. Please check console for details.`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const steps = [
    { id: 1, label: "Story", icon: BookOpen },
    { id: 2, label: "Format", icon: Users },
    { id: 3, label: "Showcase", icon: Globe },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="text-center mb-16 space-y-4">
        <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Creative Hatchery</Badge>
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">Launch your <span className="gold-resplendant">Legend</span></h1>
        <p className="text-lg text-stone-400 max-w-2xl mx-auto italic font-light">
          "Your vision deserves a global audience. Follow these steps to initialize your universe in the NexusHub archives."
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                step === s.id ? "bg-primary border-primary text-black shadow-[0_0_25px_rgba(212,168,67,0.4)] scale-110" : 
                step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-stone-900 border-white/5 text-stone-600"
              )}>
                {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-widest", step === s.id ? "text-primary" : "text-stone-600")}>{s.label}</span>
            </div>
          ))}
        </div>
        <Card className="shadow-2xl border-white/5 bg-stone-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="p-10 pb-0">
            <CardTitle className="text-2xl font-display font-black text-white flex items-center gap-3">
              {steps[step - 1].label}
            </CardTitle>
            <CardDescription className="italic text-stone-500">"Publication via the Client SDK for maximum agility."</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8 min-h-[450px]">
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="space-y-3"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Title</Label><Input placeholder="Ex: The Warriors of Kasai" className="h-14 text-xl bg-white/5 border-white/5 rounded-2xl focus:border-primary text-white font-display" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}/></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Main Genre</Label><Select onValueChange={(val) => setFormData({...formData, genre: val})}><SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-bold"><SelectValue placeholder="Choose a destiny" /></SelectTrigger><SelectContent className="bg-stone-900 border-white/10 rounded-2xl"><SelectItem value="Mythology">Mythology</SelectItem><SelectItem value="Afrofuturism">Afrofuturism</SelectItem><SelectItem value="History">History</SelectItem><SelectItem value="Action">Action</SelectItem><SelectItem value="Romance">Romance</SelectItem></SelectContent></Select></div>
                        <div className="space-y-3"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Visibility</Label><div className="h-14 flex items-center px-6 bg-white/5 border border-white/5 rounded-2xl text-stone-400 text-xs font-bold uppercase tracking-widest"><ShieldAlert className="h-4 w-4 mr-2 text-primary" /> Private Draft</div></div>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <div className="space-y-3"><Label className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2"><Globe className="h-3 w-3" /> Link to a universe (Optional)</Label><Input placeholder="Shared universe name (e.g., NexusVerse)" className="h-12 bg-black/40 border-white/10 rounded-xl text-stone-300" value={formData.universeId} onChange={(e) => setFormData({...formData, universeId: e.target.value})}/></div>
                        {formData.universeId && (<div className="space-y-3 animate-in fade-in zoom-in-95"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Narrative Relation</Label><Select value={formData.universeRelation} onValueChange={(val) => setFormData({...formData, universeRelation: val})}><SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="bg-stone-900 border-white/10"><SelectItem value="Original">Original / Pillar</SelectItem><SelectItem value="Prequel">Prequel</SelectItem><SelectItem value="Sequel">Sequel</SelectItem><SelectItem value="Spin-off">Spin-off</SelectItem></SelectContent></Select></div>)}
                    </div>
                    <div className="space-y-3"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Synopsis</Label><Textarea placeholder="Describe your universe and heroes..." className="min-h-[180px] bg-white/5 border-white/5 rounded-[2rem] p-8 text-lg font-light italic text-white focus:border-primary" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/></div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="space-y-6"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 block text-center">Reading Format</Label><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[{ id: 'Webtoon', icon: LayoutGrid, desc: 'Infinite vertical scroll' },{ id: 'BD', icon: BookOpen, desc: 'Classic paginated reading' },{ id: 'One-shot', icon: Zap, desc: 'Short complete story' }].map((f) => (<div key={f.id} className="relative"><input type="radio" name="format" id={f.id} className="peer sr-only" checked={formData.format === f.id} onChange={() => setFormData({...formData, format: f.id as any})}/><label htmlFor={f.id} className="flex flex-col items-center justify-center p-8 border-2 border-white/5 bg-white/5 rounded-[2rem] cursor-pointer transition-all hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/10 group"><f.icon className="h-8 w-8 mb-4 text-stone-600 group-hover:text-primary transition-colors" /><span className="font-display font-black text-white text-lg">{f.id}</span><span className="text-[8px] uppercase font-bold text-stone-500 mt-1 tracking-tighter">{f.desc}</span></label></div>))}</div></div>
                    <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] text-center space-y-2"><p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Workshop Note</p><p className="text-xs text-stone-400 italic">"The Webtoon format is recommended for optimal visibility on mobile (Gabon & West Africa)."</p></div>
                </div>
            )}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 text-center">
                <div className="space-y-4"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Cover Image (2:3 Ratio)</Label><div className="flex justify-center"><div className="relative group">{coverPreview ? (<div className="relative w-48 h-72 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10"><Image src={coverPreview} alt="Preview" fill className="object-cover" /><button onClick={() => {setCoverFile(null); setCoverPreview(null);}} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:bg-rose-600 transition-colors"><X className="h-4 w-4" /></button></div>) : (<label className="flex flex-col items-center justify-center w-48 h-72 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer group"><UploadCloud className="h-12 w-12 text-stone-700 group-hover:text-primary transition-all mb-4" /><span className="text-[9px] font-black uppercase tracking-widest text-stone-600 group-hover:text-primary">Choose a file</span><input type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></label>)}</div></div></div>
                <div className="max-w-md mx-auto space-y-4 bg-stone-950/50 p-8 rounded-[2rem] border border-white/5"><h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Ready for Immortality?</h3><p className="text-xs text-stone-500 leading-relaxed italic font-light">"Your project is now ready to be immortalized on the NexusHub story blockchain, directly from your browser."</p></div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center p-10 bg-white/5 border-t border-white/5">
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || isCreating} className="rounded-xl px-8 h-12 font-bold text-stone-500 hover:text-white">Previous</Button>
            {step < 3 ? (<Button onClick={() => setStep(step + 1)} className="rounded-xl px-10 h-12 font-black bg-primary text-black gold-shimmer">Next <ChevronRight className="ml-2 h-4 w-4" /></Button>) : (<Button onClick={handleCreate} disabled={isCreating || !formData.title || !formData.genre || !coverFile} className="rounded-xl px-12 h-14 font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] group">
                {isCreating ? (<><Loader2 className="mr-3 h-5 w-5 animate-spin" /> {creationStatus || 'Creating...'}</>) : "Launch Project for Life"}
              </Button>)}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
