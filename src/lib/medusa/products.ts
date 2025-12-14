import medusaClient from './client';
import type { Product, Collection, Category, PaginatedResponse } from '@/types';

export async function getProducts(options?: {
  limit?: number;
  offset?: number;
  collection_id?: string[];
  category_id?: string[];
  region_id?: string;
}): Promise<PaginatedResponse<Product>> {
  try {
    const { products, count, offset, limit } = await medusaClient.store.product.list({
      limit: options?.limit || 12,
      offset: options?.offset || 0,
      collection_id: options?.collection_id,
      category_id: options?.category_id,
      region_id: options?.region_id,
      fields: '+variants.prices,+images,+collection,+categories',
    });

    return {
      data: products as unknown as Product[],
      count: count || 0,
      offset: offset || 0,
      limit: limit || 12,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], count: 0, offset: 0, limit: 12 };
  }
}

export async function getProduct(handle: string, regionId?: string): Promise<Product | null> {
  try {
    const { products } = await medusaClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '+variants.prices,+images,+collection,+categories',
    });

    return products[0] as unknown as Product || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getProductById(id: string, regionId?: string): Promise<Product | null> {
  try {
    const { product } = await medusaClient.store.product.retrieve(id, {
      region_id: regionId,
      fields: '+variants.prices,+images,+collection,+categories',
    });

    return product as unknown as Product || null;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const { collections } = await medusaClient.store.collection.list({
      limit: 100,
    });

    return collections as unknown as Collection[];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getCollection(handle: string): Promise<Collection | null> {
  try {
    const { collections } = await medusaClient.store.collection.list({
      handle: [handle],
    });

    return collections[0] as unknown as Collection || null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { product_categories } = await medusaClient.store.category.list({
      limit: 100,
    });

    return product_categories as unknown as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function searchProducts(query: string, regionId?: string): Promise<Product[]> {
  try {
    const { products } = await medusaClient.store.product.list({
      q: query,
      region_id: regionId,
      limit: 20,
      fields: '+variants.prices,+images',
    });

    return products as unknown as Product[];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}
