'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, LayoutGrid, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { collection, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";

export default function SubmitPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async () => {
    if (!user) {
      openAuthModal('pour lancer votre premier projet');
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: "Titre requis", description: "Veuillez donner un nom à votre légende.", variant: "destructive" });
      return;
    }
    
    setIsCreating(true);

    try {
      // Génération du slug
      let slug = formData.title.trim().toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (!slug) slug = `projet-${Date.now()}`;
      
      // Vérification d'existence
      const storyRef = doc(db, "stories", slug);
      const storySnap = await getDoc(storyRef);
      const finalSlug = storySnap.exists() ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

      // Image par défaut (Placeholder Nexus)
      const publicUrl = 'https://firebasestorage.googleapis.com/v0/b/nexushub-7a96d.appspot.com/o/assets%2Fplaceholder.png?alt=media&token=8be4e520-2228-4475-a33d-39263435f3be';

      const storyData = {
        id: finalSlug,
        slug: finalSlug,
        title: formData.title.trim(),
        description: formData.description.trim() || "Aucune description fournie.",
        format: "Webtoon",
        status: "En cours",
        genre: "Action",
        genreSlug: "action",
        artistId: user.uid,
        artistName: user.displayName || 'Artiste Nexus',
        artistSlug: user.displayName?.toLowerCase().replace(/\s+/g, '-') || 'artiste',
        coverImage: { 
          imageUrl: publicUrl,
          imageHint: "comic cover placeholder"
        },
        isPublished: false,
        isBanned: false,
        isOriginal: false,
        isPremium: false,
        views: 0,
        likes: 0,
        subscriptions: 0,
        chapterCount: 0,
        rating: 5.0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: ["nouveau"]
      };

      await setDoc(doc(db, "stories", finalSlug), storyData);

      toast({ title: "Légende Initialisée !", description: "Bienvenue dans l'Atelier." });
      router.push(`/dashboard/creations/${finalSlug}`);

    } catch (error: any) {
      console.error("Erreur de création:", error);
      toast({ 
        title: "Échec de la création", 
        description: "Une erreur technique est survenue. Réessayez dans quelques instants.", 
        variant: "destructive" 
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
      return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
      <div className="text-center mb-12 space-y-4">
        <div className="bg-primary/10 p-4 rounded-3xl w-fit mx-auto shadow-inner">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">Graver une <span className="gold-resplendant">Légende</span></h1>
        <p className="text-lg text-stone-400 italic font-light">"Chaque épopée commence par une première intention."</p>
      </div>
      
      <Card className="shadow-2xl border-white/5 bg-stone-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <div className="h-1.5 w-full bg-primary" />
        <CardHeader className="p-10 pb-0">
            <CardTitle className="text-2xl font-display flex items-center gap-3">
              <FileText className="text-primary h-6 w-6" />
              Fondations du Récit
            </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
            <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Titre de l'œuvre</Label>
                <Input 
                  id="title" 
                  placeholder="Ex: Les Chroniques du Sahel" 
                  className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:border-primary transition-all"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
            <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Synopsis (Optionnel)</Label>
                <Textarea 
                  id="description" 
                  placeholder="De quoi parle votre histoire ? (Visible par les lecteurs)" 
                  className="min-h-[150px] bg-white/5 border-white/10 rounded-[2rem] p-6 text-white italic font-light focus:border-primary transition-all"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <p className="text-[9px] font-black uppercase text-stone-500">Format</p>
                <p className="text-xs font-bold text-white">Webtoon (Défaut)</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <p className="text-[9px] font-black uppercase text-stone-500">Statut</p>
                <p className="text-xs font-bold text-white">Brouillon</p>
              </div>
            </div>
        </CardContent>
        <CardFooter className="p-10 bg-black/20 border-t border-white/5">
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || !formData.title.trim()} 
            className="w-full h-16 rounded-2xl font-black text-xl bg-primary text-black gold-shimmer shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
              {isCreating ? (<><Loader2 className="mr-3 h-6 w-6 animate-spin" />Initialisation...</>) : "Ouvrir mon Atelier"}
          </Button>
        </CardFooter>
      </Card>

      <p className="text-center text-[10px] text-stone-600 uppercase tracking-[0.3em] mt-8 font-bold">
        En publiant, vous acceptez les conditions de propriété intellectuelle du Hub.
      </p>
    </div>
  );
}