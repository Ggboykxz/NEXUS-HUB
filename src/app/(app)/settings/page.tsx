'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Shield, Bell, Palette, CreditCard, LogOut, 
  Loader2, Camera, Save, Check, X, Award, Star
} from 'lucide-react';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from 'date-fns';

function ProVerificationCard({ user, profile, storiesCount }: { user: any, profile: any, storiesCount: number }){
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: application, isLoading: isLoadingApplication } = useQuery({
        queryKey: ['proApplication', user.uid],
        queryFn: async () => {
            const q = query(collection(db, 'proApplications'), where('userId', '==', user.uid), where('status', '==', 'pending'));
            const snap = await getDocs(q);
            return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
    });

    const submissionMutation = useMutation({
        mutationFn: async () => {
            await addDoc(collection(db, 'proApplications'), {
                userId: user.uid,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
                bio: profile.bio,
                storiesCount: storiesCount,
                followersCount: profile.subscribersCount || 0,
                status: 'pending',
                submittedAt: serverTimestamp()
            });
        },
        onSuccess: () => {
            toast({ title: "Candidature envoyée !", description: "Votre demande est en cours de révision par notre équipe." });
            queryClient.invalidateQueries({ queryKey: ['proApplication', user.uid] });
        },
        onError: (e: any) => {
            toast({ title: "Erreur", description: e.message, variant: 'destructive' });
        }
    });

    if (profile.isPro) {
        return (
             <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-2 border-amber-500/20 shadow-[-_0px_0px_30px_hsl(var(--primary)/0.1)]">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary gold-resplendant" />
                    </div>
                    <div className='flex-1'>
                        <CardTitle className="text-lg font-black text-white">Artiste Pro Verifié</CardTitle>
                        <CardDescription className="text-amber-400/80 text-xs font-bold">
                            Statut obtenu le {profile.proSince ? format(profile.proSince.toDate(), 'dd MMMM yyyy') : 'N/A'}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    const hasPublishedWork = storiesCount >= 1;
    const isProfileComplete = !!(profile.bio && profile.photoURL && profile.socialLinks && Object.values(profile.socialLinks).some(link => link !== ''));
    const hasEnoughFollowers = (profile.subscribersCount || 0) >= 50;
    const allConditionsMet = hasPublishedWork && isProfileComplete && hasEnoughFollowers;

    const ChecklistItem = ({ isChecked, text }: { isChecked: boolean, text: string }) => (
        <div className={cn("flex items-center gap-3 transition-all", isChecked ? 'text-stone-300' : 'text-stone-500')}>
            {isChecked ? <Check className="h-5 w-5 text-emerald-500 bg-emerald-500/10 p-1 rounded-full"/> : <X className="h-5 w-5 text-rose-500 bg-rose-500/10 p-1 rounded-full"/>}
            <span className="text-sm font-semibold">{text}</span>
        </div>
    );

    return (
        <Card className="bg-stone-900 border-white/5">
            <CardHeader>
                <CardTitle className="font-display font-black tracking-tight text-white">Devenir Artiste Pro</CardTitle>
                <CardDescription className='italic'>Obtenez le badge de vérification, une meilleure visibilité et des avantages exclusifs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Conditions requises</p>
                <div className="space-y-3">
                    <ChecklistItem isChecked={hasPublishedWork} text={`Au moins 1 œuvre publiée (${storiesCount})`} />
                    <ChecklistItem isChecked={isProfileComplete} text="Profil complété à 100%" />
                    <ChecklistItem isChecked={hasEnoughFollowers} text={`Minimum 50 abonnés (${profile.subscribersCount || 0})`} />
                </div>
            </CardContent>
            <CardFooter>
                {application ? (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-bold text-xs py-2 px-4 w-full justify-center">Votre candidature est en cours de révision...</Badge>
                ) : (
                    <Button 
                        className="w-full h-12 font-black text-base" 
                        disabled={!allConditionsMet || submissionMutation.isPending || isLoadingApplication}
                        onClick={() => submissionMutation.mutate()}
                    >
                        {submissionMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin"/> : <><Star className="h-5 w-5 mr-2"/>Soumettre ma candidature</>}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )

}

export default function SettingsPage() {
  const { currentUser, loading } = useAuthModal();
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as any : null;
    },
    enabled: !!currentUser,
  });

   const { data: storiesCount, isLoading: isLoadingStoriesCount } = useQuery({
    queryKey: ['storiesCount', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return 0;
      const q = query(collection(db, 'stories'), where('artistId', '==', currentUser.uid), where('isPublished', '==', true));
      const snap = await getDocs(q);
      return snap.size;
    },
    enabled: !!currentUser && profile?.role === 'artist',
  });

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', artstation: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setSocialLinks(profile.socialLinks || { twitter: '', instagram: '', artstation: '' });
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const profileUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentUser) throw new Error('Not authenticated');
      const userRef = doc(db, 'users', currentUser.uid);
      let photoURL = profile.photoURL;

      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}/${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateDoc(userRef, { ...data, photoURL });
    },
    onSuccess: () => {
        toast({ title: 'Profil mis à jour !'});
        queryClient.invalidateQueries({ queryKey: ['user-profile', currentUser?.uid]});
        setAvatarFile(null);
        setAvatarPreview(null);
    },
    onError: (e: any) => {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  })

  const handleProfileSave = () => {
      profileUpdateMutation.mutate({ displayName, bio });
  }
  
  const handleArtistProfileSave = () => {
      profileUpdateMutation.mutate({ displayName, bio, socialLinks });
  }

  if (loading || isLoadingProfile) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!currentUser || !profile) {
    return <div className="text-center py-20">Connectez-vous pour voir vos paramètres.</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">Paramètres</h1>
        <p className="text-stone-400 font-light italic mt-2">Gérez votre compte, votre profil et vos préférences.</p>
      </header>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-12 items-start">
        <TabsList className="flex md:flex-col h-auto p-2 bg-stone-900/50 border border-white/5 rounded-2xl w-full md:w-64 shrink-0">
          <TabsTrigger value="profile" className="justify-start"><User className="h-4 w-4 mr-2"/> Profil Public</TabsTrigger>
          {profile.role === 'artist' && <TabsTrigger value="artist"><Palette className="h-4 w-4 mr-2"/> Profil Artiste</TabsTrigger>}
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2"/> Sécurité</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2"/> Notifications</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="h-4 w-4 mr-2"/> Facturation</TabsTrigger>
          <div className="flex-1" />
          <Button variant='ghost' onClick={() => signOut(auth)} className="w-full justify-start text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10"><LogOut className="h-4 w-4 mr-2"/> Déconnexion</Button>
        </TabsList>

        <div className="flex-1 w-full">
          <TabsContent value="profile">
            <Card className="bg-stone-900/50 border-white/5">
              <CardHeader>
                <CardTitle>Profil Public</CardTitle>
                <CardDescription>Ces informations seront visibles sur votre page de profil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-white/10">
                            <AvatarImage src={avatarPreview || profile.photoURL} />
                            <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">{displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <Camera className="h-6 w-6" />
                            <input id="avatar-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="displayName">Nom d'utilisateur</Label>
                        <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} className="text-lg" />
                        <p className="text-xs text-stone-500 mt-1">Votre nom public sur NexusHub.</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Parlez un peu de vous..." rows={4} />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleProfileSave} disabled={profileUpdateMutation.isPending} className='h-11 px-6 font-black'>
                    {profileUpdateMutation.isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : <><Save className="h-4 w-4 mr-2"/> Enregistrer</>}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {profile.role === 'artist' && (
            <TabsContent value="artist">
                <div className="space-y-6">
                    <Card className="bg-stone-900/50 border-white/5">
                        <CardHeader>
                            <CardTitle>Profil Artiste</CardTitle>
                            <CardDescription>Ajoutez des liens vers vos réseaux pour que vos fans vous retrouvent.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter / X</Label>
                                <Input id="twitter" value={socialLinks.twitter} onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} placeholder="https://twitter.com/votreprofil" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input id="instagram" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} placeholder="https://instagram.com/votreprofil" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="artstation">ArtStation</Label>
                                <Input id="artstation" value={socialLinks.artstation} onChange={e => setSocialLinks({...socialLinks, artstation: e.target.value})} placeholder="https://artstation.com/votreprofil" />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                             <Button onClick={handleArtistProfileSave} disabled={profileUpdateMutation.isPending} className='h-11 px-6 font-black'>
                                {profileUpdateMutation.isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : <><Save className="h-4 w-4 mr-2"/> Enregistrer les liens</>}
                            </Button>
                        </CardFooter>
                    </Card>
                    {!isLoadingStoriesCount && <ProVerificationCard user={currentUser} profile={profile} storiesCount={storiesCount || 0} />}
                </div>
            </TabsContent>
          )}

          <TabsContent value="security">
             <Card className="bg-stone-900/50 border-white/5">
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez les paramètres de sécurité de votre compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={currentUser.email || ''} disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Changer de mot de passe</Label>
                    <Input type="password" placeholder="Nouveau mot de passe" />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button className='h-11 px-6 font-black'>Mettre à jour</Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}

// Basic implementation for other tabs to avoid errors
function ComingSoonTab({ title }: { title: string }) {
  return (
    <Card className="bg-stone-900/50 border-white/5 text-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-stone-400">Cette section est en cours de développement.</p>
      </CardContent>
    </Card>
  );
}
