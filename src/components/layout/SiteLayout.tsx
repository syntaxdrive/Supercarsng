import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const { user, isAdmin, signInWithGoogle } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handlePrimaryAction = async () => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm transition-colors duration-150 ${
      isActive
        ? 'text-[#F5F5F3] underline underline-offset-8 decoration-[#F5F5F3]/70'
        : 'text-[#B9BDC3] hover:text-[#F5F5F3]'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B] text-[#F5F5F3]">
      <header className="sticky top-0 z-40 border-b border-[#B9BDC3]/15 bg-[#0A0A0B]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="shrink-0 whitespace-nowrap text-base font-semibold tracking-[0.18em] text-[#F5F5F3]"
          >
            SUPERCARS.NG
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            <NavLink to="/cars" className={navLinkClass}>
              Marketplace
            </NavLink>
            <NavLink to="/dealers" className={navLinkClass}>
              Dealers
            </NavLink>
            <NavLink to="/discover" className={navLinkClass}>
              Discover
            </NavLink>
            <NavLink to="/journal" className={navLinkClass}>
              Journal
            </NavLink>
            <NavLink to="/sell" className={navLinkClass}>
              Sell
            </NavLink>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="hidden h-10 shrink-0 items-center justify-center rounded-sm bg-[#F5F5F3] px-4 text-xs font-semibold tracking-wide text-[#0A0A0B] transition-colors hover:bg-[#B9BDC3] md:inline-flex whitespace-nowrap"
            >
              {user ? 'Account' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#B9BDC3]/20 text-[#F5F5F3] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#B9BDC3]/15 bg-[#0A0A0B] px-4 py-5 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link
                to="/cars"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-[#F5F5F3]"
              >
                Marketplace
              </Link>
              <Link
                to="/dealers"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-[#F5F5F3]"
              >
                Dealers
              </Link>
              <Link
                to="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-[#F5F5F3]"
              >
                Discover
              </Link>
              <Link
                to="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-[#F5F5F3]"
              >
                Journal
              </Link>
              <Link
                to="/sell"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-[#F5F5F3]"
              >
                Sell
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handlePrimaryAction();
                }}
                className="mt-2 h-11 w-full rounded-sm bg-[#F5F5F3] px-4 text-sm font-semibold text-[#0A0A0B]"
              >
                {user ? 'Account' : 'Sign in'}
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#B9BDC3]/15 bg-[#0A0A0B] text-[#B9BDC3]">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold tracking-[0.18em] text-[#F5F5F3]">
                SUPERCARS.NG
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#B9BDC3]">
                The art of exceptional automobiles. Nigeria’s curated automotive marketplace,
                marque discovery catalogue, and editorial journal across Lagos, Abuja, and beyond.
              </p>
              <p className="mt-4 text-xs text-[#B9BDC3]/80">
                Direct buyer-to-seller connections. Verification records reflect completed checks only.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F3]">
                Marketplace
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/cars" className="hover:text-[#F5F5F3]">
                    All Vehicles
                  </Link>
                </li>
                <li>
                  <Link to="/cars?category=Exotic" className="hover:text-[#F5F5F3]">
                    Exotic
                  </Link>
                </li>
                <li>
                  <Link to="/cars?category=Luxury+SUVs" className="hover:text-[#F5F5F3]">
                    Luxury SUVs
                  </Link>
                </li>
                <li>
                  <Link to="/cars?category=Performance" className="hover:text-[#F5F5F3]">
                    Performance
                  </Link>
                </li>
                <li>
                  <Link to="/cars?category=Executive" className="hover:text-[#F5F5F3]">
                    Executive
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F3]">
                Discovery &amp; Journal
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/discover" className="hover:text-[#F5F5F3]">
                    Manufacturer Directory
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="hover:text-[#F5F5F3]">
                    Automotive Journal
                  </Link>
                </li>
                <li>
                  <Link to="/dealers" className="hover:text-[#F5F5F3]">
                    Verified Dealerships
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#F5F5F3]">
                    About Supercars.ng
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#F5F5F3]">
                    Contact &amp; Concierge
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F3]">
                Portals
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/sell" className="hover:text-[#F5F5F3]">
                    Submit a Vehicle
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#F5F5F3]">
                    Customer Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dealer/dashboard" className="hover:text-[#F5F5F3]">
                    Dealer Portal
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin" className="text-[#F5F5F3] hover:underline">
                      Administration
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#B9BDC3]/10 pt-6 text-xs text-[#B9BDC3]/70 sm:flex-row sm:items-center">
            <p>© 2026 Supercars.ng. All rights reserved.</p>
            <p>Lagos · Abuja · Nationwide Nigeria</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
