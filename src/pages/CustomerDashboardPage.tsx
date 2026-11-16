import { useEffect, useState } from 'react';
import { Building2, LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { formatDateDisplay } from '../lib/format';
import {
  fetchBuyerEnquiries,
  fetchPublishedListings,
  fetchSellerListings,
} from '../services/marketplaceService';
import type { Enquiry, VehicleListing } from '../types/supercars';

export function CustomerDashboardPage() {
  const { user, loading, isAdmin, savedListingIds, signInWithGoogle, signOutUser } = useAuth();
  const [publishedListings, setPublishedListings] = useState<VehicleListing[]>([]);
  const [mySubmissions, setMySubmissions] = useState<VehicleListing[]>([]);
  const [myEnquiries, setMyEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const pub = await fetchPublishedListings();
      if (!active) return;
      setPublishedListings(pub);

      if (user) {
        try {
          const [subs, enqs] = await Promise.all([
            fetchSellerListings(user.uid),
            fetchBuyerEnquiries(user.uid),
          ]);
          if (!active) return;
          setMySubmissions(subs);
          setMyEnquiries(enqs);
        } catch (err) {
          console.warn('Customer dashboard sync warning:', err);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [user]);

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
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
          Member Account
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[#F5F5F3]">
          Sign in to Supercars.ng
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#B9BDC3]">
          Public browsing and enquiries never require an account. Sign in with Google to save vehicles, track private submissions, or access your dealership portal.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="mt-8 inline-flex h-12 items-center rounded-sm bg-[#F5F5F3] px-7 text-sm font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  const savedVehicles = publishedListings.filter((l) => savedListingIds.includes(l.id));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 border-b border-[#B9BDC3]/15 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
            Customer Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#F5F5F3]">
            {user.displayName || 'Supercars.ng Member'}
          </h1>
          <p className="mt-1 text-xs text-[#B9BDC3]">{user.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dealer/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-[#B9BDC3]/25 px-4 text-xs font-medium text-[#F5F5F3] hover:border-[#F5F5F3]"
          >
            <Building2 className="h-3.5 w-3.5" />
            Dealer Portal
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Control Centre
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-[#B9BDC3]/20 px-4 text-xs text-[#B9BDC3] hover:text-[#F5F5F3]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Saved Vehicles */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[#F5F5F3]">
          Saved Vehicles ({savedVehicles.length})
        </h2>
        {savedVehicles.length === 0 ? (
          <div className="mt-4 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6 text-sm text-[#B9BDC3]">
            You have not saved any vehicles yet.{' '}
            <Link to="/cars" className="text-[#F5F5F3] underline underline-offset-4">
              Explore the Marketplace
            </Link>
            .
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedVehicles.map((item) => (
              <VehicleCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </section>

      {/* Private Seller Submissions */}
      <section className="mt-14 border-t border-[#B9BDC3]/15 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#F5F5F3]">
            My Vehicle Submissions ({mySubmissions.length})
          </h2>
          <Link
            to="/sell"
            className="text-xs font-medium text-[#F5F5F3] underline underline-offset-4"
          >
            Submit New Vehicle
          </Link>
        </div>
        {mySubmissions.length === 0 ? (
          <p className="mt-4 text-sm text-[#B9BDC3]">No vehicle submissions under this account.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col justify-between gap-3 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-xs text-[#B9BDC3]">
                    {sub.sellerType === 'dealer' ? 'Dealer Listing' : 'Private Seller'} ·{' '}
                    {sub.city}, {sub.state}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#F5F5F3]">{sub.title}</h3>
                  {sub.moderationFeedback && (
                    <p className="mt-1 text-xs text-[#B9BDC3]">
                      Moderation note: {sub.moderationFeedback}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs">
                  <span className="block font-medium uppercase tracking-wider text-[#F5F5F3]">
                    {sub.listingStatus} / {sub.moderationStatus}
                  </span>
                  {sub.listingStatus === 'published' && (
                    <Link
                      to={`/cars/${sub.slug}`}
                      className="mt-1 inline-block text-[#B9BDC3] underline"
                    >
                      View Live Listing
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submitted Enquiries */}
      <section className="mt-14 border-t border-[#B9BDC3]/15 pt-10">
        <h2 className="text-2xl font-semibold text-[#F5F5F3]">
          My Enquiries ({myEnquiries.length})
        </h2>
        {myEnquiries.length === 0 ? (
          <p className="mt-4 text-sm text-[#B9BDC3]">No enquiries sent while signed in yet.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {myEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[#F5F5F3]">
                    {enq.listingTitle || 'Dealership Enquiry'}
                  </strong>
                  <span className="text-xs text-[#B9BDC3]">
                    Status: {enq.enquiryStatus} · {formatDateDisplay(enq.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#B9BDC3]">{enq.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
