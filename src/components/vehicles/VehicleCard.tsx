import React from 'react';
import { Bookmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  formatAskingPrice,
  formatAvailabilityLabel,
  formatConditionLabel,
  formatMileage,
} from '../../lib/format';
import type { VehicleListing } from '../../types/supercars';
import { ResilientImage } from './ResilientImage';

interface VehicleCardProps {
  listing: VehicleListing;
}

export function VehicleCard({ listing }: VehicleCardProps) {
  const { savedListingIds, toggleSaveListing } = useAuth();
  const isSaved = savedListingIds.includes(listing.id);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleSaveListing(listing.id);
  };

  return (
    <Link
      to={`/cars/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#B9BDC3]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F5F3]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0B]">
        <ResilientImage
          src={listing.imageUrls?.[0]}
          alt={listing.title}
          fallbackLabel={`${listing.year} ${listing.make} ${listing.model}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <button
          type="button"
          onClick={handleBookmark}
          aria-label={isSaved ? 'Remove from saved vehicles' : 'Save vehicle'}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-sm bg-[#0A0A0B]/75 text-[#F5F5F3] backdrop-blur-sm transition-colors hover:bg-[#0A0A0B]"
        >
          <Bookmark
            className="h-4 w-4"
            fill={isSaved ? '#F5F5F3' : 'none'}
            strokeWidth={1.75}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-[#B9BDC3]">
            <span className="truncate">
              {listing.make} · {listing.city}, {listing.state}
            </span>
            {listing.moderationStatus === 'approved' && (
              <span className="inline-flex shrink-0 items-center gap-1 text-[#F5F5F3]">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                Verified
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#F5F5F3]">
            {listing.title}
          </h3>

          <p className="mt-2 text-xs text-[#B9BDC3]">
            <span className="tabular-nums">{listing.year}</span>
            <span aria-hidden="true"> · </span>
            <span className="tabular-nums">{formatMileage(listing.mileageKm)}</span>
            <span aria-hidden="true"> · </span>
            <span>{formatConditionLabel(listing.condition)}</span>
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-[#B9BDC3]/10 pt-3.5">
          <span className="font-mono text-sm font-medium tabular-nums text-[#F5F5F3]">
            {formatAskingPrice(listing.price, listing.currency, listing.priceType)}
          </span>
          <span className="text-xs text-[#B9BDC3] whitespace-nowrap">
            {formatAvailabilityLabel(listing.availabilityStatus)}
          </span>
        </div>
      </div>
    </Link>
  );
}
