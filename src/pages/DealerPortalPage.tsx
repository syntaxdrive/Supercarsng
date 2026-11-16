import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, FileText, Plus, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatAskingPrice, formatDateDisplay, slugify } from '../lib/format';
import {
  fetchOwnerDealer,
  fetchOwnerDealerDocuments,
  fetchSellerEnquiries,
  fetchSellerListings,
  registerDealerApplication,
  submitDealerSupportingDoc,
  submitVehicleListingForModeration,
  updateEnquiryPipelineStatus,
  updateSellerListingDetails,
} from '../services/marketplaceService';
import type {
  AvailabilityStatus,
  Dealer,
  DealerDocument,
  Enquiry,
  PriceType,
  VehicleCategory,
  VehicleCondition,
  VehicleListing,
} from '../types/supercars';

const PHOTO_PRESETS = [
  { label: 'Porsche 911 GT3 Dusk', url: '/src/assets/images/hero_lagos_supercar_1794813252054.jpg' },
  { label: 'Mercedes-AMG G 63 Obsidian', url: '/src/assets/images/listing_g63_obsidian_1794813252119.jpg' },
  { label: 'Rolls-Royce Ghost Extended', url: '/src/assets/images/listing_rolls_royce_ghost_1794813252731.jpg' },
  { label: 'Ferrari 296 GTB Gallery', url: '/src/assets/images/listing_ferrari_296_gtb_1794813253340.jpg' },
  { label: 'Range Rover SV LWB', url: '/src/assets/images/listing_range_rover_sv_1794813253551.jpg' },
  { label: 'Bespoke Ivory Cockpit', url: '/src/assets/images/journal_cockpit_showroom_1794813253671.jpg' },
];

