import Medusa from '@medusajs/js-sdk';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || '';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

if (!MEDUSA_BACKEND_URL) {
  console.warn('NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set');
}

export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
});

export default medusaClient;
