'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CldUploadWidget } from 'next-cloudinary';
import { 
  Settings, Coins, Camera, Loader2, 
  ShieldAlert, UserCircle, Globe,
  Lock, Banknote, History, ChevronRight, Plus, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: profile.photoURL,
        bannerURL: profile.bannerURL || "",
        'preferences.privacy': profile.preferences?.privacy,
        'socialLinks': profile.socialLinks || {}
      });
      toast({ title: "Sanctuaire mis à jour !", description: "Vos modifications ont été gravées dans les archives." });
      queryClient.invalidateQueries({ queryKey: ['user-profile', profile.uid] });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadSuccess = (result: any, type: 'avatar' | 'banner') => {
    const secureUrl = result.info.secure_url;
    if (type === 'avatar') {
      setProfile(prev => prev ? { ...prev, photoURL: secureUrl } : null);
    } else {
      setProfile(prev => prev ? { ...prev, bannerURL: secureUrl } : null);
    }
    toast({ title: "Média chargé !", description: "N'oubliez pas d'enregistrer les modifications globales." });
  };

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', profile?.uid],
    enabled: !!profile?.uid,
    queryFn: async () => {
      const q = query(collection(db, 'users', profile!.uid, 'transactions'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!profile) return null;

  const isArtist = profile.role?.toLowerCase().includes('artist');

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl"><Settings className="w-10 h-10 text-primary" /></div>
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tighter text-white">Mon Sanctuaire</h1>
              <p className="text-stone-500 italic font-light">Identité, économie et sécurité du Hub.</p>
            </div>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} disabled={isSaving} className="rounded-full px-10 h-14 font-black shadow-2xl shadow-primary/20 bg-primary text-black gold-shimmer text-lg">
          {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : "Graver les modifications"}
        </Button>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className={cn("grid w-full bg-muted/50 p-1 rounded-2xl h-auto mb-12 border border-border/50", isArtist ? "grid-cols-4" : "grid-cols-3")}>
          <TabsTrigger value="identity" className="rounded-xl py-3 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-stone-900 data-[state=active]:text-primary">
            <UserCircle className="h-4 w-4" /> Identité
          </TabsTrigger>
          <TabsTrigger value="economy" className="rounded-xl py-3 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-stone-900 data-[state=active]:text-emerald-500">
            <Coins className="h-4 w-4" /> Économie
          </TabsTrigger>
          {isArtist && (
            <TabsTrigger value="revenues" className="rounded-xl py-3 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-stone-900 data-[state=active]:text-amber-500">
              <Banknote className="h-4 w-4" /> Revenus
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="rounded-xl py-3 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-stone-900 data-[state=active]:text-rose-500">
            <ShieldAlert className="h-4 w-4" /> Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-stone-900/50 shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="relative h-48 md:h-64 bg-stone-900 group">
              {profile.bannerURL && (
                <Image src={profile.bannerURL} alt="Bannière" fill className="object-cover opacity-50 transition-all group-hover:scale-105" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(res) => handleUploadSuccess(res, 'banner')}>
                  {({ open }) => (
                    <Button variant="outline" onClick={() => open()} className="bg-stone-900/80 border-white/20 text-white rounded-full font-bold h-12 px-8">
                      <Camera className="h-4 w-4 mr-2" /> Changer la Bannière
                    </Button>
                  )}
                </CldUploadWidget>
              </div>
            </div>

            <div className="p-10 pt-0 relative">
              <div className="flex flex-col md:flex-row items-center gap-10 -mt-20 md:-mt-24 mb-10">
                <div className="relative group">
                  <Avatar className="h-40 w-40 border-[8px] border-stone-950 ring-4 ring-primary/20 shadow-2xl">
                    <AvatarImage src={profile.photoURL} alt="Avatar" className="object-cover" />
                    <AvatarFallback className="bg-stone-900 text-primary text-4xl font-black">{profile.displayName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(res) => handleUploadSuccess(res, 'avatar')}>
                    {({ open }) => (
                      <Button onClick={() => open()} size="icon" className="absolute bottom-2 right-2 rounded-full h-10 w-10 bg-primary text-black hover:bg-primary/80 shadow-xl">
                        <Camera className="h-5 w-5" />
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
                <div className="flex-1 space-y-6 w-full pt-8 md:pt-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Nom Public</Label>
                      <Input 
                        value={profile.displayName} 
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Identifiant @slug (Fixe)</Label>
                      <Input value={`@${profile.slug}`} disabled className="rounded-2xl bg-white/5 border-white/10 h-14 opacity-50 cursor-not-allowed font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Biographie</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Parlez-nous de votre voyage..."
                    className="min-h-[150px] rounded-[2rem] bg-white/5 border-white/5 p-8 italic font-light text-lg leading-relaxed focus-visible:ring-primary"
                  />
                </div>

                <Separator className="bg-white/5" />

                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2"><Lock className="h-4 w-4" /> Confidentialité</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Lecture en cours</p>
                        <p className="text-[10px] text-stone-500 uppercase">Afficher ma série actuelle</p>
                      </div>
                      <Switch 
                        checked={profile.preferences?.privacy?.showCurrentReading} 
                        onCheckedChange={(val) => setProfile({...profile, preferences: { ...profile.preferences!, privacy: { ...profile.preferences!.privacy, showCurrentReading: val } }})} 
                      />
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Historique Public</p>
                        <p className="text-[10px] text-stone-500 uppercase">Visible par les abonnés</p>
                      </div>
                      <Switch 
                        checked={profile.preferences?.privacy?.showHistory} 
                        onCheckedChange={(val) => setProfile({...profile, preferences: { ...profile.preferences!, privacy: { ...profile.preferences!.privacy, showHistory: val } }})} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="economy" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1 bg-stone-900/50 border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,168,67,0.2)]">
                <Coins className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-stone-500 tracking-widest">Solde Actuel</p>
                <p className="text-5xl font-black text-white">{profile.afriCoins} <span className="text-lg text-primary">🪙</span></p>
              </div>
              <Button asChild className="w-full h-14 rounded-2xl bg-primary text-black font-black gold-shimmer">
                <Link href="/africoins">Recharger mes Coins</Link>
              </Button>
            </Card>

            <Card className="md:col-span-2 bg-stone-900/50 border-white/5 rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-xl font-display font-black flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Transactions Récentes</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl", t.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary')}>
                            {t.type === 'purchase' ? <Plus className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white capitalize">{t.type === 'purchase' ? 'Achat de Pack' : 'Utilisation'}</p>
                            <p className="text-[9px] text-stone-500 uppercase font-bold">{new Date(t.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className={cn("font-black text-lg", t.amount > 0 ? 'text-emerald-500' : 'text-primary')}>
                          {t.amount > 0 ? `+${t.amount}` : t.amount} 🪙
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-stone-600 italic text-sm">"Les annales économiques sont encore vierges."</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-8 animate-in fade-in duration-500">
          <Card className="bg-stone-900/50 border-white/5 rounded-[3rem] p-10 max-w-2xl mx-auto space-y-10">
            <div className="flex items-center gap-6 pb-10 border-b border-white/5">
              <div className="h-16 w-16 bg-rose-500/10 rounded-[2rem] flex items-center justify-center shadow-inner"><ShieldAlert className="h-8 w-8 text-rose-500" /></div>
              <div>
                <h3 className="text-2xl font-display font-black text-white">Zone de Sécurité</h3>
                <p className="text-stone-500 italic text-sm">Protections avancées pour votre compte Nexus.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-8 bg-rose-500/[0.02] rounded-[2.5rem] border border-rose-500/10 group hover:border-rose-500/30 transition-all">
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-500">Supprimer le compte</h4>
                  <p className="text-xs text-stone-500 leading-relaxed italic">"Cette action est irréversible. Vos légendes seront perdues."</p>
                </div>
                <Button variant="ghost" className="rounded-xl text-stone-600 hover:bg-rose-600 hover:text-white"><Trash2 className="h-5 w-5 mr-2" /> Supprimer</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}