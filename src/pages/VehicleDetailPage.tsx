import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Flag,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ResilientImage } from '../components/vehicles/ResilientImage';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { useAuth } from '../context/AuthContext';
import {
  buildWhatsappUrl,
  formatAskingPrice,
  formatAvailabilityLabel,
  formatConditionLabel,
  formatDateDisplay,
  formatMileage,
  formatVerificationLabel,
} from '../lib/format';
import {
  fetchPublishedArticles,
  fetchPublishedListings,
  fetchVerificationRecordsForListing,
  fetchVerifiedDealers,
  submitBuyerEnquiry,
  submitSuspiciousListingReport,
} from '../services/marketplaceService';
import type {
  Article,
  Dealer,
  VehicleListing,
  VerificationRecord,
} from '../types/supercars';

export function VehicleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, savedListingIds, toggleSaveListing } = useAuth();

  const [allListings, setAllListings] = useState<VehicleListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Enquiry state
  const [buyerName, setBuyerName] = useState(user?.displayName || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [message, setMessage] = useState('');
  const [enquiryState, setEnquiryState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<
    'misleading_price' | 'fake_photos' | 'already_sold' | 'suspected_fraud' | 'other'
  >('misleading_price');
  const [reportDetails, setReportDetails] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [listingsData, dealersData, articlesData] = await Promise.all([
          fetchPublishedListings(),
          fetchVerifiedDealers(),
          fetchPublishedArticles(),
        ]);
        if (!active) return;
        setAllListings(listingsData);
        setDealers(dealersData);
        setArticles(articlesData);
        const match = listingsData.find((l) => l.slug === slug);
        if (match) {
          const recs = await fetchVerificationRecordsForListing(match.id);
          if (active) setVerifications(recs);
          setMessage(
            `Hello, I am interested in your ${match.year} ${match.make} ${match.model} listed on Supercars.ng.`
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    setActiveImageIndex(0);
    setEnquiryState('idle');
    setReportOpen(false);
    setReportSent(false);
    return () => {
      active = false;
    };
  }, [slug]);

  const listing = useMemo(
    () => allListings.find((item) => item.slug === slug),
    [allListings, slug]
  );

  const dealer = useMemo(
    () => dealers.find((d) => d.id === listing?.dealerId),
    [dealers, listing]
  );

  const similarListings = useMemo(() => {
    if (!listing) return [];
    return allListings
      .filter((l) => l.id !== listing.id && (l.category === listing.category || l.make === listing.make))
      .slice(0, 3);
  }, [allListings, listing]);

  const relatedArticles = useMemo(() => {
    if (!listing) return [];
    return articles
      .filter((a) => a.relatedMake === listing.make || a.category === 'Buying guides')
      .slice(0, 2);
  }, [articles, listing]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-[520px] animate-pulse rounded-sm bg-[#17191C]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-[#F5F5F3]">Listing not found</h1>
        <p className="mt-2 text-sm text-[#B9BDC3]">
          This vehicle may have been archived or removed from public view.
        </p>
        <Link
          to="/cars"
          className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isSaved = savedListingIds.includes(listing.id);
  const whatsappUrl = buildWhatsappUrl(
    listing.sellerWhatsapp || dealer?.whatsapp,
    `Hello ${listing.sellerName}, I saw your ${listing.title} on Supercars.ng and would like to arrange a viewing.`
  );

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryState('submitting');
    try {
      await submitBuyerEnquiry({
        listingId: listing.id,
        listingTitle: listing.title,
        dealerId: listing.dealerId || '',
        sellerId: listing.sellerId,
        buyerUid: user?.uid || '',
        buyerName,
        buyerPhone,
        buyerEmail,
        message,
        preferredContact,
      });
      setEnquiryState('sent');
    } catch {
      setEnquiryState('error');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitSuspiciousListingReport({
        listingId: listing.id,
        listingTitle: listing.title,
        reason: reportReason,
        details: reportDetails,
        reporterEmail: reportEmail,
      });
      setReportSent(true);
      setReportDetails('');
    } catch (error) {
      console.error('Report failed:', error);
    }
  };

  const specsRows = [
    ['Manufacturer', listing.make],
    ['Model', listing.model],
    ['Generation / Variant', [listing.generationName, listing.variantName].filter(Boolean).join(' · ') || 'Standard'],
    ['Engine', listing.engine || 'Not specified'],
    ['Horsepower', listing.horsepower || 'Not specified'],
    ['Torque', listing.torque || 'Not specified'],
    ['Transmission', listing.transmission],
    ['Drivetrain', listing.drivetrain || 'Not specified'],
    ['Fuel Type', listing.fuelType],
    ['0–100 km/h', listing.zeroTo100 || 'Not specified'],
    ['Top Speed', listing.topSpeed || 'Not specified'],
    ['Exterior / Interior', [listing.exteriorColor, listing.interiorColor].filter(Boolean).join(' / ') || 'Not specified'],
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#B9BDC3] hover:text-[#F5F5F3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void toggleSaveListing(listing.id)}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-[#B9BDC3]/25 px-3.5 text-xs font-medium text-[#F5F5F3] hover:border-[#F5F5F3]"
          >
            <Bookmark className="h-3.5 w-3.5" fill={isSaved ? '#F5F5F3' : 'none'} />
            {isSaved ? 'Saved' : 'Save Vehicle'}
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-sm border border-[#B9BDC3]/20 px-3 text-xs text-[#B9BDC3] hover:border-[#F5F5F3] hover:text-[#F5F5F3]"
          >
            <Flag className="h-3.5 w-3.5" />
            Report Listing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Gallery, Overview, Specs, Auditable Verification */}
        <div className="space-y-10 lg:col-span-7">
          <div>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-[#B9BDC3]/15 bg-[#17191C]">
              <ResilientImage
                src={listing.imageUrls?.[activeImageIndex] || listing.imageUrls?.[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>

            {listing.imageUrls && listing.imageUrls.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                {listing.imageUrls.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-[4/3] overflow-hidden rounded-sm border transition-opacity ${
                      activeImageIndex === idx
                        ? 'border-[#F5F5F3] opacity-100'
                        : 'border-[#B9BDC3]/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <ResilientImage src={url} alt={`${listing.title} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="border-t border-[#B9BDC3]/15 pt-8">
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">Vehicle Description</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#B9BDC3]">
              {listing.description}
            </p>
            <div className="mt-4">
              <Link
                to={`/discover/${listing.makeSlug}/${listing.modelSlug}`}
                className="text-xs font-medium text-[#F5F5F3] underline underline-offset-4 hover:text-[#B9BDC3]"
              >
                Explore {listing.make} {listing.model} generations &amp; catalogue profile
              </Link>
            </div>
          </section>

          <section className="border-t border-[#B9BDC3]/15 pt-8">
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">Technical Specifications</h2>
            <dl className="mt-5 divide-y divide-[#B9BDC3]/10 border-y border-[#B9BDC3]/15">
              {specsRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-2 gap-4 py-3 text-sm">
                  <dt className="text-[#B9BDC3]">{label}</dt>
                  <dd className="text-right font-medium tabular-nums text-[#F5F5F3]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Auditable Verification Section */}
          <section className="border-t border-[#B9BDC3]/15 pt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#F5F5F3]">
                Verification &amp; Checks Completed
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5F5F3]">
                <ShieldCheck className="h-4 w-4" />
                {verifications.length} {verifications.length === 1 ? 'Check' : 'Checks'} Recorded
              </span>
            </div>
            <p className="mt-2 text-xs text-[#B9BDC3]">
              Supercars.ng reports only explicit, evidence-referenced checks recorded by our verification desk.
            </p>

            {verifications.length === 0 ? (
              <div className="mt-5 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 text-sm text-[#B9BDC3]">
                Seller identity reviewed during listing moderation. Buyers are advised to inspect customs papers and commission an independent inspection prior to payment.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {verifications.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F5F5F3]">
                        <CheckCircle2 className="h-4 w-4 text-[#F5F5F3]" />
                        {formatVerificationLabel(rec.verificationType)}
                      </span>
                      <span className="font-mono text-xs text-[#B9BDC3]">
                        Ref: {rec.evidenceReference}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#B9BDC3]">{rec.notes}</p>
                    <p className="mt-2 text-[11px] text-[#B9BDC3]/70">
                      Recorded by {rec.verifiedBy} · {formatDateDisplay(rec.verifiedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Purchase & Enquiry Module */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-sm border border-[#B9BDC3]/20 bg-[#17191C] p-6">
              <p className="text-xs text-[#B9BDC3]">
                {listing.category} · {listing.city}, {listing.state}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#F5F5F3]">
                {listing.title}
              </h1>

              <div className="mt-4 border-y border-[#B9BDC3]/15 py-4">
                <p className="text-xs uppercase tracking-wider text-[#B9BDC3]">Asking Price</p>
                <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#F5F5F3]">
                  {formatAskingPrice(listing.price, listing.currency, listing.priceType)}
                </p>
                <p className="mt-1 text-[11px] text-[#B9BDC3]/80">
                  Seller asking price. Buyers arrange inspection and settlement directly with the seller.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="block text-[#B9BDC3]">Year</span>
                  <span className="mt-0.5 block font-medium tabular-nums text-[#F5F5F3]">
                    {listing.year}
                  </span>
                </div>
                <div>
                  <span className="block text-[#B9BDC3]">Mileage</span>
                  <span className="mt-0.5 block font-medium tabular-nums text-[#F5F5F3]">
                    {formatMileage(listing.mileageKm)}
                  </span>
                </div>
                <div>
                  <span className="block text-[#B9BDC3]">Condition</span>
                  <span className="mt-0.5 block font-medium text-[#F5F5F3]">
                    {formatConditionLabel(listing.condition)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#B9BDC3]/15 pt-4 text-xs">
                <span className="text-[#B9BDC3]">
                  Availability:{' '}
                  <strong className="font-semibold text-[#F5F5F3]">
                    {formatAvailabilityLabel(listing.availabilityStatus)}
                  </strong>
                </span>
                {dealer ? (
                  <Link
                    to={`/dealers/${dealer.slug}`}
                    className="font-medium text-[#F5F5F3] underline underline-offset-4 hover:text-[#B9BDC3]"
                  >
                    {dealer.businessName}
                  </Link>
                ) : (
                  <span className="text-[#F5F5F3]">{listing.sellerName}</span>
                )}
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-[#F5F5F3]/35 bg-[#0A0A0B] px-4 text-sm font-medium text-[#F5F5F3] transition-colors hover:bg-[#F5F5F3] hover:text-[#0A0A0B]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Seller via WhatsApp
                </a>
              )}
            </div>

            {/* Direct Enquiry Form (Public — no sign-in required) */}
            <div className="rounded-sm border border-[#B9BDC3]/20 bg-[#17191C] p-6">
              <h2 className="text-xl font-semibold text-[#F5F5F3]">Submit Qualified Enquiry</h2>
              <p className="mt-1 text-xs text-[#B9BDC3]">
                No account required. Your enquiry goes directly to {listing.sellerName}.
              </p>

              {enquiryState === 'sent' ? (
                <div className="mt-5 rounded-sm border border-[#F5F5F3]/25 bg-[#0A0A0B] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F3]">
                    <CheckCircle2 className="h-4 w-4" />
                    Enquiry Delivered
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#B9BDC3]">
                    {listing.sellerName} has received your request and will contact you via{' '}
                    {preferredContact}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Full name"
                    className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/50 focus:border-[#F5F5F3] focus:outline-none"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="tel"
                      required
                      minLength={6}
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="Phone / WhatsApp (+234...)"
                      className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/50 focus:border-[#F5F5F3] focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="Email address"
                      className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/50 focus:border-[#F5F5F3] focus:outline-none"
                    />
                  </div>
                  <select
                    value={preferredContact}
                    onChange={(e) =>
                      setPreferredContact(e.target.value as 'whatsapp' | 'phone' | 'email')
                    }
                    aria-label="Preferred contact method"
                    className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] focus:border-[#F5F5F3] focus:outline-none"
                  >
                    <option value="whatsapp">Prefer WhatsApp</option>
                    <option value="phone">Prefer Phone Call</option>
                    <option value="email">Prefer Email</option>
                  </select>
                  <textarea
                    required
                    minLength={5}
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about inspection availability, customs papers, or viewing schedule..."
                    className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3.5 text-sm text-[#F5F5F3] placeholder:text-[#B9BDC3]/50 focus:border-[#F5F5F3] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={enquiryState === 'submitting'}
                    className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-[#F5F5F3] px-5 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#B9BDC3] disabled:opacity-60"
                  >
                    {enquiryState === 'submitting' ? 'Sending Enquiry...' : 'Send Enquiry'}
                  </button>
                  {enquiryState === 'error' && (
                    <p className="text-xs text-red-400">
                      Could not submit enquiry. Check all fields and retry.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Vehicles & Editorial */}
      {(similarListings.length > 0 || relatedArticles.length > 0) && (
        <section className="mt-16 border-t border-[#B9BDC3]/15 pt-12">
          {similarListings.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#F5F5F3]">Similar Automobiles</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {similarListings.map((item) => (
                  <VehicleCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div className="mt-12 border-t border-[#B9BDC3]/10 pt-10">
              <h2 className="text-2xl font-semibold text-[#F5F5F3]">Relevant Editorial Guides</h2>
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                {relatedArticles.map((art) => (
                  <Link
                    key={art.id}
                    to={`/journal/${art.slug}`}
                    className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 transition-colors hover:border-[#B9BDC3]/40"
                  >
                    <p className="text-xs text-[#B9BDC3]">
                      {art.category}
                      {art.seriesName ? ` · ${art.seriesName}` : ''}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#F5F5F3]">{art.title}</h3>
                    <p className="mt-2 text-xs text-[#B9BDC3]">{art.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-sm border border-[#B9BDC3]/25 bg-[#17191C] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#F5F5F3]">Report Suspicious Listing</h3>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="text-xs text-[#B9BDC3] hover:text-[#F5F5F3]"
              >
                Close
              </button>
            </div>
            {reportSent ? (
              <div className="mt-4 space-y-3 text-sm text-[#B9BDC3]">
                <p className="text-[#F5F5F3]">
                  Thank you. Our moderation team has logged this report for review.
                </p>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="h-10 rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-3">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as typeof reportReason)}
                  className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
                >
                  <option value="misleading_price">Misleading or inaccurate pricing</option>
                  <option value="fake_photos">Unverified or misleading photos</option>
                  <option value="already_sold">Vehicle already sold</option>
                  <option value="suspected_fraud">Suspected misrepresentation</option>
                  <option value="other">Other issue</option>
                </select>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the discrepancy or concern..."
                  className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3 text-xs text-[#F5F5F3]"
                />
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="Optional contact email"
                  className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
                />
                <button
                  type="submit"
                  className="h-10 w-full rounded-sm bg-[#F5F5F3] text-xs font-semibold text-[#0A0A0B]"
                >
                  Submit Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
