'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useGeoInfo } from '@/store';
import { getPayPalClientId } from '@/lib/payments/paypal';

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  const geoInfo = useGeoInfo();
  const clientId = getPayPalClientId();

  // Only load PayPal for international customers
  if (geoInfo?.isIndia || !clientId) {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: geoInfo?.currency || 'USD',
        intent: 'capture',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
