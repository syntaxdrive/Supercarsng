import type {
  AvailabilityStatus,
  PriceType,
  VehicleCondition,
  VerificationType,
} from '../types/supercars';

export function formatAskingPrice(
  price: number,
  currency: 'NGN' | 'USD' = 'NGN',
  priceType: PriceType = 'fixed'
): string {
  if (priceType === 'price_on_request' || price <= 0) {
    return 'Price on Request';
  }
  const formatted =
    currency === 'NGN'
      ? `₦${Math.round(price).toLocaleString('en-NG')}`
      : `$${Math.round(price).toLocaleString('en-US')}`;
  return priceType === 'negotiable' ? `${formatted} (Negotiable)` : formatted;
}

export function formatCompactNgn(price: number): string {
  if (price <= 0) return 'On Request';
  if (price >= 1_000_000_000) {
    return `₦${(price / 1_000_000_000).toFixed(2)}B`;
  }
  if (price >= 1_000_000) {
    return `₦${Math.round(price / 1_000_000)}M`;
  }
  return `₦${price.toLocaleString('en-NG')}`;
}

export function formatConditionLabel(condition: VehicleCondition): string {
  switch (condition) {
    case 'brand_new':
      return 'Brand New';
    case 'foreign_used':
      return 'Foreign Used';
    case 'nigeria_used':
      return 'Nigerian Used';
  }
}

export function formatAvailabilityLabel(status: AvailabilityStatus): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'reserved':
      return 'Reserved';
    case 'sold':
      return 'Sold';
    case 'unavailable':
      return 'Unavailable';
  }
}

export function formatVerificationLabel(type: VerificationType): string {
  switch (type) {
    case 'seller_identity':
      return 'Seller Identity Verified';
    case 'dealer_business':
      return 'Registered Dealership Verified';
    case 'vehicle_identity':
      return 'VIN & Chassis Checked';
    case 'ownership_documentation':
      return 'Customs & Title Papers Checked';
    case 'physical_inspection':
      return 'Physical Inspection Completed';
  }
}

export function formatMileage(mileageKm: number): string {
  if (mileageKm <= 50) return 'Delivery mileage';
  return `${mileageKm.toLocaleString('en-NG')} km`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildWhatsappUrl(phone: string | undefined, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, '');
  if (!digits) return null;
  const normalized = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function formatDateDisplay(value: unknown): string {
  if (!value) return 'November 2026';
  try {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return value;
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {
    return 'November 2026';
  }
  return 'November 2026';
}
