import type { Cart, PaymentResult } from '@/types';

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: () => void): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CreateRazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

// Create Razorpay order via API route
export async function createRazorpayOrder(
  cart: Cart
): Promise<CreateRazorpayOrderResponse | null> {
  try {
    const response = await fetch('/api/payments/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_id: cart.id,
        amount: cart.total,
        currency: cart.currency_code.toUpperCase(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
}

export async function processRazorpayPayment(
  cart: Cart,
  onSuccess: (result: PaymentResult) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onError('Failed to load Razorpay. Please try again.');
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      onError('Payment configuration error. Please contact support.');
      return;
    }

    // Create order on backend
    const order = await createRazorpayOrder(cart);
    if (!order) {
      onError('Failed to create payment order. Please try again.');
      return;
    }

    // Configure Razorpay options
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'PariharaOnline',
      description: 'Temple Services & Prasad',
      order_id: order.id,
      prefill: {
        name: cart.shipping_address
          ? `${cart.shipping_address.first_name} ${cart.shipping_address.last_name}`
          : undefined,
        email: cart.email,
        contact: cart.shipping_address?.phone,
      },
      theme: {
        color: '#B45309', // Amber-700
      },
      handler: async (response: RazorpayResponse) => {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cart_id: cart.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          const result = await verifyResponse.json();
          onSuccess({
            success: true,
            order_id: result.order_id,
          });
        } catch (error) {
          console.error('Payment verification error:', error);
          onError('Payment verification failed. Please contact support.');
        }
      },
      modal: {
        ondismiss: () => {
          onError('Payment cancelled');
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Razorpay payment error:', error);
    onError('Payment failed. Please try again.');
  }
}

export function isRazorpayAvailable(): boolean {
  return !!RAZORPAY_KEY_ID;
}
