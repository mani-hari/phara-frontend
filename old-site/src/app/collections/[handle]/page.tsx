import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCollection, getProducts } from '@/lib/medusa/products';
import { ProductGrid } from '@/components/products';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: collection.title,
    description: `Browse ${collection.title} - Temple services and sacred offerings`,
  };
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

async function CollectionProducts({ collectionId }: { collectionId: string }) {
  const { data: products } = await getProducts({
    collection_id: [collectionId],
    limit: 24,
  });

  return <ProductGrid products={products} />;
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const collection = await getCollection(handle);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-600">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/collections" className="hover:text-amber-600">
          Collections
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">{collection.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-stone-900">
          {collection.title}
        </h1>
        <p className="text-stone-600">
          Browse our {collection.title.toLowerCase()} collection
        </p>
      </div>

      <Suspense fallback={<ProductsLoading />}>
        <CollectionProducts collectionId={collection.id} />
      </Suspense>
    </div>
  );
}
