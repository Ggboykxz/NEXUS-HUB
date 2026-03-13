'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Coins, Star, ThumbsUp, PackageCheck, ShieldCheck, Tag, Heart, 
  Loader2, Info, ChevronRight, X, AlertTriangle
} from 'lucide-react';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  doc, getDoc, runTransaction, increment, 
  serverTimestamp, collection, addDoc, updateDoc, writeBatch,
  setDoc, deleteDoc
} from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COIN_TO_EUR = 0.02;
const EUR_TO_FCFA = 655.957;

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [region, setRegion] = useState('EUR');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as any : null;
    },
  });

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as any : null;
    },
    enabled: !!currentUser,
  });

  const { data: isInWishlist, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['wishlist', currentUser?.uid, productId],
    queryFn: async () => {
        if (!currentUser) return false;
        const wishlistRef = doc(db, 'users', currentUser.uid, 'wishlist', productId);
        const docSnap = await getDoc(wishlistRef);
        return docSnap.exists();
    },
    enabled: !!currentUser && !!productId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
        if (!currentUser || !product) throw new Error("Utilisateur ou produit manquant.");

        const userCoins = userProfile?.africoins || 0;
        if (userCoins < product.price) {
            toast({ title: "Solde insuffisant", description: "Rechargez vos AfriCoins pour continuer.", variant: "destructive" });
            router.push('/africoins');
            throw new Error("Solde insuffisant");
        }
        if (product.stock <= 0) throw new Error("Ce produit n'est plus en stock.");

        const batch = writeBatch(db);
        const userRef = doc(db, 'users', currentUser.uid);
        const productRef = doc(db, 'products', productId);
        const purchaseRef = doc(collection(db, 'users', currentUser.uid, 'purchases'));

        batch.update(userRef, { africoins: increment(-product.price) });
        batch.update(productRef, { stock: increment(-1) });
        batch.set(purchaseRef, {
            productId: product.id,
            title: product.title,
            price: product.price,
            type: product.type,
            createdAt: serverTimestamp(),
        });

        await batch.commit();
    },
    onSuccess: () => {
        toast({ title: "Achat réussi !", description: "Votre commande a été validée. Retrouvez-la dans votre profil." });
        queryClient.invalidateQueries({ queryKey: ['user-profile', currentUser?.uid] });
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        router.push('/profile/me');
    },
    onError: (error: any) => {
        if (error.message !== "Solde insuffisant") {
            toast({ title: "Erreur lors de l'achat", description: error.message, variant: "destructive" });
        }
    },
    onSettled: () => {
        setIsConfirmOpen(false);
    }
  });

  const wishlistMutation = useMutation({
      mutationFn: async (isAdding: boolean) => {
          if (!currentUser) throw new Error("Connexion requise");
          const ref = doc(db, 'users', currentUser.uid, 'wishlist', productId);
          if (isAdding) {
              await setDoc(ref, { productId: product.id, title: product.title, addedAt: serverTimestamp() });
          } else {
              await deleteDoc(ref);
          }
      },
      onSuccess: (_, isAdding) => {
          toast({ title: isAdding ? "Ajouté aux favoris !" : "Retiré des favoris" });
          queryClient.invalidateQueries({ queryKey: ['wishlist', currentUser?.uid, productId] });
      },
      onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: 'destructive' })
  });

  if (isLoadingProduct) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!product) {
    notFound();
  }

  const priceInEur = product.price * COIN_TO_EUR;
  const priceInFcfa = priceInEur * EUR_TO_FCFA;

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-stone-900/50 rounded-3xl overflow-hidden aspect-square border border-white/10 shadow-2xl">
              <Image src={product.imageUrl || 'https://picsum.photos/seed/product/1000/1000'} alt={product.title} width={1000} height={1000} className="object-cover w-full h-full" />
            </div>
            {/* Thumbnails can be added here */}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="border-primary/20 text-primary mb-2 text-[10px] font-black uppercase tracking-widest">{product.type}</Badge>
              <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">{product.title}</h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-primary"><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4" /></div>
                <span className="text-sm text-stone-400">(12 avis)</span>
              </div>
              <p className="text-stone-400 mt-6 font-light max-w-prose italic">{product.description}</p>
            </div>

            <Card className="bg-stone-900/50 border-white/5 rounded-[2rem] p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-2">Prix</h3>
                  <p className="text-4xl font-display font-black text-primary flex items-center gap-3">{product.price} <Coins className="h-7 w-7 opacity-50" /></p>
                  <p className="text-sm text-stone-400 font-bold">
                    ~ {region === 'EUR' ? `${priceInEur.toFixed(2)} €` : `${priceInFcfa.toFixed(0)} FCFA`}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1">
                    <Button onClick={() => setRegion('EUR')} size="sm" className={cn("h-7 text-[9px] font-black rounded-full px-3", region === 'EUR' ? 'bg-primary text-black' : 'bg-transparent text-white')}>EUR</Button>
                    <Button onClick={() => setRegion('FCFA')} size="sm" className={cn("h-7 text-[9px] font-black rounded-full px-3", region === 'FCFA' ? 'bg-primary text-black' : 'bg-transparent text-white')}>FCFA</Button>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button onClick={() => currentUser ? setIsConfirmOpen(true) : openAuthModal('acheter ce produit')} disabled={product.stock <= 0} size="lg" className="flex-1 h-14 rounded-2xl bg-primary text-black font-black text-base gold-shimmer shadow-lg shadow-primary/20">
                  {product.stock > 0 ? 'Acheter avec AfriCoins' : 'Stock épuisé'}
                </Button>
                <Button 
                    onClick={() => currentUser ? wishlistMutation.mutate(!isInWishlist) : openAuthModal('ajouter aux favoris')}
                    disabled={wishlistMutation.isPending || isLoadingWishlist}
                    variant="outline" 
                    size="icon" 
                    className={cn("h-14 w-14 rounded-2xl border-white/10 text-white", isInWishlist && "bg-rose-500/10 border-rose-500/50 text-rose-500")}
                >
                  {wishlistMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin"/> : <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />}
                </Button>
              </div>
              {product.stock > 0 && product.stock < 10 && <p className="text-center text-amber-500 text-xs font-bold mt-4 animate-pulse">Plus que {product.stock} exemplaires !</p>}
            </Card>

            <div className="space-y-4 text-sm font-light text-stone-400">
              <div className="flex items-center gap-3"><PackageCheck className="h-5 w-5 text-primary" /> <p>Produit numérique, livraison instantanée dans votre profil.</p></div>
              <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /> <p>Paiement sécurisé par la blockchain Nexus (simulation).</p></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-lg">
            <DialogHeader className="text-center space-y-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit border border-primary/20">
                    <Coins className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-display font-black gold-resplendant">Confirmer la transaction</DialogTitle>
                <DialogDescription className="text-stone-400 italic">"Un trésor est à votre portée. Confirmez-vous son acquisition ?"</DialogDescription>
            </DialogHeader>
            <div className="my-8 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-sm">Produit</span>
                    <span className="font-bold text-white text-sm">{product.title}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-sm">Votre solde</span>
                    <span className="font-bold text-white">{(userProfile?.africoins || 0).toLocaleString()} 🪙</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-rose-500/80 text-sm">Coût de l'opération</span>
                    <span className="font-bold text-rose-500">- {product.price.toLocaleString()} 🪙</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                    <span className="text-primary text-sm">Solde final estimé</span>
                    <span className="font-bold text-primary text-lg">{(userProfile?.africoins - product.price).toLocaleString()} 🪙</span>
                </div>
            </div>
            <DialogFooter className="gap-3">
                <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="h-14 rounded-xl font-bold">Annuler</Button>
                <Button onClick={() => purchaseMutation.mutate()} disabled={purchaseMutation.isPending} className="flex-1 h-14 rounded-xl bg-primary text-black font-black text-lg gold-shimmer">
                    {purchaseMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin"/> : "Confirmer et Payer"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
