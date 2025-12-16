import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProduct } from '@/lib/medusa/products';
import { AddToCartForm } from '@/components/products/add-to-cart-form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.title,
    description: product.description || `Book ${product.title} at PariharaOnline`,
    openGraph: {
      title: product.title,
      description: product.description || `Book ${product.title} at PariharaOnline`,
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
    },
  };
}

function ProductLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

async function ProductDetail({ handle }: { handle: string }) {
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const variant = product.variants?.[0];
  const prices = variant?.prices || [];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl text-stone-300">P</span>
            </div>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {product.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg bg-stone-100"
              >
                <Image
                  src={image.url}
                  alt={`${product.title} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 12.5vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-amber-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/collections" className="hover:text-amber-600">
            Services
          </Link>
          {product.collection && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/collections/${product.collection.handle}`}
                className="hover:text-amber-600"
              >
                {product.collection.title}
              </Link>
            </>
          )}
        </nav>

        {product.collection && (
          <Badge className="mb-4">{product.collection.title}</Badge>
        )}

        <h1 className="mb-4 text-3xl font-bold text-stone-900">
          {product.title}
        </h1>

        {/* Prices */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {prices.map((price) => (
            <div key={price.id} className="text-2xl font-bold text-amber-600">
              {formatPrice(price.amount, price.currency_code)}
              <span className="ml-1 text-sm font-normal text-stone-500">
                ({price.currency_code.toUpperCase()})
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-8">
            <h2 className="mb-2 font-semibold text-stone-900">Description</h2>
            <p className="text-stone-600 whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Add to Cart Form */}
        <AddToCartForm product={product} showPujaDetails={true} />
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;

  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<ProductLoading />}>
        <ProductDetail handle={handle} />
      </Suspense>
    </div>
  );
}
