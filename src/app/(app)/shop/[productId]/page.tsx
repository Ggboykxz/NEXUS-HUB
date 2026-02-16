import { products } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = products.find((p) => p.id === params.productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.image.imageUrl}
            alt={product.name}
            width={800}
            height={800}
            className="w-full h-full object-cover"
            data-ai-hint={product.image.imageHint}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-semibold text-primary mb-6">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            {product.description}
          </p>
          <div className="flex items-center gap-4">
            <Button size="lg" className="flex-grow md:flex-grow-0">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ajouter au panier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
