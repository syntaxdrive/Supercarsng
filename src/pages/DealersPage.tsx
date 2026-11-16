import { useEffect, useMemo, useState } from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResilientImage } from '../components/vehicles/ResilientImage';
import { fetchPublishedListings, fetchVerifiedDealers } from '../services/marketplaceService';
import type { Dealer, VehicleListing } from '../types/supercars';

export function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [stateFilter, setStateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [d, l] = await Promise.all([fetchVerifiedDealers(), fetchPublishedListings()]);
        if (!active) return;
        setDealers(d);
        setListings(l);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const states = useMemo(
    () => Array.from(new Set(dealers.map((d) => d.state))).sort(),
    [dealers]
  );

  const visibleDealers = useMemo(
    () => (stateFilter ? dealers.filter((d) => d.state === stateFilter) : dealers),
    [dealers, stateFilter]
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 border-b border-[#B9BDC3]/15 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
            Dealership Directory
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F5F5F3]">
            Verified Nigerian Dealerships
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#B9BDC3]">
            Every listed dealership has submitted business documentation and showroom details reviewed by Supercars.ng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            aria-label="Filter dealerships by state"
            className="h-11 rounded-sm border border-[#B9BDC3]/25 bg-[#17191C] px-3.5 text-sm text-[#F5F5F3]"
          >
            <option value="">All Locations</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <Link
            to="/dealer/dashboard"
            className="inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3] whitespace-nowrap"
          >
            Apply as Dealer
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-sm bg-[#17191C]" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {visibleDealers.map((dealer) => {
            const count = listings.filter((l) => l.dealerId === dealer.id).length;
            return (
              <Link
                key={dealer.id}
                to={`/dealers/${dealer.slug}`}
                className="group flex flex-col overflow-hidden rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] transition-colors hover:border-[#B9BDC3]/40"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#0A0A0B]">
                  <ResilientImage
                    src={dealer.coverImageUrl}
                    alt={dealer.businessName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#B9BDC3]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {dealer.city}, {dealer.state}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#F5F5F3]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Showroom
                      </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F3]">
                      {dealer.businessName}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#B9BDC3]">
                      {dealer.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#B9BDC3]/10 pt-4 text-xs text-[#B9BDC3]">
                    <span className="tabular-nums">
                      {count} active {count === 1 ? 'listing' : 'listings'}
                    </span>
                    <span className="font-medium text-[#F5F5F3]">View Showroom →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
