'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Gift, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, addDoc, updateDoc, increment, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const coinPacks = [
  { coins: 100, price: 1.99, region: 'EUR', bonus: 0, popular: false, id: 'pack_1' },
  { coins: 550, price: 9.99, region: 'EUR', bonus: 50, popular: true, id: 'pack_2' },
  { coins: 1200, price: 19.99, region: 'EUR', bonus: 200, popular: false, id: 'pack_3' },
  { coins: 3000, price: 49.99, region: 'EUR', bonus: 500, popular: false, id: 'pack_4' },
  { coins: 6500, price: 99.99, region: 'EUR', bonus: 1500, popular: false, id: 'pack_5' },
];

const paymentMethods = [
    { id: 'card', name: 'Carte Bancaire', icon: CreditCard },
    { id: 'mobile', name: 'Mobile Money', icon: Smartphone },
    { id: 'crypto', name: 'Bitcoin', icon: Bitcoin },
];

export default function AfriCoinsPage() {
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const handlePurchaseClick = (pack: any) => {
    if (!currentUser) {
        openAuthModal('acheter des AfriCoins');
    } else {
        setSelectedPack(pack);
    }
  }

  const handleConfirmPurchase = async () => {
    if (!currentUser || !selectedPack) return;

    setIsPurchasing(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const purchasesRef = collection(db, 'purchases', currentUser.uid, 'transactions');

      // 1. Create a purchase record
      await addDoc(purchasesRef, {
        coins: selectedPack.coins,
        price: selectedPack.price,
        currency: selectedPack.region,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Simulate payment gateway processing
      await new Promise(r => setTimeout(r, 2000));

      // 3. Update user's balance
      await updateDoc(userRef, {
        africoins: increment(selectedPack.coins + selectedPack.bonus)
      });
      
      toast({ 
        title: "Achat réussi !", 
        description: `${selectedPack.coins + selectedPack.bonus} AfriCoins ont été ajoutés à votre portefeuille.`
      });

    } catch (error) {
        console.error("Purchase failed: ", error);
        toast({ title: "Erreur d'achat", description: "Une erreur est survenue. Veuillez réessayer.", variant: 'destructive' });
    } finally {
        setIsPurchasing(false);
        setSelectedPack(null);
    }
  }

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-16 relative">
          <Badge variant="outline" className="mb-4 border-amber-500/20 text-amber-500 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Portefeuille Virtuel</Badge>
          <h1 className="text-4xl md:text-6xl font-display font-black mb-4 gold-resplendant">AfriCoins</h1>
          <p className="text-lg text-stone-400 font-light max-w-2xl mx-auto italic">"La monnaie de l'imaginaire. Soutenez les artistes, débloquez des chapitres exclusifs et accédez à des contenus uniques."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {coinPacks.map((pack) => (
            <div 
              key={pack.id} 
              className={cn(
                "bg-stone-900/50 border rounded-[2rem] p-8 flex flex-col text-center transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10", 
                pack.popular ? "border-primary/30" : "border-white/10"
              )}
            >
              {pack.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black font-black text-[9px] uppercase tracking-widest">Populaire</Badge>}
              
              <div className="mx-auto bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-full w-fit mb-4 shadow-lg shadow-amber-500/10">
                  <Coins className="h-8 w-8 text-black" />
              </div>
              
              <p className="text-4xl font-black text-white">{pack.coins.toLocaleString('fr-FR')}</p>
              {pack.bonus > 0 && <p className="text-sm font-bold text-primary">+ {pack.bonus} bonus</p>}

              <div className="my-8 flex-1">
                <p className="text-4xl font-display text-white tracking-tighter">{pack.price.toFixed(2)}<span className="text-xl ml-1 text-stone-500">{pack.region}</span></p>
              </div>

              <Button onClick={() => handlePurchaseClick(pack)} className="w-full h-12 rounded-xl font-black bg-primary text-black gold-shimmer text-xs uppercase">
                Acheter ce Pack
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-stone-900/50 border border-white/10 rounded-[2rem] p-12 flex flex-col lg:flex-row items-center gap-12">
            <div className="space-y-4 flex-1">
                <div className="w-fit bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-display font-black text-white">Un Système Juste et Sécurisé</h3>
                <p className="text-stone-400 font-light text-sm max-w-xl">
                    Chaque achat d'AfriCoins est une pierre à l'édifice de la créativité africaine. 70% des revenus générés par le déblocage de chapitres sont directement reversés à l'artiste. Vos transactions sont protégées par les standards les plus élevés du web, en partenariat avec les leaders du paiement.
                </p>
            </div>
            <div className="flex items-center gap-8 opacity-40">
                <p className="text-2xl font-black">Stripe</p>
                <p className="text-2xl font-black">CinetPay</p>
                <p className="text-2xl font-black">PayPal</p>
            </div>
        </div>

      </div>

      <Dialog open={!!selectedPack} onOpenChange={(open) => !open && setSelectedPack(null)}>
        <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2.5rem] p-10 max-w-lg">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Coins className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-display font-black gold-resplendant">Confirmer votre achat</DialogTitle>
          </DialogHeader>
          
          {selectedPack && (
            <div className="space-y-8 py-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-stone-400 text-sm">Vous achetez</p>
                    <p className="text-5xl font-black text-white">{selectedPack.coins.toLocaleString('fr-FR')} <span className="text-primary text-lg">+{selectedPack.bonus}</span></p>
                    <p className="text-amber-400 font-bold">AfriCoins</p>
                    <div className="my-4 h-px bg-white/10" />
                    <p className="text-stone-400 text-sm">Pour un total de</p>
                    <p className="text-2xl font-bold text-white">{selectedPack.price.toFixed(2)} {selectedPack.region}</p>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] uppercase font-black text-stone-500 tracking-widest text-center">Méthode de Paiement</p>
                    <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map(method => (
                            <button 
                                key={method.id} 
                                onClick={() => setPaymentMethod(method.id)}
                                className={cn(
                                    "p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                    paymentMethod === method.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/20"
                                )}
                            >
                                <method.icon className={cn("h-6 w-6", paymentMethod === method.id ? "text-primary" : "text-stone-400")} />
                                <span className="text-[10px] font-bold text-white whitespace-nowrap">{method.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleConfirmPurchase} disabled={isPurchasing} className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg">
              {isPurchasing ? <Loader2 className="animate-spin h-6 w-6" /> : `Confirmer l'achat`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
