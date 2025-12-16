'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { detectGeoLocation } from '@/lib/geo/detection';
import { getRegionByCountry, getIndiaRegion, getInternationalRegion } from '@/lib/medusa/regions';
import { getOrCreateCart } from '@/lib/medusa/cart';

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const setGeoInfo = useAppStore((state) => state.setGeoInfo);
  const setRegionId = useAppStore((state) => state.setRegionId);
  const setCart = useAppStore((state) => state.setCart);
  const setIsGeoLoading = useAppStore((state) => state.setIsGeoLoading);

  useEffect(() => {
    async function initializeGeo() {
      try {
        // Detect user's location
        const geoInfo = await detectGeoLocation();
        setGeoInfo(geoInfo);

        // Get appropriate region from Medusa
        let region = await getRegionByCountry(geoInfo.countryCode);

        if (!region) {
          // Fallback to India or International region
          region = geoInfo.isIndia
            ? await getIndiaRegion()
            : await getInternationalRegion();
        }

        if (region) {
          setRegionId(region.id);

          // Initialize or retrieve cart for this region
          const cart = await getOrCreateCart(region.id);
          if (cart) {
            setCart(cart);
          }
        }
      } catch (error) {
        console.error('Error initializing geo:', error);
      } finally {
        setIsGeoLoading(false);
      }
    }

    initializeGeo();
  }, [setGeoInfo, setRegionId, setCart, setIsGeoLoading]);

  return <>{children}</>;
}
