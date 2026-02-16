import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Store } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Store className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold">Boutique Officielle</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">
        Soutenez vos artistes préférés avec nos produits dérivés exclusifs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
