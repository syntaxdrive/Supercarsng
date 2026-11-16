import React, { useState } from 'react';
import { Building2, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { slugify } from '../lib/format';
import { submitVehicleListingForModeration } from '../services/marketplaceService';
import type { PriceType, VehicleCategory, VehicleCondition } from '../types/supercars';

const PRESET_PHOTOS = [
  {
    label: 'Porsche / Sports Coupe',
    url: '/src/assets/images/hero_lagos_supercar_1794813252054.jpg',
  },
  {
    label: 'Mercedes-AMG G 63 / SUV',
    url: '/src/assets/images/listing_g63_obsidian_1794813252119.jpg',
  },
  {
    label: 'Rolls-Royce / Luxury Sedan',
    url: '/src/assets/images/listing_rolls_royce_ghost_1794813252731.jpg',
  },
  {
    label: 'Ferrari / Exotic Berlinetta',
    url: '/src/assets/images/listing_ferrari_296_gtb_1794813253340.jpg',
  },
  {
    label: 'Range Rover SV / Luxury SUV',
    url: '/src/assets/images/listing_range_rover_sv_1794813253551.jpg',
  },
  {
    label: 'Bespoke Cabin Interior',
    url: '/src/assets/images/journal_cockpit_showroom_1794813253671.jpg',
  },
];

export function SellPage() {
  const { user, signInWithGoogle } = useAuth();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [category, setCategory] = useState<VehicleCategory>('Luxury SUVs');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('negotiable');
  const [mileageKm, setMileageKm] = useState('');
  const [condition, setCondition] = useState<VehicleCondition>('foreign_used');
  const [bodyType, setBodyType] = useState('SUV');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Victoria Island');
  const [whatsapp, setWhatsapp] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_PHOTOS[1].url);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePrivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitVehicleListingForModeration({
        sellerId: user.uid,
        sellerType: 'private_seller',
        sellerName: user.displayName || 'Private Collector',
        sellerWhatsapp: whatsapp,
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
        state,
        city,
        imageUrls: [photoUrl],
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#B9BDC3]/15 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
          Hybrid Inventory Intake
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[#F5F5F3]">
          Submit an Exceptional Automobile
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#B9BDC3]">
          All private seller and dealership submissions undergo editorial and verification review before appearing publicly on Supercars.ng.
        </p>
      </div>

      {/* Two Seller Paths */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-sm border border-[#F5F5F3]/35 bg-[#17191C] p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#F5F5F3]">
            <UserCheck className="h-4 w-4" />
            Private Collector Path
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F3]">
            Private Seller Listing
          </h2>
          <p className="mt-2 text-sm text-[#B9BDC3]">
            For individual owners selling a single verified exotic, luxury, or executive automobile in Nigeria. Complete the submission form below.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B9BDC3]">
              <Building2 className="h-4 w-4" />
              Commercial Dealerships
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F3]">
              Dealership Onboarding &amp; Portal
            </h2>
            <p className="mt-2 text-sm text-[#B9BDC3]">
              Licensed dealerships in Lagos, Abuja, and nationwide can register showroom credentials, upload CAC documentation, and manage multi-vehicle inventory.
            </p>
          </div>
          <Link
            to="/dealer/dashboard"
            className="mt-5 inline-flex h-11 w-fit items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
          >
            Open Dealer Portal
          </Link>
        </div>
      </div>

      {/* Private Seller Submission Form */}
      <div className="mt-10 rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7">
        <div className="flex flex-col justify-between gap-4 border-b border-[#B9BDC3]/15 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[#F5F5F3]">
              Private Seller Vehicle Submission
            </h2>
            <p className="mt-1 text-xs text-[#B9BDC3]">
              Submissions enter the moderation queue; they do not publish automatically.
            </p>
          </div>
          {!user && (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="inline-flex h-10 items-center rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B]"
            >
              Sign in with Google to Submit
            </button>
          )}
        </div>

        {submittedId ? (
          <div className="mt-6 rounded-sm border border-[#F5F5F3]/25 bg-[#0A0A0B] p-6">
            <div className="flex items-center gap-2 text-base font-semibold text-[#F5F5F3]">
              <CheckCircle2 className="h-5 w-5" />
              Listing Submitted for Moderation
            </div>
            <p className="mt-2 text-sm text-[#B9BDC3]">
              Your submission reference is <span className="font-mono text-[#F5F5F3]">{submittedId}</span>. Our moderation desk will verify vehicle identity and provenance before publishing.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold text-[#0A0A0B]"
              >
                Track in Customer Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedId(null)}
                className="inline-flex h-10 items-center rounded-sm border border-[#B9BDC3]/30 px-4 text-xs text-[#F5F5F3]"
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePrivateSubmit} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Manufacturer *</label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Porsche, Mercedes-Benz, Ferrari"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Model *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. 911 GT3, AMG G 63"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Listing Headline *</label>
              <input
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2023 Mercedes-AMG G 63 · Single Owner · Full Duty"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              >
                <option value="Exotic">Exotic</option>
                <option value="Luxury">Luxury</option>
                <option value="Executive">Executive</option>
                <option value="Performance">Performance</option>
                <option value="Luxury SUVs">Luxury SUVs</option>
                <option value="Premium sedans">Premium sedans</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as VehicleCondition)}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              >
                <option value="brand_new">Brand New</option>
                <option value="foreign_used">Foreign Used</option>
                <option value="nigeria_used">Nigerian Used</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Model Year *</label>
              <input
                type="number"
                required
                min={1980}
                max={2027}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Mileage (km) *</label>
              <input
                type="number"
                required
                min={0}
                value={mileageKm}
                onChange={(e) => setMileageKm(e.target.value)}
                placeholder="e.g. 4200"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Pricing Structure *</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as PriceType)}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              >
                <option value="negotiable">Negotiable (NGN)</option>
                <option value="fixed">Fixed Price (NGN)</option>
                <option value="price_on_request">Price on Request</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Asking Price (NGN)</label>
              <input
                type="number"
                min={0}
                disabled={priceType === 'price_on_request'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={priceType === 'price_on_request' ? 'Hidden (On Request)' : 'e.g. 320000000'}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              >
                <option value="Lagos">Lagos</option>
                <option value="FCT Abuja">FCT Abuja</option>
                <option value="Rivers">Rivers</option>
                <option value="Ogun">Ogun</option>
                <option value="Enugu">Enugu</option>
                <option value="Kano">Kano</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">City / District *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Ikoyi, Victoria Island, Maitama"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Body Type / Transmission / Fuel</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  placeholder="SUV"
                  className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-2.5 text-xs text-[#F5F5F3]"
                />
                <input
                  type="text"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  placeholder="Automatic"
                  className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-2.5 text-xs text-[#F5F5F3]"
                />
                <input
                  type="text"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  placeholder="Petrol"
                  className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-2.5 text-xs text-[#F5F5F3]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">WhatsApp Contact Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+234 800 000 0000"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">Primary Vehicle Photograph Preset or URL *</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
                >
                  {PRESET_PHOTOS.map((p) => (
                    <option key={p.url} value={p.url}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="/src/assets/images/..."
                  className="h-11 rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-xs text-[#F5F5F3]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-[#B9BDC3]">
                Vehicle History, Customs Provenance &amp; Options (min 20 characters) *
              </label>
              <textarea
                required
                minLength={20}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe specification highlights, service history, customs duty clearance status, and inspection location..."
                className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3.5 text-sm text-[#F5F5F3]"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-400 md:col-span-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center rounded-sm bg-[#F5F5F3] px-7 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#B9BDC3] disabled:opacity-60"
              >
                {user
                  ? submitting
                    ? 'Submitting to Moderation...'
                    : 'Submit Vehicle for Review'
                  : 'Sign in with Google & Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
