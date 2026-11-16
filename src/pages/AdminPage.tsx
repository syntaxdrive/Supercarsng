import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Database, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatAskingPrice, formatDateDisplay } from '../lib/format';
import {
  adminAddVerificationRecord,
  adminModerateListing,
  adminPublishArticle,
  adminResolveReport,
  adminReviewDealer,
  adminSeedCuratedLaunchInventory,
  fetchAllAdminData,
} from '../services/marketplaceService';
import type {
  Article,
  ArticleCategory,
  AuditLog,
  Dealer,
  DealerDocument,
  Enquiry,
  ListingReport,
  VehicleListing,
  VerificationRecord,
  VerificationType,
} from '../types/supercars';

export function AdminPage() {
  const { user, loading, isAdmin, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<'listings' | 'dealers' | 'editorial' | 'reports' | 'audit'>('listings');

  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerDocs, setDealerDocs] = useState<DealerDocument[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Moderation feedback & verification check state per listing
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [verListingId, setVerListingId] = useState('');
  const [verType, setVerType] = useState<VerificationType>('vehicle_identity');
  const [verRef, setVerRef] = useState('');
  const [verNotes, setVerNotes] = useState('');

  // Editorial publish form
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<ArticleCategory>('Market');
  const [artSeries, setArtSeries] = useState('Nigerian Luxury Car Watch');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artBody, setArtBody] = useState('');
  const [artImage, setArtImage] = useState('/src/assets/images/journal_cockpit_showroom_1794813253671.jpg');

  const loadAdmin = useCallback(async () => {
    if (!user || !isAdmin) return;
    setBusy(true);
    try {
      const data = await fetchAllAdminData();
      setListings(data.listings);
      setDealers(data.dealers);
      setDealerDocs(data.dealerDocs);
      setEnquiries(data.enquiries);
      setReports(data.reports);
      setArticles(data.articles);
      setAuditLogs(data.auditLogs);
      setVerifications(data.verifications);
    } finally {
      setBusy(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    void loadAdmin();
  }, [loadAdmin]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16">
        <div className="h-64 animate-pulse rounded-sm bg-[#17191C]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#F5F5F3]">Administrator Access</h1>
        <p className="mt-2 text-sm text-[#B9BDC3]">Sign in with your administrator Google account.</p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-6 text-xs font-semibold text-[#0A0A0B]"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#F5F5F3]">Access Restricted</h1>
        <p className="mt-2 text-sm text-[#B9BDC3]">
          Signed in as {user.email}. Administrative permissions are required to access moderation and audit logs.
        </p>
      </div>
    );
  }

  const handleSeed = async () => {
    setBusy(true);
    try {
      const count = await adminSeedCuratedLaunchInventory(user.uid, user.email || '');
      setStatusBanner(`Synced ${count} curated launch records into Firestore.`);
      await loadAdmin();
    } finally {
      setBusy(false);
    }
  };

  const handleAddVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verListingId) return;
    await adminAddVerificationRecord({
      listingId: verListingId,
      verificationType: verType,
      status: 'verified',
      notes: verNotes,
      evidenceReference: verRef,
      actorId: user.uid,
      actorEmail: user.email || '',
    });
    setVerRef('');
    setVerNotes('');
    setStatusBanner('Auditable verification check recorded.');
    await loadAdmin();
  };

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminPublishArticle({
      title: artTitle,
      category: artCategory,
      seriesName: artSeries,
      excerpt: artExcerpt,
      body: artBody,
      featuredImageUrl: artImage,
      actorId: user.uid,
      actorEmail: user.email || '',
      authorName: user.displayName || 'Supercars.ng Editorial',
    });
    setArtTitle('');
    setArtExcerpt('');
    setArtBody('');
    setStatusBanner('Journal article published.');
    await loadAdmin();
  };

  const pendingListingsCount = listings.filter((l) => l.moderationStatus === 'pending').length;
  const pendingDealersCount = dealers.filter((d) => d.verificationStatus === 'pending').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 border-b border-[#B9BDC3]/15 pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
            Operational Control Centre
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#F5F5F3]">
            Supercars.ng Administration
          </h1>
          <p className="mt-1 text-xs text-[#B9BDC3] tabular-nums">
            {pendingListingsCount} pending listings · {pendingDealersCount} pending dealerships ·{' '}
            {reports.filter((r) => r.status === 'open').length} open reports · {enquiries.length} total enquiries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSeed()}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-[#B9BDC3]/30 px-4 text-xs font-medium text-[#F5F5F3] hover:border-[#F5F5F3] disabled:opacity-50"
          >
            <Database className="h-3.5 w-3.5" />
            Sync Launch Inventory to Firestore
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-1">
        {(['listings', 'dealers', 'editorial', 'reports', 'audit'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-9 rounded-sm px-4 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-[#F5F5F3] text-[#0A0A0B]' : 'text-[#B9BDC3] hover:text-[#F5F5F3]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {statusBanner && (
        <div className="mt-5 flex items-center justify-between rounded-sm border border-[#F5F5F3]/25 bg-[#17191C] px-4 py-3 text-xs text-[#F5F5F3]">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {statusBanner}
          </span>
          <button type="button" onClick={() => setStatusBanner(null)} className="text-[#B9BDC3]">
            Close
          </button>
        </div>
      )}

      {/* 1. Listings & Verification Tab */}
      {tab === 'listings' && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              Listings &amp; Moderation Queue ({listings.length})
            </h2>
            {listings.length === 0 ? (
              <p className="text-sm text-[#B9BDC3]">
                No listings in Firestore yet. Click &quot;Sync Launch Inventory to Firestore&quot; above to seed curated records.
              </p>
            ) : (
              listings.map((item) => {
                const verCount = verifications.filter((v) => v.listingId === item.id).length;
                return (
                  <div
                    key={item.id}
                    className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#B9BDC3]">
                          {item.sellerName} ({item.sellerType}) · {item.city}, {item.state}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#F5F5F3]">{item.title}</h3>
                        <p className="mt-1 font-mono text-xs text-[#B9BDC3] tabular-nums">
                          {formatAskingPrice(item.price, item.currency, item.priceType)} ·{' '}
                          {verCount} verification checks
                        </p>
                      </div>
                      <span className="text-xs font-medium uppercase text-[#F5F5F3]">
                        {item.listingStatus} / {item.moderationStatus}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={feedbackMap[item.id] ?? item.moderationFeedback ?? ''}
                        onChange={(e) =>
                          setFeedbackMap((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Moderator notes / revision instructions..."
                        className="h-10 flex-1 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void adminModerateListing({
                              listingId: item.id,
                              moderationStatus: 'approved',
                              listingStatus: 'published',
                              isFeatured: item.isFeatured,
                              feedback: feedbackMap[item.id] || '',
                              actorId: user.uid,
                              actorEmail: user.email || '',
                            }).then(loadAdmin)
                          }
                          className="h-10 rounded-sm bg-[#F5F5F3] px-3.5 text-xs font-semibold text-[#0A0A0B]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void adminModerateListing({
                              listingId: item.id,
                              moderationStatus: 'revision_required',
                              listingStatus: 'pending',
                              isFeatured: false,
                              feedback: feedbackMap[item.id] || 'Please update listing photos or pricing details.',
                              actorId: user.uid,
                              actorEmail: user.email || '',
                            }).then(loadAdmin)
                          }
                          className="h-10 rounded-sm border border-[#B9BDC3]/25 px-3 text-xs text-[#F5F5F3]"
                        >
                          Request Revision
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void adminModerateListing({
                              listingId: item.id,
                              moderationStatus: 'rejected',
                              listingStatus: 'archived',
                              isFeatured: false,
                              feedback: feedbackMap[item.id] || 'Does not meet curation standards.',
                              actorId: user.uid,
                              actorEmail: user.email || '',
                            }).then(loadAdmin)
                          }
                          className="h-10 rounded-sm border border-red-400/40 px-3 text-xs text-red-300"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleAddVerification}
            className="h-fit space-y-3 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6 lg:col-span-4"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F3]">
              <ShieldCheck className="h-4 w-4" />
              Record Auditable Verification Check
            </div>
            <p className="text-xs text-[#B9BDC3]">
              Only recorded checks appear on public vehicle detail pages.
            </p>
            <select
              required
              value={verListingId}
              onChange={(e) => setVerListingId(e.target.value)}
              className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            >
              <option value="">Select listing...</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <select
              value={verType}
              onChange={(e) => setVerType(e.target.value as VerificationType)}
              className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            >
              <option value="vehicle_identity">Vehicle Identity (VIN / Chassis)</option>
              <option value="ownership_documentation">Ownership &amp; Customs Docs</option>
              <option value="physical_inspection">Physical Inspection</option>
              <option value="dealer_business">Dealer Business Verification</option>
              <option value="seller_identity">Seller Identity</option>
            </select>
            <input
              type="text"
              required
              value={verRef}
              onChange={(e) => setVerRef(e.target.value)}
              placeholder="Evidence Reference (e.g. VIN-992-041)"
              className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            />
            <textarea
              required
              rows={3}
              value={verNotes}
              onChange={(e) => setVerNotes(e.target.value)}
              placeholder="Specific findings observed..."
              className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3 text-xs text-[#F5F5F3]"
            />
            <button
              type="submit"
              className="h-10 w-full rounded-sm bg-[#F5F5F3] text-xs font-semibold text-[#0A0A0B]"
            >
              Save Verification Record
            </button>
          </form>
        </div>
      )}

      {/* 2. Dealers & Private Documents Tab */}
      {tab === 'dealers' && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#F5F5F3]">
            Dealerships &amp; Onboarding Documents ({dealers.length})
          </h2>
          {dealers.map((d) => {
            const dDocs = dealerDocs.filter((docItem) => docItem.dealerId === d.id);
            return (
              <div
                key={d.id}
                className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#B9BDC3]">
                      {d.city}, {d.state} · Status: <strong className="text-[#F5F5F3]">{d.verificationStatus}</strong>
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[#F5F5F3]">{d.businessName}</h3>
                    <p className="mt-1 text-xs text-[#B9BDC3]">{d.description}</p>
                    {dDocs.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-[#B9BDC3]/10 pt-2 text-xs text-[#B9BDC3]">
                        {dDocs.map((docItem) => (
                          <p key={docItem.id}>
                            Doc: {docItem.documentType} · Ref: {docItem.referenceCode} ({docItem.reviewStatus})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void adminReviewDealer({
                          dealerId: d.id,
                          verificationStatus: 'verified',
                          isFeatured: true,
                          actorId: user.uid,
                          actorEmail: user.email || '',
                        }).then(loadAdmin)
                      }
                      className="h-10 rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B]"
                    >
                      Verify Dealer
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void adminReviewDealer({
                          dealerId: d.id,
                          verificationStatus: 'rejected',
                          isFeatured: false,
                          actorId: user.uid,
                          actorEmail: user.email || '',
                        }).then(loadAdmin)
                      }
                      className="h-10 rounded-sm border border-red-400/40 px-3 text-xs text-red-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Editorial CMS Tab */}
      {tab === 'editorial' && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            onSubmit={handlePublishArticle}
            className="space-y-4 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6 lg:col-span-6"
          >
            <h2 className="text-xl font-semibold text-[#F5F5F3]">Publish Journal Article</h2>
            <input
              type="text"
              required
              minLength={5}
              value={artTitle}
              onChange={(e) => setArtTitle(e.target.value)}
              placeholder="Headline *"
              className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={artCategory}
                onChange={(e) => setArtCategory(e.target.value as ArticleCategory)}
                className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
              >
                <option value="News">News</option>
                <option value="Reviews">Reviews</option>
                <option value="Buying guides">Buying guides</option>
                <option value="Comparisons">Comparisons</option>
                <option value="Ownership">Ownership</option>
                <option value="Market">Market</option>
              </select>
              <input
                type="text"
                value={artSeries}
                onChange={(e) => setArtSeries(e.target.value)}
                placeholder="Series (e.g. The Price of Luxury)"
                className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
              />
            </div>
            <input
              type="text"
              required
              value={artImage}
              onChange={(e) => setArtImage(e.target.value)}
              placeholder="Featured Image URL"
              className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-xs text-[#F5F5F3]"
            />
            <textarea
              required
              minLength={10}
              rows={2}
              value={artExcerpt}
              onChange={(e) => setArtExcerpt(e.target.value)}
              placeholder="Editorial excerpt..."
              className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3 text-xs text-[#F5F5F3]"
            />
            <textarea
              required
              minLength={50}
              rows={6}
              value={artBody}
              onChange={(e) => setArtBody(e.target.value)}
              placeholder="Full article body (use blank lines between paragraphs)..."
              className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3 text-xs text-[#F5F5F3]"
            />
            <button
              type="submit"
              className="h-11 w-full rounded-sm bg-[#F5F5F3] text-xs font-semibold text-[#0A0A0B]"
            >
              Publish Article
            </button>
          </form>

          <div className="space-y-3 lg:col-span-6">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              Published Articles ({articles.length})
            </h2>
            {articles.map((art) => (
              <div
                key={art.id}
                className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-4"
              >
                <p className="text-xs text-[#B9BDC3]">
                  {art.category} · {formatDateDisplay(art.publishedAt)}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[#F5F5F3]">{art.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Reports & Enquiries Tab */}
      {tab === 'reports' && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              Suspicious Listing Reports ({reports.length})
            </h2>
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-[#F5F5F3]">{rep.listingTitle || rep.listingId}</strong>
                  <span className="uppercase text-[#B9BDC3]">{rep.status}</span>
                </div>
                <p className="mt-1 text-[#B9BDC3]">
                  Reason: {rep.reason} — {rep.details}
                </p>
                {rep.status === 'open' && (
                  <button
                    type="button"
                    onClick={() =>
                      void adminResolveReport(
                        rep.id,
                        'resolved',
                        user.uid,
                        user.email || ''
                      ).then(loadAdmin)
                    }
                    className="mt-3 h-8 rounded-sm bg-[#F5F5F3] px-3 text-[11px] font-semibold text-[#0A0A0B]"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              All Buyer Enquiries ({enquiries.length})
            </h2>
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-4 text-xs"
              >
                <p className="font-semibold text-[#F5F5F3]">
                  {enq.buyerName} · {enq.listingTitle || 'Showroom / Concierge'}
                </p>
                <p className="mt-1 text-[#B9BDC3]">
                  {enq.buyerPhone} · {enq.buyerEmail} · Status: {enq.enquiryStatus}
                </p>
                <p className="mt-1.5 text-[#B9BDC3]">{enq.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Immutable Audit Logs Tab */}
      {tab === 'audit' && (
        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold text-[#F5F5F3]">
            Administrative Audit Trail ({auditLogs.length})
          </h2>
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col justify-between gap-2 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-4 text-xs sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-[#F5F5F3]">
                  {log.action} · {log.targetType} ({log.targetId})
                </p>
                <p className="mt-1 text-[#B9BDC3]">{log.summary}</p>
              </div>
              <div className="text-right text-[#B9BDC3]">
                <p>{log.actorEmail}</p>
                <p>{formatDateDisplay(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
