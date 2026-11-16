import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { fetchPublishedListings } from '../services/marketplaceService';
import type { VehicleCategory, VehicleCondition, VehicleListing } from '../types/supercars';

const ALL_CATEGORIES: VehicleCategory[] = [
  'Exotic',
  'Luxury',
  'Executive',
  'Performance',
  'Luxury SUVs',
  'Premium sedans',
];

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [queryText, setQueryText] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [make, setMake] = useState<string>(searchParams.get('make') || '');
  const [condition, setCondition] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [bodyType, setBodyType] = useState<string>('');
  const [transmission, setTransmission] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('');
  const [minYear, setMinYear] = useState<string>('');
  const [maxPriceMillions, setMaxPriceMillions] = useState<string>('');
  const [maxMileage, setMaxMileage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'year_desc'>('newest');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchPublishedListings();
        if (active) setListings(data);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const uniqueMakes = useMemo(
    () => Array.from(new Set(listings.map((l) => l.make))).sort(),
    [listings]
  );
  const uniqueStates = useMemo(
    () => Array.from(new Set(listings.map((l) => l.state))).sort(),
    [listings]
  );
  const uniqueBodies = useMemo(
    () => Array.from(new Set(listings.map((l) => l.bodyType))).sort(),
    [listings]
  );
  const uniqueTransmissions = useMemo(
    () => Array.from(new Set(listings.map((l) => l.transmission))).sort(),
    [listings]
  );
  const uniqueFuels = useMemo(
    () => Array.from(new Set(listings.map((l) => l.fuelType))).sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const minY = minYear ? Number(minYear) : null;
    const maxP = maxPriceMillions ? Number(maxPriceMillions) * 1_000_000 : null;
    const maxKm = maxMileage ? Number(maxMileage) : null;

    const list = listings.filter((item) => {
      if (q) {
        const haystack = `${item.make} ${item.model} ${item.title} ${item.city} ${item.state}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (category && item.category !== category) return false;
      if (make && item.make !== make) return false;
      if (condition && item.condition !== (condition as VehicleCondition)) return false;
      if (stateFilter && item.state !== stateFilter) return false;
      if (bodyType && item.bodyType !== bodyType) return false;
      if (transmission && item.transmission !== transmission) return false;
      if (fuelType && item.fuelType !== fuelType) return false;
      if (minY && item.year < minY) return false;
      if (maxP && item.priceType !== 'price_on_request' && item.price > maxP) return false;
      if (maxKm && item.mileageKm > maxKm) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'year_desc') return b.year - a.year;
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }, [
    listings,
    queryText,
    category,
    make,
    condition,
    stateFilter,
    bodyType,
    transmission,
    fuelType,
    minYear,
    maxPriceMillions,
    maxMileage,
    sortBy,
  ]);

  const resetFilters = () => {
    setQueryText('');
    setCategory('');
    setMake('');
    setCondition('');
    setStateFilter('');
    setBodyType('');
    setTransmission('');
    setFuelType('');
    setMinYear('');
    setMaxPriceMillions('');
    setMaxMileage('');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#B9BDC3]/15 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
          Premium Vehicle Marketplace
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h1 className="text-4xl font-semibold tracking-tight text-[#F5F5F3]">
            Curated Nigerian Inventory
          </h1>
          <p className="text-xs text-[#B9BDC3] tabular-nums">
            {filtered.length} {filtered.length === 1 ? 'vehicle' : 'vehicles'} available · Prices shown in NGN unless marked On Request
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-8 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B9BDC3]" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search manufacturer, model, title, or city..."
              aria-label="Search marketplace inventory"
              className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] pl-10 pr-4 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/50 focus:border-[#F5F5F3] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#B9BDC3]">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort listings"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-sm text-[#F5F5F3] focus:border-[#F5F5F3] focus:outline-none"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Model Year: Newest</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center gap-1.5 rounded-sm border border-[#B9BDC3]/20 px-3.5 text-xs font-medium text-[#B9BDC3] transition-colors hover:border-[#F5F5F3] hover:text-[#F5F5F3]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            aria-label="Filter by manufacturer"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">All Manufacturers</option>
            {uniqueMakes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            aria-label="Filter by condition"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">Any Condition</option>
            <option value="brand_new">Brand New</option>
            <option value="foreign_used">Foreign Used</option>
            <option value="nigeria_used">Nigerian Used</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            aria-label="Filter by state"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">All States</option>
            {uniqueStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            aria-label="Filter by body type"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">All Body Types</option>
            {uniqueBodies.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            aria-label="Filter by transmission"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">Any Transmission</option>
            {uniqueTransmissions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            aria-label="Filter by fuel type"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">Any Fuel Type</option>
            {uniqueFuels.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={minYear}
            onChange={(e) => setMinYear(e.target.value)}
            aria-label="Filter by minimum year"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">Min Year (Any)</option>
            <option value="2024">2024 or newer</option>
            <option value="2023">2023 or newer</option>
            <option value="2022">2022 or newer</option>
            <option value="2020">2020 or newer</option>
          </select>

          <select
            value={maxPriceMillions}
            onChange={(e) => setMaxPriceMillions(e.target.value)}
            aria-label="Filter by maximum asking price"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">Max Price (Any)</option>
            <option value="300">Up to ₦300M</option>
            <option value="500">Up to ₦500M</option>
            <option value="750">Up to ₦750M</option>
            <option value="1000">Up to ₦1B</option>
          </select>

          <select
            value={maxMileage}
            onChange={(e) => setMaxMileage(e.target.value)}
            aria-label="Filter by maximum mileage"
            className="h-10 rounded-sm border border-[#B9BDC3]/15 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
          >
            <option value="">Max Mileage (Any)</option>
            <option value="1000">Under 1,000 km</option>
            <option value="5000">Under 5,000 km</option>
            <option value="15000">Under 15,000 km</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-[380px] animate-pulse rounded-sm border border-[#B9BDC3]/10 bg-[#17191C]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-12 text-center">
          <h2 className="text-2xl font-semibold text-[#F5F5F3]">
            No matching vehicles found
          </h2>
          <p className="mt-2 text-sm text-[#B9BDC3]">
            Try clearing a filter or searching across all Nigerian locations.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <VehicleCard key={item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
}
