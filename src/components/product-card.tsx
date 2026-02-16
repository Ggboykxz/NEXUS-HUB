import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={`/shop/${product.id}`}>
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
      </Link>
      <CardContent className="p-4">
        <Link href={`/shop/${product.id}`}>
          <CardTitle className="text-lg leading-tight font-headline hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-xl font-semibold text-primary mt-2">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}
