import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts, getCollections } from '@/lib/medusa/products';
import { ProductGrid } from '@/components/products';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Services',
  description: 'Browse all temple services, pujas, homams, and prasad offerings.',
};

function CollectionsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      ))}
    </div>
  );
}

async function CollectionsList() {
  const collections = await getCollections();

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-xl font-semibold text-stone-900">Categories</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.handle}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-medium text-stone-900">{collection.title}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function ProductsList() {
  const { data: products } = await getProducts({ limit: 12 });

  return <ProductGrid products={products} />;
}

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-stone-900">All Services</h1>
        <p className="text-stone-600">
          Browse our complete collection of temple services and sacred offerings
        </p>
      </div>

      <Suspense fallback={<CollectionsLoading />}>
        <CollectionsList />
      </Suspense>

      <h2 className="mb-6 text-xl font-semibold text-stone-900">All Services</h2>
      <Suspense fallback={<ProductsLoading />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
