export * from './razorpay';
export * from './paypal';

import type { GeoInfo, PaymentProvider } from '@/types';

// Determine which payment provider to use based on location
export function getPaymentProvider(geoInfo: GeoInfo): PaymentProvider {
  return geoInfo.isIndia ? 'razorpay' : 'paypal';
}

// Get available payment methods for a region
export function getAvailablePaymentMethods(geoInfo: GeoInfo): PaymentProvider[] {
  if (geoInfo.isIndia) {
    return ['razorpay'];
  }
  return ['paypal'];
}

// Check if payment provider is available for region
export function isPaymentProviderAvailable(
  provider: PaymentProvider,
  geoInfo: GeoInfo
): boolean {
  if (provider === 'razorpay') {
    return geoInfo.isIndia;
  }
  if (provider === 'paypal') {
    return !geoInfo.isIndia;
  }
  return false;
}
