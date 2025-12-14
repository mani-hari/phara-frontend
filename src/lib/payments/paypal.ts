import type { Cart, PaymentResult } from '@/types';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

export interface PayPalOrderResponse {
  id: string;
  status: string;
}

// Create PayPal order via API route
export async function createPayPalOrder(cart: Cart): Promise<string | null> {
  try {
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_id: cart.id,
        amount: cart.total / 100, // Convert from smallest unit
        currency: cart.currency_code.toUpperCase(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const data: PayPalOrderResponse = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return null;
  }
}

// Capture PayPal order after approval
export async function capturePayPalOrder(
  orderId: string,
  cartId: string
): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/payments/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        cart_id: cartId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to capture payment');
    }

    const data = await response.json();
    return {
      success: true,
      order_id: data.order_id,
    };
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

export function isPayPalAvailable(): boolean {
  return !!PAYPAL_CLIENT_ID;
}

export function getPayPalClientId(): string {
  return PAYPAL_CLIENT_ID;
}

// PayPal supported currencies
export const PAYPAL_SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'HKD',
  'SGD',
  'SEK',
  'DKK',
  'PLN',
  'NOK',
  'HUF',
  'CZK',
  'ILS',
  'MXN',
  'BRL',
  'MYR',
  'PHP',
  'TWD',
  'THB',
  'NZD',
];

export function isPayPalSupportedCurrency(currency: string): boolean {
  return PAYPAL_SUPPORTED_CURRENCIES.includes(currency.toUpperCase());
}
