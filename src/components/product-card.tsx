import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useAuthModal } from './providers/auth-modal-provider';
import { auth } from '@/lib/firebase';
import { getOptimizedImage } from '@/lib/image-utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { openAuthModal } = useAuthModal();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth.currentUser) {
      openAuthModal('ajouter ce produit au panier');
      return;
    }
    // Simulation logic here
  };

  const optimizedImageUrl = getOptimizedImage(product.image.imageUrl, {
    width: 500,
    height: 500,
    aspectRatio: '1:1',
    crop: 'fill',
    gravity: 'auto'
  });

  return (
    <Card className="overflow-hidden group flex flex-col transition-all hover:shadow-lg border-white/5 bg-stone-900/50 hover:border-primary/30 rounded-[2rem]">
      <Link href={`/shop/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-square w-full overflow-hidden relative">
            <Image
              src={optimizedImageUrl}
              alt={product.name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              data-ai-hint={product.image.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-xl font-display font-black leading-tight group-hover:text-primary transition-colors text-white">
            {product.name}
          </CardTitle>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-black text-primary">
              {product.price.toFixed(2)}€
            </p>
            <Badge variant="outline" className="text-[10px] uppercase font-black border-white/10 text-stone-500">
              {product.category}
            </Badge>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button onClick={handleAddToCart} className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-primary hover:text-black transition-all">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}
