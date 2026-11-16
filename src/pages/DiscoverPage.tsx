import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ResilientImage } from '../components/vehicles/ResilientImage';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { CATALOGUE_MANUFACTURERS, CATALOGUE_MODELS } from '../data/catalogue';
import { fetchPublishedArticles, fetchPublishedListings } from '../services/marketplaceService';
import type { Article, VehicleListing } from '../types/supercars';

export function DiscoverPage() {
  const { make, model } = useParams<{ make?: string; model?: string }>();
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const [l, a] = await Promise.all([fetchPublishedListings(), fetchPublishedArticles()]);
      if (!active) return;
      setListings(l);
      setArticles(a);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const currentMake = useMemo(
    () => CATALOGUE_MANUFACTURERS.find((m) => m.slug === make),
    [make]
  );

  const modelsForMake = useMemo(
    () => (make ? CATALOGUE_MODELS.filter((mod) => mod.manufacturerSlug === make) : []),
    [make]
  );

  const currentModel = useMemo(
    () =>
      make && model
        ? CATALOGUE_MODELS.find((m) => m.manufacturerSlug === make && m.slug === model)
        : undefined,
    [make, model]
  );

  // 1. Model Detail View (/discover/:make/:model)
  if (make && model) {
    if (!currentMake || !currentModel) {
      return (
        <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-[#F5F5F3]">Model profile not found</h1>
          <Link
            to="/discover"
            className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
          >
            Browse Manufacturer Directory
          </Link>
        </div>
      );
    }

    const relatedListings = listings.filter(
      (l) => l.makeSlug === currentMake.slug && l.modelSlug === currentModel.slug
    );
    const relatedArticles = articles.filter(
      (a) =>
        a.relatedMake?.toLowerCase() === currentMake.name.toLowerCase() ||
        a.relatedModel?.toLowerCase() === currentModel.name.toLowerCase()
    );

    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-[#B9BDC3]">
          <Link to="/discover" className="hover:text-[#F5F5F3]">
            Discover
          </Link>
          <span>/</span>
          <Link to={`/discover/${currentMake.slug}`} className="hover:text-[#F5F5F3]">
            {currentMake.name}
          </Link>
          <span>/</span>
          <span className="text-[#F5F5F3]">{currentModel.name}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 border-b border-[#B9BDC3]/15 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B9BDC3]">
              {currentMake.name} · {currentModel.bodyType} · Introduced {currentModel.introductionYear}
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[#F5F5F3] sm:text-5xl">
              {currentMake.name} {currentModel.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#B9BDC3]">
              {currentModel.overview}
            </p>
            <div className="mt-6 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F3]">
                Nigerian Ownership &amp; Sourcing Notes
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#B9BDC3]">
                {currentModel.nigeriaNotes}
              </p>
            </div>
          </div>

          <div className="aspect-[16/10] overflow-hidden rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] lg:col-span-6">
            <ResilientImage
              src={currentModel.heroImage}
              alt={`${currentMake.name} ${currentModel.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Generations & Variants */}
        <section className="mt-12 space-y-10">
          <div>
            <h2 className="text-3xl font-semibold text-[#F5F5F3]">
              Generations &amp; Technical Variants
            </h2>
            <p className="mt-1 text-xs text-[#B9BDC3]">
              Reference model architecture and factory specifications (distinct from individual marketplace listings).
            </p>
          </div>

          {currentModel.generations.map((gen) => (
            <div
              key={gen.id}
              className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#B9BDC3]/15 pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#F5F5F3]">{gen.generationName}</h3>
                  <p className="mt-1 text-xs text-[#B9BDC3]">{gen.summary}</p>
                </div>
                <span className="font-mono text-xs text-[#B9BDC3]">
                  {gen.generationCode} · {gen.startYear}–{gen.endYear ?? 'Present'}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#B9BDC3]/15 text-[#B9BDC3]">
                      <th className="py-2.5 pr-4 font-medium">Variant</th>
                      <th className="py-2.5 pr-4 font-medium">Engine</th>
                      <th className="py-2.5 pr-4 font-medium">Output</th>
                      <th className="py-2.5 pr-4 font-medium">Transmission</th>
                      <th className="py-2.5 pr-4 font-medium">0–100 km/h</th>
                      <th className="py-2.5 font-medium">Top Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B9BDC3]/10 text-[#F5F5F3]">
                    {gen.variants.map((v) => (
                      <tr key={v.id}>
                        <td className="py-3 pr-4 font-semibold">{v.name}</td>
                        <td className="py-3 pr-4 text-[#B9BDC3]">{v.engine}</td>
                        <td className="py-3 pr-4 tabular-nums">{v.horsepower}</td>
                        <td className="py-3 pr-4 text-[#B9BDC3]">{v.transmission}</td>
                        <td className="py-3 pr-4 font-mono tabular-nums">{v.zeroTo100}</td>
                        <td className="py-3 font-mono tabular-nums">{v.topSpeed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* Related Marketplace Listings */}
        <section className="mt-14 border-t border-[#B9BDC3]/15 pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">
              Available {currentMake.name} {currentModel.name} Listings in Nigeria
            </h2>
            <Link
              to={`/cars?make=${encodeURIComponent(currentMake.name)}`}
              className="text-xs font-medium text-[#F5F5F3] hover:underline"
            >
              Browse All {currentMake.name}
            </Link>
          </div>
          {relatedListings.length === 0 ? (
            <p className="mt-4 text-sm text-[#B9BDC3]">
              No active {currentMake.name} {currentModel.name} listings are published right now.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedListings.map((item) => (
                <VehicleCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </section>

        {/* Related Journal Stories */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 border-t border-[#B9BDC3]/15 pt-10">
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">Related Editorial</h2>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
              {relatedArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/journal/${art.slug}`}
                  className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 hover:border-[#B9BDC3]/40"
                >
                  <p className="text-xs text-[#B9BDC3]">{art.category}</p>
                  <h3 className="mt-1.5 text-lg font-semibold text-[#F5F5F3]">{art.title}</h3>
                  <p className="mt-2 text-xs text-[#B9BDC3]">{art.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // 2. Manufacturer Detail View (/discover/:make)
  if (make) {
    if (!currentMake) {
      return (
        <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-[#F5F5F3]">Manufacturer not found</h1>
          <Link
            to="/discover"
            className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
          >
            Back to Directory
          </Link>
        </div>
      );
    }

    const brandListings = listings.filter((l) => l.makeSlug === currentMake.slug);

    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#B9BDC3] hover:text-[#F5F5F3]"
        >
          <ArrowLeft className="h-4 w-4" />
          All Manufacturers
        </Link>

        <div className="mt-6 border-b border-[#B9BDC3]/15 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B9BDC3]">
            {currentMake.countryOfOrigin} · Founded {currentMake.foundedYear}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#F5F5F3] sm:text-5xl">
            {currentMake.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#B9BDC3]">
            {currentMake.description}
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-[#F5F5F3]">Catalogue Models</h2>
          {modelsForMake.length === 0 ? (
            <div className="mt-6 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6 text-sm text-[#B9BDC3]">
              Key models in this marque: {currentMake.featuredMakesLine}. Detailed specification sheets are being expanded for the Nigerian catalogue.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modelsForMake.map((m) => (
                <Link
                  key={m.id}
                  to={`/discover/${currentMake.slug}/${m.slug}`}
                  className="group overflow-hidden rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] hover:border-[#B9BDC3]/40"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#0A0A0B]">
                    <ResilientImage
                      src={m.heroImage}
                      alt={`${currentMake.name} ${m.name}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#B9BDC3]">
                      {m.category} · {m.bodyType}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[#F5F5F3]">
                      {currentMake.name} {m.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs text-[#B9BDC3]">{m.overview}</p>
                    <p className="mt-4 text-xs font-medium text-[#F5F5F3]">
                      View Generations &amp; Specs →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {brandListings.length > 0 && (
          <section className="mt-14 border-t border-[#B9BDC3]/15 pt-10">
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">
              Active {currentMake.name} Marketplace Listings
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {brandListings.map((item) => (
                <VehicleCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // 3. Manufacturer Directory (/discover)
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#B9BDC3]/15 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
          Automotive Discovery Catalogue
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F5F5F3]">
          Manufacturers, Models &amp; Generations
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#B9BDC3]">
          Research marque heritage, generation codes, powertrain variants, and Nigerian ownership context before contacting a seller.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOGUE_MANUFACTURERS.map((brand) => {
          const modelCount = CATALOGUE_MODELS.filter(
            (m) => m.manufacturerSlug === brand.slug
          ).length;
          return (
            <Link
              key={brand.id}
              to={`/discover/${brand.slug}`}
              className="flex flex-col justify-between rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6 transition-colors hover:border-[#B9BDC3]/40"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#B9BDC3]">
                  <span>{brand.countryOfOrigin}</span>
                  <span className="tabular-nums">Est. {brand.foundedYear}</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F3]">{brand.name}</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#B9BDC3]">{brand.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[#B9BDC3]/10 pt-4 text-xs">
                <span className="text-[#B9BDC3]">{brand.featuredMakesLine}</span>
                <span className="inline-flex items-center gap-1 font-medium text-[#F5F5F3] whitespace-nowrap">
                  {modelCount > 0 ? `${modelCount} profiled` : 'Explore'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
