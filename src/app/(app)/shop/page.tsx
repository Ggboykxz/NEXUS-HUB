'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ProductCard } from '@/components/product-card';
import { Store, Shirt, Palette, Sparkles, Download, PackageOpen, Loader2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/lib/types';
import Image from 'next/image';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<'Tous' | 'Vêtements' | 'E-books' | 'Art'>('Tous');

  const categories = [
    { name: 'Tous', icon: Store },
    { name: 'Vêtements', icon: Shirt },
    { name: 'E-books', icon: Download },
    { name: 'Art', icon: Palette }
  ];

  const { data: fetchedProducts = [], isLoading } = useQuery({
    queryKey: ['shop-products', activeCategory],
    queryFn: async () => {
      const productsRef = collection(db, 'products');
      let q = query(productsRef);
      
      if (activeCategory !== 'Tous') {
        q = query(productsRef, where('category', '==', activeCategory));
      }
      
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    }
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 1. HERO BOUTIQUE 2.0 */}
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <PackageOpen className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Merchandising & IP</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              Portez vos <br/><span className="gold-resplendant">Légendes</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Soutenez vos artistes en achetant des produits dérivés officiels. Impression à la demande via Printful, expédition mondiale sans stock."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-12">Explorer les E-books</Button>
              <Button variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-12 px-8">Vendre mon Merch</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">100%</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Sans Stock</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">Global</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Livraison</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
            {categories.map((cat) => (
                <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name as any)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        activeCategory === cat.name 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    <cat.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{cat.name}</span>
                </button>
            ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-stone-500 font-display font-black uppercase tracking-widest text-[10px]">Ouverture de la réserve...</p>
        </div>
      ) : fetchedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {fetchedProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              {product.universe && (
                  <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-white/10 text-[10px] uppercase font-bold tracking-widest">
                      {product.universe}
                  </Badge>
              )}
              {product.isCollectible && (
                  <Badge className="absolute top-4 right-4 bg-amber-500 text-black border-none text-[8px] font-black uppercase tracking-tighter px-2">
                      <Zap className="h-3 w-3 mr-1 inline fill-current" /> Édition Collectionneur
                  </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
          <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground italic">Bientôt de nouveaux produits dans cette catégorie !</p>
          </div>
      )}

      {/* VISION IP SECTION */}
      <section className="mt-24 p-12 rounded-[3rem] bg-stone-900 text-white relative overflow-hidden border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                  <div className="space-y-4">
                      <h2 className="text-4xl font-display font-black gold-resplendant leading-tight">Valorisez votre <br/> Propriété Intellectuelle</h2>
                      <p className="text-stone-400 text-lg font-light leading-relaxed italic">
                          "NexusHub n'est pas qu'une plateforme de lecture. Nous sommes l'agent de votre talent. De l'impression à la demande aux droits d'adaptation cinématographique, nous bâtissons l'empire de votre univers."
                      </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <div className="bg-white/5 p-2 rounded-lg w-fit"><Shirt className="h-5 w-5 text-primary" /></div>
                          <h4 className="font-bold text-sm">Zéro Stock</h4>
                          <p className="text-[10px] text-stone-500 leading-snug">Vendez vos T-shirts via Printful sans avancer de fonds.</p>
                      </div>
                      <div className="space-y-2">
                          <div className="bg-white/5 p-2 rounded-lg w-fit"><Download className="h-5 w-5 text-emerald-500" /></div>
                          <h4 className="font-bold text-sm">E-books Premium</h4>
                          <p className="text-[10px] text-stone-500 leading-snug">Vendez vos séries terminées en format haute définition.</p>
                      </div>
                  </div>
              </div>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                  <Image src="https://res.cloudinary.com/demo/image/upload/v1/samples/people/artist-working.jpg" alt="Licensing IP" fill className="object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Badge className="bg-primary text-black font-black uppercase text-xs px-6 py-2 shadow-2xl">NexusHub Agency</Badge>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
}
