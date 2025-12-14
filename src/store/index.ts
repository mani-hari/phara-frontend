import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Cart, GeoInfo, SupportedCurrency } from '@/types';

interface AppState {
  // Geo/Region state
  geoInfo: GeoInfo | null;
  regionId: string | null;
  currency: SupportedCurrency;
  isGeoLoading: boolean;

  // Cart state
  cart: Cart | null;
  isCartOpen: boolean;
  isCartLoading: boolean;

  // UI state
  isSearchOpen: boolean;

  // Actions
  setGeoInfo: (geoInfo: GeoInfo) => void;
  setRegionId: (regionId: string) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  setIsGeoLoading: (loading: boolean) => void;

  setCart: (cart: Cart | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCartLoading: (loading: boolean) => void;
  toggleCart: () => void;

  setIsSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;

  reset: () => void;
}

const initialState = {
  geoInfo: null,
  regionId: null,
  currency: 'USD' as SupportedCurrency,
  isGeoLoading: true,
  cart: null,
  isCartOpen: false,
  isCartLoading: false,
  isSearchOpen: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setGeoInfo: (geoInfo) =>
        set({ geoInfo, currency: geoInfo.currency, isGeoLoading: false }),
      setRegionId: (regionId) => set({ regionId }),
      setCurrency: (currency) => set({ currency }),
      setIsGeoLoading: (isGeoLoading) => set({ isGeoLoading }),

      setCart: (cart) => set({ cart }),
      setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
      setIsCartLoading: (isCartLoading) => set({ isCartLoading }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      reset: () => set(initialState),
    }),
    {
      name: 'parihara-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        regionId: state.regionId,
        currency: state.currency,
      }),
    }
  )
);

// Selector hooks for common patterns
export const useGeoInfo = () => useAppStore((state) => state.geoInfo);
export const useRegionId = () => useAppStore((state) => state.regionId);
export const useCurrency = () => useAppStore((state) => state.currency);
export const useCart = () => useAppStore((state) => state.cart);
export const useIsCartOpen = () => useAppStore((state) => state.isCartOpen);
