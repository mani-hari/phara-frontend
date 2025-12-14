'use client';

import { GeoProvider } from './geo-provider';
import { PayPalProvider } from './paypal-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GeoProvider>
      <PayPalProvider>{children}</PayPalProvider>
    </GeoProvider>
  );
}

export { GeoProvider } from './geo-provider';
export { PayPalProvider } from './paypal-provider';
