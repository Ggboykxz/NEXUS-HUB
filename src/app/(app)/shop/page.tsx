
'use client';

import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Store, ShoppingBag, Shirt, Palette, Sparkles, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<'Tous' | 'Vêtements' | 'Accessoires' | 'Art'>('Tous');

  const categories = [
    { name: 'Tous', icon: Store },
    { name: 'Vêtements', icon: Shirt },
    { name: 'Accessoires', icon: ShoppingBag },
    { name: 'Art', icon: Palette }
  ];

  const filteredProducts = activeCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 p-3 rounded-2xl">
                <Store className="w-10 h-10 text-primary" />
            </div>
            <div>
                <h1 className="text-4xl font-bold font-display">Hub Goodies</h1>
                <p className="text-lg text-muted-foreground mt-1">
                    Portez vos histoires préférées. Merchandising officiel NexusHub.
                </p>
            </div>
          </div>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} />
            {product.universe && (
                <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-white/10 text-[10px] uppercase font-bold tracking-widest">
                    {product.universe}
                </Badge>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground italic">Bientôt de nouveaux produits dans cette catégorie !</p>
          </div>
      )}

      <section className="mt-24 p-12 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="max-w-2xl relative z-10">
              <h2 className="text-3xl font-bold font-display mb-4 flex items-center gap-3">
                  <Shirt className="text-primary h-8 w-8" /> Impression à la demande
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  En partenariat avec <strong>Printful</strong>, nous expédions vos goodies partout dans le monde. Chaque achat soutient directement l'artiste créateur de l'univers.
              </p>
              <div className="flex flex-wrap gap-4">
                  <Badge variant="outline" className="border-primary/20 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]">Livraison Mondiale</Badge>
                  <Badge variant="outline" className="border-primary/20 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]">Support Artistes</Badge>
                  <Badge variant="outline" className="border-primary/20 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]">Eco-Friendly</Badge>
              </div>
          </div>
      </section>
    </div>
  );
}
