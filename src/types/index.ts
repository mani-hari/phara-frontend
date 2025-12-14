// Region and Currency Types
export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface GeoInfo {
  country: string;
  countryCode: string;
  currency: SupportedCurrency;
  isIndia: boolean;
  region: 'india' | 'international';
}

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  decimals: number;
}

// Product Types
export interface ProductPrice {
  inr: number;
  usd: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  images: { url: string; alt?: string }[];
  variants: ProductVariant[];
  collection?: Collection;
  categories?: Category[];
  metadata?: Record<string, unknown>;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  prices: VariantPrice[];
  inventory_quantity?: number;
  manage_inventory?: boolean;
}

export interface VariantPrice {
  id: string;
  currency_code: string;
  amount: number;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  metadata?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  handle: string;
  parent_category?: Category;
}

// Cart Types
export interface CartItem {
  id: string;
  variant_id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unit_price: number;
  metadata?: PujaDetails;
}

export interface Cart {
  id: string;
  items: CartItem[];
  region_id: string;
  currency_code: string;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  email?: string;
  shipping_address?: Address;
  billing_address?: Address;
  payment_session?: PaymentSession;
}

export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

// Puja/Order Custom Fields
export interface PujaDetails {
  devotee_name: string;
  nakshatram?: string;
  rasi?: string;
  gothram?: string;
  date_preference?: string;
  sankalpam_notes?: string;
  additional_names?: string;
}

// Payment Types
export type PaymentProvider = 'razorpay' | 'paypal';

export interface PaymentSession {
  id: string;
  provider_id: PaymentProvider;
  status: 'pending' | 'authorized' | 'requires_more' | 'error' | 'canceled';
  data: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  order_id?: string;
  error?: string;
}

// Order Types
export interface Order {
  id: string;
  display_id: number;
  status: 'pending' | 'completed' | 'archived' | 'canceled' | 'requires_action';
  items: OrderItem[];
  currency_code: string;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  email: string;
  shipping_address: Address;
  billing_address: Address;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface OrderItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail?: string;
  metadata?: PujaDetails;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  offset: number;
  limit: number;
}
