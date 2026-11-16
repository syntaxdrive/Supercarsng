import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ResilientImage } from '../components/vehicles/ResilientImage';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { CATALOGUE_MANUFACTURERS } from '../data/catalogue';
import { formatDateDisplay } from '../lib/format';
import {
  fetchPublishedArticles,
  fetchPublishedListings,
  fetchVerifiedDealers,
  subscribeToNewsletter,
} from '../services/marketplaceService';
import type { Article, Dealer, VehicleCategory, VehicleListing } from '../types/supercars';

const CATEGORIES: Array<'All' | VehicleCategory> = [
  'All',
  'Exotic',
  'Luxury',
  'Executive',
  'Performance',
  'Luxury SUVs',
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | VehicleCategory>('All');
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [l, d, a] = await Promise.all([
          fetchPublishedListings(),
          fetchVerifiedDealers(),
          fetchPublishedArticles(),
        ]);
        if (!active) return;
        setListings(l);
        setDealers(d);
        setArticles(a);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    const base =
      activeCategory === 'All'
        ? listings
        : listings.filter((item) => item.category === activeCategory);
    return base.slice(0, 6);
  }, [listings, activeCategory]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/cars?q=${encodeURIComponent(q)}` : '/cars');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterState('submitting');
    try {
      await subscribeToNewsletter(newsletterEmail);
      setNewsletterEmail('');
      setNewsletterState('done');
    } catch {
      setNewsletterState('error');
    }
  };

  return (
    <div>
      {/* 1. Editorial Showroom Hero */}
      <section className="relative overflow-hidden border-b border-[#B9BDC3]/15 bg-[#0A0A0B]">
        <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-stretch lg:grid-cols-12">
          <div className="z-10 flex flex-col justify-center px-4 py-16 sm:px-6 lg:col-span-6 lg:py-24 lg:pr-12 lg:pl-8">
            <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#B9BDC3]">
              Nigeria · Lagos &amp; Abuja Showroom
            </p>
            <h1 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-[#F5F5F3] sm:text-5xl lg:text-[3.5rem]">
              The art of exceptional automobiles.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#B9BDC3]">
              Discover verified exotic, luxury, and executive vehicles from Nigeria’s trusted
              dealerships and private collectors, backed by auditable inspection records.
            </p>

            <form
              onSubmit={handleHeroSearch}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              role="search"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B9BDC3]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search make, model, or city (e.g. G 63, 911, Ikoyi)"
                  aria-label="Search vehicles"
                  className="h-12 w-full rounded-sm border border-[#B9BDC3]/25 bg-[#17191C] pl-10 pr-4 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/60 focus:border-[#F5F5F3] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-[#F5F5F3] px-6 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#B9BDC3] whitespace-nowrap"
              >
                Search Inventory
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#B9BDC3]">
              <span>NGN Asking Prices</span>
              <span aria-hidden="true">·</span>
              <span>Auditable Verification Records</span>
              <span aria-hidden="true">·</span>
              <span>Direct Dealer &amp; Collector Enquiries</span>
            </div>
          </div>

          <div className="relative min-h-[340px] lg:col-span-6 lg:min-h-[560px]">
            <ResilientImage
              src="/src/assets/images/hero_lagos_supercar_1794813252054.jpg"
              alt="Obsidian Porsche 911 GT3 parked at an Ikoyi architectural residence at dusk"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/20 to-transparent lg:block hidden" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-[#F5F5F3]/15 pt-3 text-xs text-[#F5F5F3]/90">
              <span>Featured · 2024 Porsche 911 GT3 (992)</span>
              <Link
                to="/cars/2024-porsche-911-gt3-ikoyi-lagos"
                className="font-medium underline underline-offset-4 hover:text-[#B9BDC3]"
              >
                Inspect Listing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured & Recently Added Vehicles */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-[#B9BDC3]/15 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
              Curated Marketplace
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#F5F5F3] sm:text-4xl">
              Featured &amp; Recently Added Vehicles
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-1">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`h-9 rounded-sm px-3.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeCategory === category
                    ? 'bg-[#F5F5F3] text-[#0A0A0B]'
                    : 'text-[#B9BDC3] hover:text-[#F5F5F3]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[380px] animate-pulse rounded-sm border border-[#B9BDC3]/10 bg-[#17191C]"
              />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="mt-10 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-10 text-center">
            <p className="text-sm text-[#B9BDC3]">
              No active vehicles in this category right now.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="mt-4 inline-flex h-10 items-center rounded-sm border border-[#B9BDC3]/30 px-4 text-xs font-medium text-[#F5F5F3] hover:border-[#F5F5F3]"
            >
              Show All Vehicles
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <VehicleCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-[#B9BDC3]/10 pt-6">
          <p className="text-xs text-[#B9BDC3]">
            Showing verified dealer and moderated private seller inventory in NGN.
          </p>
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#F5F5F3] hover:text-[#B9BDC3] whitespace-nowrap"
          >
            View Full Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 3. Browse by Marque (Discovery Catalogue) */}
      <section className="border-y border-[#B9BDC3]/15 bg-[#17191C]">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
                Automotive Discovery Catalogue
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#F5F5F3]">
                Explore Manufacturers &amp; Specifications
              </h2>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#F5F5F3] hover:text-[#B9BDC3] whitespace-nowrap"
            >
              All 15 Marques
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px bg-[#B9BDC3]/15 sm:grid-cols-3 lg:grid-cols-5">
            {CATALOGUE_MANUFACTURERS.slice(0, 10).map((brand) => (
              <Link
                key={brand.id}
                to={`/discover/${brand.slug}`}
                className="flex flex-col justify-between bg-[#17191C] p-5 transition-colors hover:bg-[#0A0A0B]"
              >
                <div>
                  <span className="text-xs text-[#B9BDC3]">{brand.countryOfOrigin}</span>
                  <h3 className="mt-1 text-lg font-semibold text-[#F5F5F3]">{brand.name}</h3>
                </div>
                <p className="mt-3 truncate text-xs text-[#B9BDC3]/80">
                  {brand.featuredMakesLine}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Automotive Journal (Ivory Editorial Contrast Section) */}
      <section className="bg-[#F5F5F3] text-[#0A0A0B]">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 border-b border-[#0A0A0B]/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#17191C]/70">
                Supercars.ng Journal
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0A0A0B] sm:text-4xl">
                Reviews, Buying Guides &amp; Market Intelligence
              </h2>
            </div>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0B] hover:opacity-70 whitespace-nowrap"
            >
              Read All Stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {articles[0] && (
              <Link
                to={`/journal/${articles[0].slug}`}
                className="group lg:col-span-7"
              >
                <div className="aspect-[16/10] w-full overflow-hidden rounded-sm bg-[#17191C]">
                  <ResilientImage
                    src={articles[0].featuredImageUrl}
                    alt={articles[0].title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-5">
                  <p className="text-xs font-medium text-[#17191C]/70">
                    {articles[0].category}
                    {articles[0].seriesName ? ` · ${articles[0].seriesName}` : ''}
                    <span> · {formatDateDisplay(articles[0].publishedAt)}</span>
                  </p>
                  <h3 className="mt-2 font-editorial text-3xl font-semibold leading-tight text-[#0A0A0B] group-hover:underline">
                    {articles[0].title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#17191C]/80">
                    {articles[0].excerpt}
                  </p>
                </div>
              </Link>
            )}

            <div className="flex flex-col divide-y divide-[#0A0A0B]/15 lg:col-span-5">
              {articles.slice(1, 4).map((article) => (
                <Link
                  key={article.id}
                  to={`/journal/${article.slug}`}
                  className="group py-5 first:pt-0 last:pb-0"
                >
                  <p className="text-xs font-medium text-[#17191C]/65">
                    {article.category}
                    {article.seriesName ? ` · ${article.seriesName}` : ''}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug text-[#0A0A0B] group-hover:underline">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#17191C]/75">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Dealerships & Newsletter */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-end justify-between border-b border-[#B9BDC3]/15 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
                  Verified Partners
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#F5F5F3]">
                  Featured Dealerships
                </h2>
              </div>
              <Link
                to="/dealers"
                className="text-xs font-medium text-[#F5F5F3] hover:text-[#B9BDC3] whitespace-nowrap"
              >
                All Dealerships
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dealers.slice(0, 4).map((dealer) => (
                <Link
                  key={dealer.id}
                  to={`/dealers/${dealer.slug}`}
                  className="flex flex-col justify-between rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 transition-colors hover:border-[#B9BDC3]/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#B9BDC3]">
                      <span>
                        {dealer.city}, {dealer.state}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#F5F5F3]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-[#F5F5F3]">
                      {dealer.businessName}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#B9BDC3]">
                      {dealer.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7 lg:col-span-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
                Weekly Dispatch
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F3]">
                The Supercars.ng Briefing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#B9BDC3]">
                Receive newly verified arrivals in Lagos and Abuja, Nigerian luxury market reports,
                and independent buying guides.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="you@domain.com"
                aria-label="Email address for newsletter"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/25 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/50 focus:border-[#F5F5F3] focus:outline-none"
              />
              <button
                type="submit"
                disabled={newsletterState === 'submitting'}
                className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-[#F5F5F3] px-5 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#B9BDC3] disabled:opacity-60"
              >
                {newsletterState === 'submitting' ? 'Subscribing...' : 'Subscribe to Dispatch'}
              </button>

              {newsletterState === 'done' && (
                <p className="flex items-center gap-2 text-xs text-[#F5F5F3]">
                  <CheckCircle2 className="h-4 w-4" />
                  Subscribed. You will receive our next Nigerian automotive briefing.
                </p>
              )}
              {newsletterState === 'error' && (
                <p className="text-xs text-red-400">
                  Unable to subscribe right now. Please verify your email address.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
