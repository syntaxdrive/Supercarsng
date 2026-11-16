import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Globe, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ResilientImage } from '../components/vehicles/ResilientImage';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { buildWhatsappUrl } from '../lib/format';
import {
  fetchPublishedListings,
  fetchVerifiedDealers,
  submitBuyerEnquiry,
} from '../services/marketplaceService';
import type { Dealer, VehicleListing } from '../types/supercars';

export function DealerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [buyerName, setBuyerName] = useState(user?.displayName || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

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
  }, [slug]);

  const dealer = useMemo(() => dealers.find((d) => d.slug === slug), [dealers, slug]);
  const dealerInventory = useMemo(
    () => (dealer ? listings.filter((l) => l.dealerId === dealer.id) : []),
    [dealer, listings]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-sm bg-[#17191C]" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-[#F5F5F3]">Dealership not found</h1>
        <Link
          to="/dealers"
          className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
        >
          Back to Dealership Directory
        </Link>
      </div>
    );
  }

  const whatsappUrl = buildWhatsappUrl(
    dealer.whatsapp,
    `Hello ${dealer.businessName}, I am reaching out via Supercars.ng.`
  );

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitBuyerEnquiry({
      dealerId: dealer.id,
      sellerId: dealer.ownerId,
      buyerUid: user?.uid || '',
      buyerName,
      buyerPhone,
      buyerEmail,
      message,
      preferredContact: 'whatsapp',
    });
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/dealers"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#B9BDC3] hover:text-[#F5F5F3]"
      >
        <ArrowLeft className="h-4 w-4" />
        All Dealerships
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] lg:grid-cols-12">
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#0A0A0B] lg:col-span-6 lg:aspect-auto">
          <ResilientImage
            src={dealer.coverImageUrl}
            alt={dealer.businessName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between p-7 lg:col-span-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-[#B9BDC3]">
              <span className="inline-flex items-center gap-1 text-[#F5F5F3]">
                <ShieldCheck className="h-4 w-4" />
                Verified Dealership
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {dealer.city}, {dealer.state}
              </span>
            </div>

            <h1 className="mt-3 text-4xl font-semibold text-[#F5F5F3]">{dealer.businessName}</h1>
            <p className="mt-4 text-sm leading-relaxed text-[#B9BDC3]">{dealer.description}</p>

            <div className="mt-6 space-y-2 border-t border-[#B9BDC3]/15 pt-4 text-xs text-[#B9BDC3]">
              {dealer.address && <p>Showroom: {dealer.address}</p>}
              {dealer.phone && (
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {dealer.phone}
                </p>
              )}
              {dealer.website && (
                <p>
                  <a
                    href={dealer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[#F5F5F3] underline underline-offset-4"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {dealer.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
            >
              <MessageCircle className="h-4 w-4" />
              Message Showroom on WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Active Inventory */}
      <section className="mt-14">
        <div className="border-b border-[#B9BDC3]/15 pb-4">
          <h2 className="text-2xl font-semibold text-[#F5F5F3]">
            Active Showroom Inventory ({dealerInventory.length})
          </h2>
        </div>

        {dealerInventory.length === 0 ? (
          <p className="mt-6 text-sm text-[#B9BDC3]">
            No public vehicles currently listed under this showroom.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dealerInventory.map((item) => (
              <VehicleCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </section>

      {/* General Showroom Enquiry */}
      <section className="mt-16 max-w-xl rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6">
        <h2 className="text-xl font-semibold text-[#F5F5F3]">
          Contact {dealer.businessName}
        </h2>
        <p className="mt-1 text-xs text-[#B9BDC3]">
          Arrange a private showroom appointment or request bespoke sourcing.
        </p>

        {sent ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#F5F5F3]">
            <CheckCircle2 className="h-4 w-4" />
            Enquiry sent directly to {dealer.businessName}.
          </div>
        ) : (
          <form onSubmit={handleEnquiry} className="mt-4 space-y-3">
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Your full name"
              className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="Phone / WhatsApp"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
              <input
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="Email"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the showroom what model or appointment window you are seeking..."
              className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3.5 text-sm text-[#F5F5F3]"
            />
            <button
              type="submit"
              className="h-11 w-full rounded-sm bg-[#F5F5F3] text-xs font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
            >
              Send Showroom Enquiry
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
