'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useAppStore, useCart, useGeoInfo, useCurrency } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateCartDetails, addShippingMethod, getShippingOptions } from '@/lib/medusa/cart';
import { processRazorpayPayment, isRazorpayAvailable } from '@/lib/payments/razorpay';
import { createPayPalOrder, capturePayPalOrder, isPayPalAvailable, getPayPalClientId } from '@/lib/payments/paypal';
import { formatPrice } from '@/lib/utils';
import type { Address } from '@/types';

const COUNTRY_OPTIONS = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const setCart = useAppStore((state) => state.setCart);
  const geoInfo = useGeoInfo();
  const currency = useCurrency();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'payment'>('details');

  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: geoInfo?.countryCode || 'IN',
    phone: '',
  });

  const isIndia = geoInfo?.isIndia ?? true;
  const showRazorpay = isIndia && isRazorpayAvailable();
  const showPayPal = !isIndia && isPayPalAvailable();

  useEffect(() => {
    if (geoInfo?.countryCode) {
      setShippingAddress((prev) => ({
        ...prev,
        country_code: geoInfo.countryCode,
      }));
    }
  }, [geoInfo?.countryCode]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Update cart with email and address
      const updatedCart = await updateCartDetails({
        email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      });

      if (!updatedCart) {
        throw new Error('Failed to update cart details');
      }

      // Get shipping options and add first available
      const shippingOptions = await getShippingOptions(updatedCart.id);
      if (shippingOptions && shippingOptions.length > 0) {
        await addShippingMethod(shippingOptions[0].id);
      }

      setCart(updatedCart);
      setStep('payment');
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to save your details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!cart) return;

    setIsLoading(true);
    setError(null);

    processRazorpayPayment(
      cart,
      (result) => {
        if (result.success && result.order_id) {
          router.push(`/checkout/success?order_id=${result.order_id}`);
        }
      },
      (errorMessage) => {
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  };

  const handlePayPalCreateOrder = async () => {
    if (!cart) throw new Error('No cart found');
    const orderId = await createPayPalOrder(cart);
    if (!orderId) throw new Error('Failed to create PayPal order');
    return orderId;
  };

  const handlePayPalApprove = async (data: { orderID: string }) => {
    if (!cart) return;

    setIsLoading(true);
    setError(null);

    const result = await capturePayPalOrder(data.orderID, cart.id);

    if (result.success && result.order_id) {
      router.push(`/checkout/success?order_id=${result.order_id}`);
    } else {
      setError(result.error || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-stone-300" />
          <h1 className="mb-4 text-2xl font-bold text-stone-900">
            Your cart is empty
          </h1>
          <p className="mb-6 text-stone-600">
            Add some temple services to your cart before proceeding to checkout.
          </p>
          <Button asChild>
            <Link href="/collections">Browse Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-600">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Checkout</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="mb-8 text-3xl font-bold text-stone-900">Checkout</h1>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center gap-4">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 'details'
                  ? 'bg-amber-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              1
            </div>
            <span
              className={step === 'details' ? 'font-medium' : 'text-stone-500'}
            >
              Details
            </span>
            <div className="h-px flex-1 bg-stone-200" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 'payment'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              2
            </div>
            <span
              className={step === 'payment' ? 'font-medium' : 'text-stone-500'}
            >
              Payment
            </span>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      value={shippingAddress.first_name}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          first_name: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="Last Name"
                      value={shippingAddress.last_name}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          last_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Input
                    label="Address"
                    value={shippingAddress.address_1}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        address_1: e.target.value,
                      })
                    }
                    placeholder="Street address"
                    required
                  />

                  <Input
                    label="Apartment, suite, etc. (optional)"
                    value={shippingAddress.address_2 || ''}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        address_2: e.target.value,
                      })
                    }
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="State/Province"
                      value={shippingAddress.province || ''}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          province: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Postal Code"
                      value={shippingAddress.postal_code}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          postal_code: e.target.value,
                        })
                      }
                      required
                    />
                    <Select
                      label="Country"
                      options={COUNTRY_OPTIONS}
                      value={shippingAddress.country_code}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          country_code: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Input
                    label="Phone"
                    type="tel"
                    value={shippingAddress.phone || ''}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+91 12345 67890"
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                Continue to Payment
              </Button>
            </form>
          )}

          {step === 'payment' && (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {showRazorpay && (
                    <div>
                      <p className="mb-4 text-stone-600">
                        Pay securely with Razorpay. We accept UPI, cards, net
                        banking, and wallets.
                      </p>
                      <Button
                        onClick={handleRazorpayPayment}
                        size="lg"
                        className="w-full"
                        loading={isLoading}
                      >
                        Pay with Razorpay
                      </Button>
                    </div>
                  )}

                  {showPayPal && getPayPalClientId() && (
                    <div>
                      <p className="mb-4 text-stone-600">
                        Pay securely with PayPal or your credit/debit card.
                      </p>
                      <PayPalButtons
                        style={{
                          layout: 'vertical',
                          color: 'gold',
                          shape: 'rect',
                          label: 'paypal',
                        }}
                        createOrder={handlePayPalCreateOrder}
                        onApprove={handlePayPalApprove}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          setError('Payment failed. Please try again.');
                        }}
                      />
                    </div>
                  )}

                  {!showRazorpay && !showPayPal && (
                    <p className="text-stone-600">
                      Payment methods are being configured. Please try again
                      later.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Button
                variant="outline"
                onClick={() => setStep('details')}
                className="w-full"
              >
                Back to Details
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="mb-4 divide-y divide-stone-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                    {item.product?.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-stone-100">
                        <span className="text-xl text-stone-400">P</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-stone-900">
                        {item.product?.title}
                      </h4>
                      <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-stone-900">
                      {formatPrice(
                        item.unit_price * item.quantity,
                        cart.currency_code
                      )}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-stone-100 pt-4">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal, cart.currency_code)}</span>
                </div>
                {cart.shipping_total > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping</span>
                    <span>
                      {formatPrice(cart.shipping_total, cart.currency_code)}
                    </span>
                  </div>
                )}
                {cart.tax_total > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Tax</span>
                    <span>{formatPrice(cart.tax_total, cart.currency_code)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-100 pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-amber-600">
                    {formatPrice(cart.total, cart.currency_code)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
