'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CldUploadWidget } from 'next-cloudinary';
import { 
  Settings, Coins, Camera, Loader2, 
  ShieldCheck, Smartphone, CreditCard, Bitcoin, Check,
  History, Banknote, ChevronRight,
  ShieldAlert, LogOut, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, getIdToken } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

// Définir une interface étendue pour inclure bannerURL si elle manque dans le type de base
interface EditableUserProfile extends UserProfile {
  bannerURL?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<EditableUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as EditableUserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUploadSuccess = (result: any, type: 'avatar' | 'banner') => {
    const secureUrl = result.info.secure_url;
    if (type === 'avatar') {
      setProfile(prev => prev ? { ...prev, photoURL: secureUrl } : null);
    } else {
      setProfile(prev => prev ? { ...prev, bannerURL: secureUrl } : null);
    }
    toast({ title: "Image mise à jour !", description: "N'oubliez pas d'enregistrer les modifications." });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: profile.photoURL,
        bannerURL: profile.bannerURL,
        // ... (autres champs restent inchangés)
      });
      toast({ title: "Profil enregistré !", description: "Votre identité a été mise à jour." });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };
  
  // Le reste des fonctions (gestion des paiements, sécurité, etc.) reste ici...
  const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: ['payouts-history', profile?.uid],
    enabled: !!profile?.uid && profile.role?.startsWith('artist'),
    queryFn: async () => {
      const q = query(
        collection(db, 'users', profile!.uid, 'payouts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const handleRevokeAllSessions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsRevoking(true);
    try {
      const token = await getIdToken(user, true);
      const response = await fetch('/api/auth/revoke', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Échec de la révocation');
      await signOut(auth);
      toast({ title: "Sécurité activée", description: "Tous vos appareils ont été déconnectés." });
      router.push('/');
    } catch (error) {
      toast({ title: "Erreur de sécurité", variant: "destructive" });
    } finally {
      setIsRevoking(false);
    }
  };


  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!profile) return <div className="container text-center py-24"><p>Veuillez vous connecter.</p><Button asChild><Link href="/login">Se connecter</Link></Button></div>;

  const isArtist = profile.role?.startsWith('artist');

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl"><Settings className="w-10 h-10 text-primary" /></div>
          <div>
            <h1 className="text-4xl font-bold font-display tracking-tight">Configuration</h1>
            <p className="text-stone-500 font-light italic">Identité, économie et sécurité du Hub.</p>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/20 bg-primary text-black gold-shimmer">
          Enregistrer les modifications
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={cn("grid w-full bg-muted/50 p-1 rounded-2xl h-auto mb-10 border border-border/50", isArtist ? "grid-cols-4" : "grid-cols-3")}>
          {/* ... Triggers ... */}
        </TabsList>
        
        <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            
            {/* --- SECTION BANNIÈRE --- */}
            <div className="relative w-full h-48 bg-stone-900">
              {profile.bannerURL && (
                <Image src={profile.bannerURL} alt="Bannière" layout="fill" objectFit="cover" className="opacity-50" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(res) => handleUploadSuccess(res, 'banner')}>
                  {({ open }) => (
                    <Button variant="outline" onClick={() => open()} className="bg-black/50 border-white/20 hover:bg-black/80 text-white rounded-full font-bold gap-2">
                      <Camera className="h-4 w-4" /> Changer la bannière
                    </Button>
                  )}
                </CldUploadWidget>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* --- SECTION AVATAR ET PSEUDO --- */}
              <div className="flex flex-col md:flex-row items-center gap-8 -mt-24">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-card ring-4 ring-primary shadow-2xl">
                    <AvatarImage src={profile.photoURL || ''} alt="Avatar" />
                    <AvatarFallback className="text-3xl font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(res) => handleUploadSuccess(res, 'avatar')}>
                    {({ open }) => (
                       <Button onClick={() => open()} size="icon" className="absolute bottom-1 right-1 rounded-full bg-primary text-black hover:bg-primary/80">
                         <Camera className="h-4 w-4" />
                       </Button>
                    )}
                  </CldUploadWidget>
                </div>
                <div className="flex-1 space-y-4 w-full pt-16">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pseudo</Label>
                    <Input 
                      value={profile.displayName || ''} 
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      className="rounded-2xl bg-muted/30 border-none h-12"
                    />
                  </div>
                </div>
              </div>
              
              {/* --- SECTION BIOGRAPHIE --- */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Biographie</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="min-h-[120px] rounded-[2rem] bg-muted/30 border-none p-6 italic"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ... Autres TabsContent (revenues, africoins, privacy) ... */}

      </Tabs>
    </div>
  );
}
