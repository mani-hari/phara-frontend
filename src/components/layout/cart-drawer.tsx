'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useAppStore, useCart, useCurrency } from '@/store';
import { Button } from '@/components/ui/button';
import { updateCartItem, removeFromCart } from '@/lib/medusa/cart';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const isOpen = useAppStore((state) => state.isCartOpen);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const cart = useCart();
  const setCart = useAppStore((state) => state.setCart);
  const isLoading = useAppStore((state) => state.isCartLoading);
  const setIsCartLoading = useAppStore((state) => state.setIsCartLoading);
  const currency = useCurrency();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
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
  }, [isOpen, setIsCartOpen]);

  const handleUpdateQuantity = async (lineItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setIsCartLoading(true);
    const updatedCart = await updateCartItem(lineItemId, quantity);
    if (updatedCart) {
      setCart(updatedCart);
    }
    setIsCartLoading(false);
  };

  const handleRemoveItem = async (lineItemId: string) => {
    setIsCartLoading(true);
    const updatedCart = await removeFromCart(lineItemId);
    if (updatedCart) {
      setCart(updatedCart);
    }
    setIsCartLoading(false);
  };

  const handleClose = () => setIsCartOpen(false);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Your Cart ({itemCount})
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-16 w-16 text-stone-300" />
              <h3 className="mb-2 text-lg font-medium text-stone-900">
                Your cart is empty
              </h3>
              <p className="mb-6 text-sm text-stone-500">
                Add some temple services to get started
              </p>
              <Button onClick={handleClose} asChild>
                <Link href="/collections">Browse Services</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-stone-100 p-3"
                >
                  {item.product?.thumbnail ? (
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-stone-100">
                      <span className="text-2xl text-stone-400">P</span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-stone-900">
                        {item.product?.title || 'Product'}
                      </h4>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-stone-400 hover:text-red-500"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {item.variant?.title && item.variant.title !== 'Default' && (
                      <p className="text-sm text-stone-500">{item.variant.title}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                          disabled={isLoading || item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="font-medium text-amber-600">
                        {formatPrice(
                          item.unit_price * item.quantity,
                          cart?.currency_code || currency
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-4">
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span className="text-amber-600">
                {formatPrice(cart?.subtotal || 0, cart?.currency_code || currency)}
              </span>
            </div>
            <p className="mb-4 text-sm text-stone-500">
              Shipping and taxes calculated at checkout
            </p>
            <Button className="w-full" size="lg" asChild onClick={handleClose}>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
