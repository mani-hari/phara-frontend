import medusaClient from './client';
import type { Cart, PujaDetails, Address } from '@/types';

const CART_ID_KEY = 'parihara_cart_id';

function getCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_ID_KEY);
}

function setCartId(cartId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_ID_KEY, cartId);
}

function clearCartId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_ID_KEY);
}

export async function getOrCreateCart(regionId: string): Promise<Cart | null> {
  try {
    const existingCartId = getCartId();

    if (existingCartId) {
      try {
        const { cart } = await medusaClient.store.cart.retrieve(existingCartId);
        if (cart && cart.region_id === regionId) {
          return cart as unknown as Cart;
        }
        // If region doesn't match, create new cart
        clearCartId();
      } catch {
        // Cart not found or expired, create new one
        clearCartId();
      }
    }

    // Create new cart
    const { cart } = await medusaClient.store.cart.create({
      region_id: regionId,
    });

    if (cart) {
      setCartId(cart.id);
      return cart as unknown as Cart;
    }

    return null;
  } catch (error) {
    console.error('Error getting or creating cart:', error);
    return null;
  }
}

export async function getCart(): Promise<Cart | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const { cart } = await medusaClient.store.cart.retrieve(cartId);
    return cart as unknown as Cart;
  } catch (error) {
    console.error('Error getting cart:', error);
    clearCartId();
    return null;
  }
}

export async function addToCart(
  variantId: string,
  quantity: number = 1,
  regionId: string,
  pujaDetails?: PujaDetails
): Promise<Cart | null> {
  try {
    const cart = await getOrCreateCart(regionId);
    if (!cart) return null;

    const { cart: updatedCart } = await medusaClient.store.cart.createLineItem(cart.id, {
      variant_id: variantId,
      quantity,
      metadata: pujaDetails as unknown as Record<string, unknown>,
    });

    return updatedCart as unknown as Cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return null;
  }
}

export async function updateCartItem(
  lineItemId: string,
  quantity: number
): Promise<Cart | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const { cart } = await medusaClient.store.cart.updateLineItem(cartId, lineItemId, {
      quantity,
    });

    return cart as unknown as Cart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return null;
  }
}

export async function removeFromCart(lineItemId: string): Promise<Cart | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const { cart } = await medusaClient.store.cart.deleteLineItem(cartId, lineItemId);
    return cart as unknown as Cart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return null;
  }
}

export async function updateCartDetails(data: {
  email?: string;
  shipping_address?: Address;
  billing_address?: Address;
}): Promise<Cart | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const { cart } = await medusaClient.store.cart.update(cartId, data);
    return cart as unknown as Cart;
  } catch (error) {
    console.error('Error updating cart details:', error);
    return null;
  }
}

export async function addShippingMethod(shippingOptionId: string): Promise<Cart | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const { cart } = await medusaClient.store.cart.addShippingMethod(cartId, {
      option_id: shippingOptionId,
    });

    return cart as unknown as Cart;
  } catch (error) {
    console.error('Error adding shipping method:', error);
    return null;
  }
}

export async function getShippingOptions(cartId: string) {
  try {
    const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
      cart_id: cartId,
    });
    return shipping_options;
  } catch (error) {
    console.error('Error getting shipping options:', error);
    return [];
  }
}

export async function initializePaymentSession(providerId: string): Promise<Cart | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const { cart } = await medusaClient.store.payment.initiatePaymentSession(
      { id: cartId } as { id: string },
      { provider_id: providerId }
    );

    return cart as unknown as Cart;
  } catch (error) {
    console.error('Error initializing payment session:', error);
    return null;
  }
}

export async function completeCart(): Promise<{ order: unknown } | null> {
  try {
    const cartId = getCartId();
    if (!cartId) return null;

    const result = await medusaClient.store.cart.complete(cartId);

    if (result.type === 'order') {
      clearCartId();
      return { order: result.order };
    }

    return null;
  } catch (error) {
    console.error('Error completing cart:', error);
    return null;
  }
}

export async function clearCart(): Promise<void> {
  clearCartId();
}
