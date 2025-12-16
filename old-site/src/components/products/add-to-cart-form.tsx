'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore, useRegionId } from '@/store';
import { addToCart } from '@/lib/medusa/cart';
import type { Product, ProductVariant, PujaDetails } from '@/types';

// Nakshatram options
const NAKSHATRAM_OPTIONS = [
  { value: 'ashwini', label: 'Ashwini' },
  { value: 'bharani', label: 'Bharani' },
  { value: 'krittika', label: 'Krittika' },
  { value: 'rohini', label: 'Rohini' },
  { value: 'mrigashira', label: 'Mrigashira' },
  { value: 'ardra', label: 'Ardra' },
  { value: 'punarvasu', label: 'Punarvasu' },
  { value: 'pushya', label: 'Pushya' },
  { value: 'ashlesha', label: 'Ashlesha' },
  { value: 'magha', label: 'Magha' },
  { value: 'purvaphalguni', label: 'Purva Phalguni' },
  { value: 'uttaraphalguni', label: 'Uttara Phalguni' },
  { value: 'hasta', label: 'Hasta' },
  { value: 'chitra', label: 'Chitra' },
  { value: 'swati', label: 'Swati' },
  { value: 'vishakha', label: 'Vishakha' },
  { value: 'anuradha', label: 'Anuradha' },
  { value: 'jyeshtha', label: 'Jyeshtha' },
  { value: 'moola', label: 'Moola' },
  { value: 'purvashadha', label: 'Purva Ashadha' },
  { value: 'uttarashadha', label: 'Uttara Ashadha' },
  { value: 'shravana', label: 'Shravana' },
  { value: 'dhanishta', label: 'Dhanishta' },
  { value: 'shatabhisha', label: 'Shatabhisha' },
  { value: 'purvabhadrapada', label: 'Purva Bhadrapada' },
  { value: 'uttarabhadrapada', label: 'Uttara Bhadrapada' },
  { value: 'revati', label: 'Revati' },
];

// Rasi options
const RASI_OPTIONS = [
  { value: 'mesha', label: 'Mesha (Aries)' },
  { value: 'vrishabha', label: 'Vrishabha (Taurus)' },
  { value: 'mithuna', label: 'Mithuna (Gemini)' },
  { value: 'karka', label: 'Karka (Cancer)' },
  { value: 'simha', label: 'Simha (Leo)' },
  { value: 'kanya', label: 'Kanya (Virgo)' },
  { value: 'tula', label: 'Tula (Libra)' },
  { value: 'vrishchika', label: 'Vrishchika (Scorpio)' },
  { value: 'dhanu', label: 'Dhanu (Sagittarius)' },
  { value: 'makara', label: 'Makara (Capricorn)' },
  { value: 'kumbha', label: 'Kumbha (Aquarius)' },
  { value: 'meena', label: 'Meena (Pisces)' },
];

interface AddToCartFormProps {
  product: Product;
  showPujaDetails?: boolean;
}

export function AddToCartForm({ product, showPujaDetails = true }: AddToCartFormProps) {
  const regionId = useRegionId();
  const setCart = useAppStore((state) => state.setCart);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Puja details
  const [pujaDetails, setPujaDetails] = useState<PujaDetails>({
    devotee_name: '',
    nakshatram: '',
    rasi: '',
    gothram: '',
    date_preference: '',
    sankalpam_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVariant || !regionId) {
      return;
    }

    setIsLoading(true);
    try {
      const cart = await addToCart(
        selectedVariant.id,
        quantity,
        regionId,
        showPujaDetails ? pujaDetails : undefined
      );

      if (cart) {
        setCart(cart);
        setIsCartOpen(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMultipleVariants = product.variants && product.variants.length > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Variant Selection */}
      {hasMultipleVariants && (
        <Select
          label="Select Option"
          options={product.variants.map((v) => ({
            value: v.id,
            label: v.title,
          }))}
          value={selectedVariant?.id || ''}
          onChange={(e) =>
            setSelectedVariant(
              product.variants.find((v) => v.id === e.target.value) || null
            )
          }
          required
        />
      )}

      {/* Puja Details */}
      {showPujaDetails && (
        <div className="space-y-4 rounded-lg border border-stone-200 p-4">
          <h3 className="font-medium text-stone-900">Puja Details</h3>

          <Input
            label="Devotee Name"
            value={pujaDetails.devotee_name}
            onChange={(e) =>
              setPujaDetails({ ...pujaDetails, devotee_name: e.target.value })
            }
            placeholder="Enter devotee name for sankalpam"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Nakshatram"
              options={NAKSHATRAM_OPTIONS}
              value={pujaDetails.nakshatram || ''}
              onChange={(e) =>
                setPujaDetails({ ...pujaDetails, nakshatram: e.target.value })
              }
              placeholder="Select nakshatram"
            />

            <Select
              label="Rasi"
              options={RASI_OPTIONS}
              value={pujaDetails.rasi || ''}
              onChange={(e) =>
                setPujaDetails({ ...pujaDetails, rasi: e.target.value })
              }
              placeholder="Select rasi"
            />
          </div>

          <Input
            label="Gothram"
            value={pujaDetails.gothram || ''}
            onChange={(e) =>
              setPujaDetails({ ...pujaDetails, gothram: e.target.value })
            }
            placeholder="Enter your gothram"
          />

          <Input
            label="Preferred Date"
            type="date"
            value={pujaDetails.date_preference || ''}
            onChange={(e) =>
              setPujaDetails({ ...pujaDetails, date_preference: e.target.value })
            }
            helperText="We will try to accommodate your preferred date"
          />

          <Textarea
            label="Additional Notes / Sankalpam"
            value={pujaDetails.sankalpam_notes || ''}
            onChange={(e) =>
              setPujaDetails({ ...pujaDetails, sankalpam_notes: e.target.value })
            }
            placeholder="Any additional names or special requests for the puja"
            rows={3}
          />
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="flex items-end gap-4">
        <div className="w-24">
          <Input
            label="Quantity"
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="flex-1"
          loading={isLoading}
          disabled={!selectedVariant || !regionId}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </form>
  );
}
