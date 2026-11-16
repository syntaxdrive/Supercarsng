import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ResilientImage } from '../components/vehicles/ResilientImage';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { formatDateDisplay } from '../lib/format';
import { fetchPublishedArticles, fetchPublishedListings } from '../services/marketplaceService';
import type { Article, ArticleCategory, VehicleListing } from '../types/supercars';

const ARTICLE_CATEGORIES: Array<'All' | ArticleCategory> = [
  'All',
  'News',
  'Reviews',
  'Buying guides',
  'Comparisons',
  'Ownership',
  'Market',
];

export function JournalPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [activeCat, setActiveCat] = useState<'All' | ArticleCategory>('All');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [a, l] = await Promise.all([fetchPublishedArticles(), fetchPublishedListings()]);
        if (!active) return;
        setArticles(a);
        setListings(l);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  const currentArticle = useMemo(
    () => (slug ? articles.find((a) => a.slug === slug) : undefined),
    [articles, slug]
  );

  // Article Detail View (/journal/:slug)
  if (slug) {
    if (loading) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="h-96 animate-pulse rounded-sm bg-[#17191C]" />
        </div>
      );
    }
    if (!currentArticle) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold text-[#F5F5F3]">Article not found</h1>
          <Link
            to="/journal"
            className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
          >
            Back to Journal
          </Link>
        </div>
      );
    }

    const relatedVehicles = listings.filter(
      (l) =>
        !currentArticle.relatedMake ||
        l.make.toLowerCase() === currentArticle.relatedMake.toLowerCase()
    ).slice(0, 3);
    const relatedArticles = articles.filter((a) => a.id !== currentArticle.id).slice(0, 2);

    const handleShare = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        setCopied(false);
      }
    };

    return (
      <article className="bg-[#F5F5F3] text-[#0A0A0B]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#17191C]/70 hover:text-[#0A0A0B]"
            >
              <ArrowLeft className="h-4 w-4" />
              Supercars.ng Journal
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-[#0A0A0B]/20 px-3 text-xs font-medium text-[#0A0A0B] hover:bg-[#0A0A0B] hover:text-[#F5F5F3]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Link Copied' : 'Share Article'}
            </button>
          </div>

          <header className="mt-8 border-b border-[#0A0A0B]/15 pb-8">
            <p className="text-xs font-medium uppercase tracking-wider text-[#17191C]/70">
              {currentArticle.category}
              {currentArticle.seriesName ? ` · ${currentArticle.seriesName}` : ''}
            </p>
            <h1 className="mt-3 font-editorial text-4xl font-semibold leading-[1.1] text-[#0A0A0B] sm:text-5xl">
              {currentArticle.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#17191C]/80">
              {currentArticle.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#17191C]/70">
              <span>By {currentArticle.authorName}</span>
              <span aria-hidden="true">·</span>
              <span>Published {formatDateDisplay(currentArticle.publishedAt)}</span>
              {currentArticle.researchDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{currentArticle.researchDate}</span>
                </>
              )}
            </div>
          </header>

          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-sm bg-[#17191C]">
            <ResilientImage
              src={currentArticle.featuredImageUrl}
              alt={currentArticle.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-10 space-y-6 text-base leading-[1.8] text-[#17191C]">
            {currentArticle.body.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {relatedArticles.length > 0 && (
            <section className="mt-14 border-t border-[#0A0A0B]/15 pt-10">
              <h2 className="font-editorial text-2xl font-semibold text-[#0A0A0B]">
                Further Reading
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {relatedArticles.map((art) => (
                  <Link
                    key={art.id}
                    to={`/journal/${art.slug}`}
                    className="rounded-sm border border-[#0A0A0B]/15 bg-white/70 p-5 hover:border-[#0A0A0B]"
                  >
                    <p className="text-xs text-[#17191C]/65">{art.category}</p>
                    <h3 className="mt-1.5 text-lg font-semibold text-[#0A0A0B]">{art.title}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {relatedVehicles.length > 0 && (
          <div className="bg-[#0A0A0B] py-14 text-[#F5F5F3]">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-semibold text-[#F5F5F3]">
                Related Vehicles in the Marketplace
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedVehicles.map((item) => (
                  <VehicleCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    );
  }

  // Journal Index (/journal)
  const filteredArticles =
    activeCat === 'All'
      ? articles
      : articles.filter((a) => a.category === activeCat);

  return (
    <div className="bg-[#F5F5F3] text-[#0A0A0B]">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-[#0A0A0B]/15 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#17191C]/70">
            Editorial Publication
          </p>
          <h1 className="mt-2 font-editorial text-4xl font-semibold tracking-tight text-[#0A0A0B] sm:text-5xl">
            The Supercars.ng Automotive Journal
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#17191C]/80">
            Nigeria-relevant buying guides, ownership economics, road tests, and luxury market intelligence.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-sm border border-[#0A0A0B]/15 bg-white p-1">
            {ARTICLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                className={`h-9 rounded-sm px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCat === cat
                    ? 'bg-[#0A0A0B] text-[#F5F5F3]'
                    : 'text-[#17191C]/75 hover:text-[#0A0A0B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((art) => (
            <Link
              key={art.id}
              to={`/journal/${art.slug}`}
              className="group flex flex-col overflow-hidden rounded-sm border border-[#0A0A0B]/15 bg-white transition-colors hover:border-[#0A0A0B]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#17191C]">
                <ResilientImage
                  src={art.featuredImageUrl}
                  alt={art.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-xs font-medium text-[#17191C]/65">
                    {art.category}
                    {art.seriesName ? ` · ${art.seriesName}` : ''}
                  </p>
                  <h2 className="mt-2 font-editorial text-2xl font-semibold leading-snug text-[#0A0A0B] group-hover:underline">
                    {art.title}
                  </h2>
                  <p className="mt-2.5 line-clamp-3 text-sm text-[#17191C]/80">
                    {art.excerpt}
                  </p>
                </div>
                <p className="mt-5 border-t border-[#0A0A0B]/10 pt-3 text-xs text-[#17191C]/65">
                  {art.authorName} · {formatDateDisplay(art.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
