'use client';

import { products } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ExternalLink, ShieldCheck, Truck, RotateCcw, Heart, Share2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/language-provider';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { use } from 'react';
import { auth } from '@/lib/firebase';

export default function ProductDetailPage(props: { params: Promise<{ productId: string }> }) {
  const { productId } = use(props);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  
  const product = products.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  const checkAuth = (action: string) => {
    if (!auth.currentUser) {
      openAuthModal(action);
      return false;
    }
    return true;
  };

  const handlePrintfulOrder = () => {
      if (!checkAuth('finaliser votre commande')) return;
      toast({
          title: "Redirection vers Printful...",
          description: "Vous allez être redirigé vers notre partenaire d'impression pour finaliser votre commande."
      });
      if (product.printfulUrl) {
          setTimeout(() => {
              window.open(product.printfulUrl, '_blank');
          }, 1500);
      }
  };

  const handleFavorite = () => {
    if (!checkAuth('ajouter ce produit à vos favoris')) return;
    toast({ title: "Produit ajouté aux favoris !" });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour à la boutique
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="space-y-6">
            <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/5 bg-muted">
                <Image
                    src={product.image.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={product.image.imageHint}
                    priority
                />
                <Badge className="absolute top-6 left-6 bg-primary/95 backdrop-blur-md text-white border-none px-4 py-1.5 shadow-xl text-xs font-bold uppercase tracking-widest">
                    {product.category}
                </Badge>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square rounded-xl bg-muted border border-border/50 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                        <Image src={product.image.imageUrl} alt={`${product.name} view ${i}`} width={200} height={200} className="object-cover opacity-50 hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col pt-4">
          <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="border-primary/20 text-primary font-bold uppercase tracking-tighter">{product.universe || 'Original'}</Badge>
              <div className="h-px flex-1 bg-border/50" />
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold font-display mb-6 leading-none">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-8">
              <p className="text-4xl font-black text-primary">
                {product.price.toFixed(2)}€
              </p>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">En Stock</Badge>
          </div>

          <p className="text-xl text-foreground/70 leading-relaxed mb-10 font-light italic border-l-4 border-primary/20 pl-6">
            "{product.description}"
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-12">
            <Button size="lg" className="flex-grow h-14 text-lg font-bold shadow-xl shadow-primary/20" onClick={handlePrintfulOrder}>
              <ExternalLink className="mr-2 h-5 w-5" />
              Commander via Printful
            </Button>
            <Button onClick={handleFavorite} variant="outline" size="icon" className="h-14 w-14 rounded-xl border-border/50 hover:text-destructive transition-colors">
                <Heart className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl border-border/50 hover:text-primary transition-colors">
                <Share2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-12 border-t border-border/50">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                  <div className="bg-primary/10 p-3 rounded-xl"><Truck className="h-6 w-6 text-primary" /></div>
                  <div>
                      <p className="font-bold text-sm">Livraison Rapide</p>
                      <p className="text-xs text-muted-foreground">Expédié sous 3-5 jours.</p>
                  </div>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                  <div className="bg-primary/10 p-3 rounded-xl"><RotateCcw className="h-6 w-6 text-primary" /></div>
                  <div>
                      <p className="font-bold text-sm">Retours Faciles</p>
                      <p className="text-xs text-muted-foreground">Satisfait ou remboursé.</p>
                  </div>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                  <div className="bg-primary/10 p-3 rounded-xl"><ShieldCheck className="h-6 w-6 text-primary" /></div>
                  <div>
                      <p className="font-bold text-sm">Paiement Sécurisé</p>
                      <p className="text-xs text-muted-foreground">SSL & 3D Secure.</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}