export function DealerPortalPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [docs, setDocs] = useState<DealerDocument[]>([]);
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'submit' | 'enquiries' | 'documents'>('inventory');

  // Dealer registration form
  const [businessName, setBusinessName] = useState('');
  const [regDesc, setRegDesc] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regWebsite, setRegWebsite] = useState('');
  const [regState, setRegState] = useState('Lagos');
  const [regCity, setRegCity] = useState('Victoria Island');
  const [regAddress, setRegAddress] = useState('');
  const [docType, setDocType] = useState<'cac_certificate' | 'showroom_proof' | 'director_id' | 'import_permit'>('cac_certificate');
  const [docRef, setDocRef] = useState('');

  // New listing form
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('Luxury SUVs');
  const [year, setYear] = useState('2024');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('fixed');
  const [mileageKm, setMileageKm] = useState('1000');
  const [condition, setCondition] = useState<VehicleCondition>('foreign_used');
  const [bodyType, setBodyType] = useState('SUV');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [photoUrl, setPhotoUrl] = useState(PHOTO_PRESETS[1].url);
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Additional doc form
  const [extraDocType, setExtraDocType] = useState<'cac_certificate' | 'showroom_proof' | 'director_id' | 'import_permit'>('showroom_proof');
  const [extraDocRef, setExtraDocRef] = useState('');
  const [extraDocNotes, setExtraDocNotes] = useState('');

  const loadPortalData = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const [d, dDocs, dListings, dEnqs] = await Promise.all([
        fetchOwnerDealer(user.uid),
        fetchOwnerDealerDocuments(user.uid),
        fetchSellerListings(user.uid),
        fetchSellerEnquiries(user.uid),
      ]);
      setDealer(d);
      setDocs(dDocs);
      setListings(dListings);
      setEnquiries(dEnqs);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPortalData();
  }, [loadPortalData]);

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
          Dealership Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[#F5F5F3]">
          Dealer Onboarding &amp; Inventory Management
        </h1>
        <p className="mt-3 text-sm text-[#B9BDC3]">
          Sign in with Google to register your showroom, upload verification documents, and manage vehicle submissions.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="mt-8 inline-flex h-12 items-center rounded-sm bg-[#F5F5F3] px-7 text-sm font-semibold text-[#0A0A0B]"
        >
          Sign in to Dealer Portal
        </button>
      </div>
    );
  }

  const handleRegisterDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerDealerApplication({
      ownerId: user.uid,
      businessName,
      description: regDesc,
      phone: regPhone,
      whatsapp: regWhatsapp,
      website: regWebsite,
      state: regState,
      city: regCity,
      address: regAddress,
      documentType: docType,
      documentReference: docRef,
    });
    setNotice('Dealership application and private verification document submitted for Supercars.ng review.');
    await loadPortalData();
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;
    await submitVehicleListingForModeration({
      sellerId: user.uid,
      dealerId: dealer.id,
      sellerType: 'dealer',
      sellerName: dealer.businessName,
      sellerWhatsapp: dealer.whatsapp || dealer.phone || '',
      make: make.trim(),
      makeSlug: slugify(make),
      model: model.trim(),
      modelSlug: slugify(model),
      category,
      title: title.trim() || `${year} ${make.trim()} ${model.trim()}`,
      year: Number(year),
      price: priceType === 'price_on_request' ? 0 : Number(price || 0),
      currency: 'NGN',
      priceType,
      mileageKm: Number(mileageKm || 0),
      condition,
      bodyType,
      transmission,
      fuelType,
      description: description.trim(),
      state: dealer.state,
      city: dealer.city,
      imageUrls: [photoUrl],
    });
    setMake('');
    setModel('');
    setTitle('');
    setPrice('');
    setDescription('');
    setNotice('Listing submitted into moderation queue. It will go live upon administrator approval.');
    setActiveTab('inventory');
    await loadPortalData();
  };

  const handleQuickUpdateListing = async (
    listing: VehicleListing,
    availabilityStatus: AvailabilityStatus,
    newPrice?: number
  ) => {
    await updateSellerListingDetails(listing.id, {
      title: listing.title,
      price: typeof newPrice === 'number' ? newPrice : listing.price,
      priceType: listing.priceType,
      availabilityStatus,
      mileageKm: listing.mileageKm,
      description: listing.description,
      resubmit: listing.moderationStatus === 'revision_required',
    });
    setNotice(`Updated ${listing.title}.`);
    await loadPortalData();
  };

  const handleExtraDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;
    await submitDealerSupportingDoc({
      dealerId: dealer.id,
      ownerId: user.uid,
      documentType: extraDocType,
      referenceCode: extraDocRef,
      notes: extraDocNotes,
    });
    setExtraDocRef('');
    setExtraDocNotes('');
    setNotice('Supporting verification document recorded in private storage.');
    await loadPortalData();
  };

  if (fetching) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16">
        <div className="h-64 animate-pulse rounded-sm bg-[#17191C]" />
      </div>
    );
  }

  // Dealer Registration View
  if (!dealer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="border-b border-[#B9BDC3]/15 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
            Dealership Onboarding
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#F5F5F3]">
            Register Your Dealership
          </h1>
          <p className="mt-2 text-sm text-[#B9BDC3]">
            Provide showroom details and private CAC / business verification references. Supporting documents are visible only to you and Supercars.ng administrators.
          </p>
        </div>

        <form onSubmit={handleRegisterDealer} className="mt-8 space-y-5 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7">
          <div>
            <label className="mb-1.5 block text-xs text-[#B9BDC3]">Registered Business Name *</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Ikoyi Motor Atelier Ltd"
              className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">State *</label>
              <select
                value={regState}
                onChange={(e) => setRegState(e.target.value)}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              >
                <option value="Lagos">Lagos</option>
                <option value="FCT Abuja">FCT Abuja</option>
                <option value="Rivers">Rivers</option>
                <option value="Ogun">Ogun</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">City / District *</label>
              <input
                type="text"
                required
                value={regCity}
                onChange={(e) => setRegCity(e.target.value)}
                placeholder="Victoria Island / Ikoyi / Maitama"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#B9BDC3]">Showroom Street Address *</label>
            <input
              type="text"
              required
              value={regAddress}
              onChange={(e) => setRegAddress(e.target.value)}
              placeholder="Street address"
              className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="tel"
              required
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="Showroom Phone *"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
            <input
              type="tel"
              required
              value={regWhatsapp}
              onChange={(e) => setRegWhatsapp(e.target.value)}
              placeholder="WhatsApp Number *"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
            <input
              type="url"
              value={regWebsite}
              onChange={(e) => setRegWebsite(e.target.value)}
              placeholder="Website (optional)"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#B9BDC3]">Dealership Profile Description (min 10 chars) *</label>
            <textarea
              required
              minLength={10}
              rows={3}
              value={regDesc}
              onChange={(e) => setRegDesc(e.target.value)}
              placeholder="Specialties, marques handled, and inspection standards..."
              className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3.5 text-sm text-[#F5F5F3]"
            />
          </div>

          <div className="border-t border-[#B9BDC3]/15 pt-5">
            <h2 className="text-base font-semibold text-[#F5F5F3]">
              Private Verification Document Reference
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as typeof docType)}
                className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              >
                <option value="cac_certificate">CAC Registration Certificate (RC / BN)</option>
                <option value="showroom_proof">Showroom Lease / Utility Proof</option>
                <option value="director_id">Director Government ID</option>
                <option value="import_permit">Import / Dealership Permit</option>
              </select>
              <input
                type="text"
                required
                value={docRef}
                onChange={(e) => setDocRef(e.target.value)}
                placeholder="Document Reference / RC Number *"
                className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-sm bg-[#F5F5F3] text-sm font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
          >
            Submit Dealership Application
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 border-b border-[#B9BDC3]/15 pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3 text-xs text-[#B9BDC3]">
            <span>Dealer Portal</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-[#F5F5F3]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Status: {dealer.verificationStatus.toUpperCase()}
            </span>
          </div>
          <h1 className="mt-2 text-4xl font-semibold text-[#F5F5F3]">{dealer.businessName}</h1>
          <p className="mt-1 text-xs text-[#B9BDC3]">
            {dealer.city}, {dealer.state} · {listings.length} total listings · {enquiries.length} buyer enquiries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-1">
          {(['inventory', 'submit', 'enquiries', 'documents'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-9 rounded-sm px-3.5 text-xs font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-[#F5F5F3] text-[#0A0A0B]' : 'text-[#B9BDC3] hover:text-[#F5F5F3]'
              }`}
            >
              {tab === 'submit' ? '+ Submit Listing' : tab}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="mt-6 flex items-center justify-between rounded-sm border border-[#F5F5F3]/25 bg-[#17191C] px-4 py-3 text-xs text-[#F5F5F3]">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {notice}
          </span>
          <button type="button" onClick={() => setNotice(null)} className="text-[#B9BDC3] hover:text-[#F5F5F3]">
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'inventory' && (
        <section className="mt-8 space-y-4">
          {listings.length === 0 ? (
            <div className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-8 text-center">
              <p className="text-sm text-[#B9BDC3]">No dealer vehicle listings submitted yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B]"
              >
                <Plus className="h-4 w-4" />
                Submit First Vehicle
              </button>
            </div>
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 lg:flex-row lg:items-center"
              >
                <div>
                  <p className="text-xs text-[#B9BDC3]">
                    {item.make} {item.model} · Status:{' '}
                    <strong className="text-[#F5F5F3]">{item.listingStatus}</strong> · Moderation:{' '}
                    <strong className="text-[#F5F5F3]">{item.moderationStatus}</strong>
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#F5F5F3]">{item.title}</h2>
                  <p className="mt-1 font-mono text-xs text-[#B9BDC3] tabular-nums">
                    {formatAskingPrice(item.price, item.currency, item.priceType)}
                  </p>
                  {item.moderationFeedback && (
                    <p className="mt-2 text-xs text-[#F5F5F3]">
                      Moderator note: {item.moderationFeedback}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={item.availabilityStatus}
                    onChange={(e) =>
                      void handleQuickUpdateListing(item, e.target.value as AvailabilityStatus)
                    }
                    aria-label="Update availability"
                    className="h-10 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  {item.listingStatus === 'published' && (
                    <Link
                      to={`/cars/${item.slug}`}
                      className="inline-flex h-10 items-center rounded-sm border border-[#B9BDC3]/25 px-3.5 text-xs text-[#F5F5F3]"
                    >
                      View Live
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'submit' && (
        <form onSubmit={handleSubmitListing} className="mt-8 grid grid-cols-1 gap-4 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">Submit Vehicle to Moderation</h2>
            <p className="mt-1 text-xs text-[#B9BDC3]">
              All dealer submissions require administrator approval before public visibility.
            </p>
          </div>
          <input
            type="text"
            required
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Manufacturer (e.g. Porsche) *"
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          />
          <input
            type="text"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Model (e.g. 911 GT3) *"
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          />
          <input
            type="text"
            required
            minLength={5}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Listing Title *"
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] md:col-span-2"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as VehicleCategory)}
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          >
            <option value="Exotic">Exotic</option>
            <option value="Luxury">Luxury</option>
            <option value="Executive">Executive</option>
            <option value="Performance">Performance</option>
            <option value="Luxury SUVs">Luxury SUVs</option>
            <option value="Premium sedans">Premium sedans</option>
          </select>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as VehicleCondition)}
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          >
            <option value="brand_new">Brand New</option>
            <option value="foreign_used">Foreign Used</option>
            <option value="nigeria_used">Nigerian Used</option>
          </select>
          <input
            type="number"
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          />
          <input
            type="number"
            required
            value={mileageKm}
            onChange={(e) => setMileageKm(e.target.value)}
            placeholder="Mileage (km)"
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          />
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as PriceType)}
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
          >
            <option value="fixed">Fixed Price (NGN)</option>
            <option value="negotiable">Negotiable (NGN)</option>
            <option value="price_on_request">Price on Request</option>
          </select>
          <input
            type="number"
            disabled={priceType === 'price_on_request'}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Asking Price (NGN)"
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] disabled:opacity-50"
          />
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <input
              type="text"
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              placeholder="Body Type"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            />
            <input
              type="text"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              placeholder="Transmission"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            />
            <input
              type="text"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              placeholder="Fuel Type"
              className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            />
          </div>
          <select
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] md:col-span-2"
          >
            {PHOTO_PRESETS.map((p) => (
              <option key={p.url} value={p.url}>
                {p.label}
              </option>
            ))}
          </select>
          <textarea
            required
            minLength={20}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed vehicle specification, options, and customs clearance summary..."
            className="rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3.5 text-sm text-[#F5F5F3] md:col-span-2"
          />
          <button
            type="submit"
            className="h-12 rounded-sm bg-[#F5F5F3] text-sm font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3] md:col-span-2"
          >
            Submit Listing for Approval
          </button>
        </form>
      )}

      {activeTab === 'enquiries' && (
        <section className="mt-8 space-y-4">
          {enquiries.length === 0 ? (
            <p className="text-sm text-[#B9BDC3]">No buyer enquiries received yet.</p>
          ) : (
            enquiries.map((enq) => (
              <div
                key={enq.id}
                className="flex flex-col justify-between gap-4 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-xs text-[#B9BDC3]">
                    {enq.listingTitle || 'General Showroom Enquiry'} · {formatDateDisplay(enq.createdAt)}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#F5F5F3]">
                    {enq.buyerName} · {enq.buyerPhone} · {enq.buyerEmail}
                  </h3>
                  <p className="mt-2 text-xs text-[#B9BDC3]">{enq.message}</p>
                </div>
                <select
                  value={enq.enquiryStatus}
                  onChange={(e) =>
                    void updateEnquiryPipelineStatus(
                      enq.id,
                      e.target.value as Enquiry['enquiryStatus']
                    ).then(loadPortalData)
                  }
                  className="h-10 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'documents' && (
        <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              Submitted Private Verification Documents ({docs.length})
            </h2>
            {docs.map((docItem) => (
              <div
                key={docItem.id}
                className="flex items-center justify-between rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#B9BDC3]" />
                  <div>
                    <p className="font-semibold text-[#F5F5F3]">{docItem.documentType}</p>
                    <p className="font-mono text-[#B9BDC3]">Ref: {docItem.referenceCode}</p>
                  </div>
                </div>
                <span className="uppercase text-[#F5F5F3]">{docItem.reviewStatus}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleExtraDoc} className="space-y-3 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6">
            <h3 className="text-lg font-semibold text-[#F5F5F3]">Upload Additional Document Reference</h3>
            <select
              value={extraDocType}
              onChange={(e) => setExtraDocType(e.target.value as typeof extraDocType)}
              className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            >
              <option value="showroom_proof">Showroom Lease / Address Proof</option>
              <option value="cac_certificate">CAC Certificate</option>
              <option value="director_id">Director ID</option>
              <option value="import_permit">Import / Customs Permit</option>
            </select>
            <input
              type="text"
              required
              value={extraDocRef}
              onChange={(e) => setExtraDocRef(e.target.value)}
              placeholder="Document Reference Number"
              className="h-10 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3 text-xs text-[#F5F5F3]"
            />
            <textarea
              rows={2}
              value={extraDocNotes}
              onChange={(e) => setExtraDocNotes(e.target.value)}
              placeholder="Optional verification notes"
              className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3 text-xs text-[#F5F5F3]"
            />
            <button
              type="submit"
              className="h-10 w-full rounded-sm bg-[#F5F5F3] text-xs font-semibold text-[#0A0A0B]"
            >
              Submit Private Document
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
