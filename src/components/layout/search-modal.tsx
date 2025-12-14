'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore, useRegionId } from '@/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchProducts } from '@/lib/medusa/products';
import { formatPrice, debounce } from '@/lib/utils';
import type { Product } from '@/types';

export function SearchModal() {
  const isOpen = useAppStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useAppStore((state) => state.setIsSearchOpen);
  const regionId = useRegionId();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const products = await searchProducts(searchQuery, regionId || undefined);
        setResults(products);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [regionId]
  );

  const debouncedSearch = useCallback(
    debounce((q: string) => performSearch(q), 300),
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, setIsSearchOpen]);

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={handleClose}>
      <div
        className="mx-auto mt-20 max-w-2xl bg-white p-4 shadow-2xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search for services, pujas, prasad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-lg outline-none placeholder:text-stone-400"
            autoFocus
          />
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-stone-400" />}
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 max-h-96 overflow-y-auto border-t border-stone-100 pt-4">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                onClick={handleClose}
                className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-stone-50"
              >
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100">
                    <span className="text-lg text-stone-400">P</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="truncate font-medium text-stone-900">
                    {product.title}
                  </h4>
                  {product.variants[0]?.prices[0] && (
                    <p className="text-sm text-amber-600">
                      {formatPrice(
                        product.variants[0].prices[0].amount,
                        product.variants[0].prices[0].currency_code
                      )}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {query && !isLoading && results.length === 0 && (
          <div className="mt-4 border-t border-stone-100 pt-4 text-center text-stone-500">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
