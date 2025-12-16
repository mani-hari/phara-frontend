'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useCurrency } from '@/store';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const currency = useCurrency();

  // Find the price for current currency, fallback to first price
  const variant = product.variants?.[0];
  const price = variant?.prices?.find(
    (p) => p.currency_code.toLowerCase() === currency.toLowerCase()
  ) || variant?.prices?.[0];

  return (
    <Link href={`/products/${product.handle}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl text-stone-300">P</span>
            </div>
          )}
          {product.collection && (
            <Badge className="absolute left-3 top-3" variant="secondary">
              {product.collection.title}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 font-medium text-stone-900 line-clamp-2 group-hover:text-amber-600">
            {product.title}
          </h3>
          {product.description && (
            <p className="mb-3 text-sm text-stone-500 line-clamp-2">
              {product.description}
            </p>
          )}
          {price && (
            <p className="text-lg font-semibold text-amber-600">
              {formatPrice(price.amount, price.currency_code)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
