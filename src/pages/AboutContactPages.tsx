import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitBuyerEnquiry } from '../services/marketplaceService';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl border-b border-[#B9BDC3]/15 pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
          About Supercars.ng
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#F5F5F3] sm:text-5xl">
          Nigeria’s Curated Automotive Destination
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#B9BDC3]">
          Supercars.ng combines the authority of a luxury automotive publication with the precision of a specialised vehicle marketplace across Lagos, Abuja, and Nigeria.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7">
          <h2 className="text-2xl font-semibold text-[#F5F5F3]">Product Principles</h2>
          <ul className="mt-5 space-y-4 text-sm text-[#B9BDC3]">
            <li>
              <strong className="text-[#F5F5F3]">Exclusivity:</strong> Quality, presentation, and verified provenance take precedence over raw listing volume.
            </li>
            <li>
              <strong className="text-[#F5F5F3]">Evidence-Based Trust:</strong> Every verification badge reflects specific, auditable checks recorded by our moderation desk.
            </li>
            <li>
              <strong className="text-[#F5F5F3]">Direct Connections:</strong> Supercars.ng does not hold buyer funds, operate escrow, or take inventory ownership—buyers and sellers coordinate inspections and transactions directly.
            </li>
            <li>
              <strong className="text-[#F5F5F3]">Transparent Pricing:</strong> Asking prices default to NGN and distinguish fixed, negotiable, and on-request terms without fabricated market valuations.
            </li>
          </ul>
        </div>

        <div className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7">
          <h2 className="text-2xl font-semibold text-[#F5F5F3]">Photography &amp; Verification Standards</h2>
          <ul className="mt-5 space-y-4 text-sm text-[#B9BDC3]">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F5F5F3]" />
              <span>Front three-quarter, rear three-quarter, side profile, cabin, and engine detail coverage.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F5F5F3]" />
              <span>Dealership CAC &amp; showroom premises documents held in private access-controlled records—never exposed publicly.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F5F5F3]" />
              <span>Every dealer and private seller submission enters administrative moderation prior to public listing.</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/cars"
              className="inline-flex h-11 items-center rounded-sm bg-[#F5F5F3] px-5 text-xs font-semibold text-[#0A0A0B]"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/sell"
              className="inline-flex h-11 items-center rounded-sm border border-[#B9BDC3]/30 px-5 text-xs font-semibold text-[#F5F5F3]"
            >
              Submit a Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [topic, setTopic] = useState('Concierge Sourcing Request');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitBuyerEnquiry({
      sellerId: 'curated_system',
      listingTitle: topic,
      buyerUid: user?.uid || '',
      buyerName: name,
      buyerPhone: phone,
      buyerEmail: email,
      message: `[${topic}] ${message}`,
      preferredContact: 'email',
    });
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B9BDC3]">
            Contact &amp; Concierge
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#F5F5F3]">
            Speak with the Supercars.ng Desk
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#B9BDC3]">
            Reach our Lagos and Abuja team for bespoke vehicle sourcing, dealership onboarding support, editorial partnerships, or verification enquiries.
          </p>

          <div className="mt-8 space-y-4 border-t border-[#B9BDC3]/15 pt-6 text-sm text-[#B9BDC3]">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#F5F5F3]">Lagos Desk</p>
              <p className="mt-1">Victoria Island &amp; Ikoyi Coverage</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#F5F5F3]">Abuja Desk</p>
              <p className="mt-1">Maitama &amp; Wuse II Coverage</p>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-[#B9BDC3]/15 bg-[#17191C] p-7 lg:col-span-7">
          {sent ? (
            <div className="py-8">
              <div className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F3]">
                <CheckCircle2 className="h-5 w-5" />
                Message Received
              </div>
              <p className="mt-2 text-sm text-[#B9BDC3]">
                Our concierge and editorial desk has logged your enquiry and will respond shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#B9BDC3]">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
                >
                  <option value="Concierge Sourcing Request">Concierge Sourcing Request</option>
                  <option value="Dealership Onboarding">Dealership Onboarding</option>
                  <option value="Sponsored Editorial & Brand Partnerships">Sponsored Editorial &amp; Brand Partnerships</option>
                  <option value="Inspection Partner Inquiry">Inspection Partner Inquiry</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone / WhatsApp"
                  className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
                />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-11 w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] px-3.5 text-sm text-[#F5F5F3]"
              />
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you?"
                className="w-full rounded-sm border border-[#B9BDC3]/20 bg-[#0A0A0B] p-3.5 text-sm text-[#F5F5F3]"
              />
              <button
                type="submit"
                className="h-11 w-full rounded-sm bg-[#F5F5F3] text-xs font-semibold text-[#0A0A0B] hover:bg-[#B9BDC3]"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
