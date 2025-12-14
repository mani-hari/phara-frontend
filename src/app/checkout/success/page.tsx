import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been placed successfully.',
};

function OrderDetails({ orderId }: { orderId: string | null }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-stone-900">
        Thank You for Your Order!
      </h1>

      <p className="mb-6 text-lg text-stone-600">
        Your order has been placed successfully. We will begin processing your
        puja service and you will receive a confirmation email shortly.
      </p>

      {orderId && (
        <Card className="mb-8">
          <CardContent className="py-6">
            <p className="text-sm text-stone-500">Order ID</p>
            <p className="text-lg font-semibold text-stone-900">{orderId}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-amber-800">What Happens Next?</h3>
          <ul className="space-y-2 text-left text-sm text-amber-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              You will receive an email confirmation with your order details
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              Our priests will perform the puja with your sankalpam details
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              If prasad is included, it will be shipped to your address
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              You will receive updates via email throughout the process
            </li>
          </ul>
        </div>

        <Button size="lg" asChild className="w-full">
          <Link href="/collections">
            Continue Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        <Button variant="outline" asChild className="w-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id || null;

  return (
    <div className="container mx-auto px-4 py-16">
      <Suspense
        fallback={
          <div className="text-center">
            <p className="text-stone-600">Loading order details...</p>
          </div>
        }
      >
        <OrderDetails orderId={orderId} />
      </Suspense>
    </div>
  );
}
