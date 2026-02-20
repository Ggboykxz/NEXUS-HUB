import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useAuthModal } from './providers/auth-modal-provider';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { openAuthModal } = useAuthModal();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      openAuthModal('ajouter ce produit au panier');
      return;
    }
    // Simulation logic here
  };

  return (
    <Card className="overflow-hidden group flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={`/shop/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-square w-full overflow-hidden">
            <Image
              src={product.image.imageUrl}
              alt={product.name}
              width={500}
              height={500}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.image.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg leading-tight font-display group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <p className="text-xl font-semibold text-primary mt-2">
            {product.price.toFixed(2)}€
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button onClick={handleAddToCart} className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}