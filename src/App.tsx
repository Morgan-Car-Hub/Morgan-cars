/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { GitCompareArrows, Menu, X } from 'lucide-react';
import {
  CAR_INVENTORY,
  getCarMessagePreset,
  SELLER_CHANNELS,
  type CarListing,
} from './data/cars';
import { VideoAdBanner } from './components/VideoAdBanner';
import { VehicleCatalog } from './components/VehicleCatalog';
import { VehicleFAQs } from './components/VehicleFAQs';
import { TikTokReelsSection } from './components/TikTokReelsSection';
import { CustomerTestimonials } from './components/CustomerTestimonials';
import { PaymentSection } from './components/PaymentSection';
import { SellerContactSection } from './components/SellerContactSection';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { VehicleComparisonModal } from './components/VehicleComparisonModal';
import { PaystackCheckoutModal } from './components/PaystackCheckoutModal';

export default function App() {
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [inquiryCar, setInquiryCar] = useState<CarListing | null>(null);
  const [inquiryPresetMessage, setInquiryPresetMessage] = useState<string | null>(null);
  const [paystackCar, setPaystackCar] = useState<CarListing | null>(null);
  const [paystackOpen, setPaystackOpen] = useState(false);
  const [paystackReturnRef, setPaystackReturnRef] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('paystack_ref') || params.get('reference');
    if (ref && /^[A-Za-z0-9_-]{6,64}$/.test(ref)) {
      setPaystackReturnRef(ref);
      setPaystackOpen(true);
      params.delete('paystack_ref');
      params.delete('reference');
      params.delete('trxref');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  const compareCars = useMemo(() => {
    return compareIds
      .map((id) => CAR_INVENTORY.find((c) => c.id === id))
      .filter((c): c is CarListing => Boolean(c));
  }, [compareIds]);

  const handleToggleCompare = (car: CarListing) => {
    setCompareIds((prev) => {
      if (prev.includes(car.id)) {
        return prev.filter((id) => id !== car.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, car.id];
    });
  };

  const handleAddOrReplaceCompare = (carId: string, replaceIndex?: number) => {
    setCompareIds((prev) => {
      if (typeof replaceIndex === 'number' && replaceIndex >= 0 && replaceIndex < prev.length) {
        const next = [...prev];
        next[replaceIndex] = carId;
        return Array.from(new Set(next)).slice(0, 3);
      }
      if (prev.includes(carId) || prev.length >= 3) return prev;
      return [...prev, carId];
    });
  };

  const scrollToSection = (sectionId: string) => {
    setMobileNavOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendToContactForm = (car: CarListing, presetText?: string) => {
    setSelectedCar(null);
    setCompareOpen(false);
    setInquiryCar(car);
    setInquiryPresetMessage(presetText ?? getCarMessagePreset(car, 'availability'));
    window.setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  const handleOpenPaystack = (car: CarListing) => {
    setSelectedCar(null);
    setCompareOpen(false);
    setPaystackReturnRef(null);
    setPaystackCar(car);
    setPaystackOpen(true);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#141416]">
      {/* Top Bar Contract: 3 Zones (Wordmark — 5 Nav Links — 1 Primary CTA) */}
      <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-black/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-[#141416] whitespace-nowrap shrink-0"
          >
            Morgan Car Hub
          </a>

          {/* Zone 2: 5 Single-line Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5E64]"
          >
            <a
              href="#inventory"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Inventory
            </a>
            <a
              href="#faqs"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              FAQs
            </a>
            <a
              href="#reels"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              TikTok Reels
            </a>
            <a
              href="#testimonials"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Reviews
            </a>
            <a
              href="#payments"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Payments
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#141416] hover:bg-[#C8321E] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              Message Seller
            </button>

            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg border border-black/12 text-[#141416] bg-white cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#F8F7F4] border-b border-black/10 px-6 py-4 space-y-2">
            <a
              href="#inventory"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-[#141416]"
            >
              Inventory
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-[#141416]"
            >
              FAQs
            </a>
            <a
              href="#reels"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-[#141416]"
            >
              TikTok Reels
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-[#141416]"
            >
              Reviews
            </a>
            <a
              href="#payments"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-[#141416]"
            >
              Payments
            </a>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#C8321E] rounded-lg cursor-pointer"
            >
              Message Seller
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <VideoAdBanner
          onBrowseInventory={() => scrollToSection('inventory')}
          onInspectVehicle={(car) => setSelectedCar(car)}
          onContactSeller={() => scrollToSection('contact')}
        />

        <VehicleCatalog
          onSelectCar={(car) => setSelectedCar(car)}
          onMessageWithPreset={(car) => handleSendToContactForm(car)}
          compareIds={compareIds}
          onToggleCompare={handleToggleCompare}
          onOpenCompare={() => setCompareOpen(true)}
        />

        <VehicleFAQs onAskQuestion={() => scrollToSection('contact')} />

        <TikTokReelsSection onSelectCar={(car) => setSelectedCar(car)} />

        <CustomerTestimonials onSelectCar={(car) => setSelectedCar(car)} />

        <PaymentSection
          selectedCar={paystackCar ?? inquiryCar}
          onInspectCar={(car) => setSelectedCar(car)}
        />

        <SellerContactSection
          preselectedCar={inquiryCar}
          preselectedMessage={inquiryPresetMessage}
          onOpenPaystack={handleOpenPaystack}
        />
      </main>

      {/* Compact Comparison Dock (Appears only when 1–3 vehicles are selected) */}
      {compareCars.length > 0 && !compareOpen && (
        <div
          role="region"
          aria-label="Selected vehicles for comparison"
          className="sticky bottom-3 z-30 mx-auto max-w-[1440px] px-4 lg:px-12 pointer-events-none"
        >
          <div className="pointer-events-auto bg-[#141416] text-white border border-white/15 rounded-xl px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white whitespace-nowrap">
                <GitCompareArrows className="w-4 h-4 text-[#C8321E]" />
                Compare ({compareCars.length}/3):
              </span>
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                {compareCars.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded text-[11px] text-white"
                  >
                    <span className="truncate max-w-[150px]">
                      {c.year} {c.make} {c.model}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(c)}
                      aria-label={`Remove ${c.year} ${c.make} ${c.model}`}
                      className="text-white/70 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setCompareOpen(true)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-black/10 bg-[#F3F1EC] py-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#5C5E64]">
          <div>
            <span className="font-display text-sm font-semibold text-[#141416] block mb-1">
              Morgan Car Hub
            </span>
            <span>Brand-new &amp; inspected pre-owned modern vehicles.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href={SELLER_CHANNELS.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors"
            >
              TikTok ({SELLER_CHANNELS.tiktokHandle})
            </a>
            <a
              href={SELLER_CHANNELS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors"
            >
              Telegram ({SELLER_CHANNELS.telegramHandle})
            </a>
            <a
              href={SELLER_CHANNELS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#141416] hover:underline underline-offset-4 transition-colors"
            >
              WhatsApp Direct
            </a>
          </div>

          <span>&copy; 2026 Morgan Car Hub. All rights reserved.</span>
        </div>
      </footer>

      {/* Contiguous Vehicle Inspection & Contact Modal */}
      <VehicleDetailModal
        car={selectedCar}
        isCompared={Boolean(selectedCar && compareIds.includes(selectedCar.id))}
        onToggleCompare={handleToggleCompare}
        onClose={() => setSelectedCar(null)}
        onSendToContactForm={handleSendToContactForm}
        onOpenPaystack={handleOpenPaystack}
      />

      {/* Side-by-Side Vehicle Comparison Modal (Up to 3 Vehicles) */}
      <VehicleComparisonModal
        cars={compareCars}
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemoveCar={(carId) =>
          setCompareIds((prev) => prev.filter((id) => id !== carId))
        }
        onAddOrReplaceCar={handleAddOrReplaceCompare}
        onClearAll={() => setCompareIds([])}
        onInspectCar={(car) => {
          setCompareOpen(false);
          setSelectedCar(car);
        }}
        onMessageCar={(car) => handleSendToContactForm(car)}
        onPayCar={(car) => handleOpenPaystack(car)}
      />

      {/* Paystack Checkout Gateway Modal */}
      <PaystackCheckoutModal
        car={paystackCar}
        isOpen={paystackOpen}
        initialReference={paystackReturnRef}
        onClose={() => {
          setPaystackOpen(false);
          setPaystackReturnRef(null);
        }}
      />
    </div>
  );
}
