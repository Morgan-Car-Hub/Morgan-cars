import { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, MessageCircle } from 'lucide-react';
import { SELLER_CHANNELS } from '../data/cars';

type FaqCategory = 'All' | 'Inspections' | 'Warranty' | 'Documentation';

interface FaqItem {
  id: string;
  index: string;
  category: Exclude<FaqCategory, 'All'>;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-60-point',
    index: '01.',
    category: 'Inspections',
    question: 'What is covered in your 60-point pre-sale vehicle inspection?',
    answer:
      'Every pre-owned vehicle goes through a digital paint-thickness gauge reading on all body panels, an OBD-II diagnostic scan for engine and transmission fault history, underbody and suspension wear checks, plus verified tread depth and brake pad measurements. Brand-new arrivals undergo a full Pre-Delivery Inspection (PDI) before entering the showroom.',
  },
  {
    id: 'faq-third-party',
    index: '02.',
    category: 'Inspections',
    question: 'Can I request a live video inspection or bring an independent mechanic?',
    answer:
      'Yes. You can message us on WhatsApp or Telegram (@Morgancarhub) to request an unedited cold-start and under-hood walkaround video for any listing, or schedule an independent third-party pre-purchase inspection at our showroom prior to purchase.',
  },
  {
    id: 'faq-warranty-coverage',
    index: '03.',
    category: 'Warranty',
    question: 'What warranty coverage comes with brand-new and used cars?',
    answer:
      'All brand-new vehicles include their full factory manufacturer bumper-to-bumper and powertrain warranty from delivery. Certified pre-owned vehicles retain any active remaining manufacturer coverage and include a 90-day / 5,000 km dealer mechanical assurance covering engine, transmission, and drivetrain components.',
  },
  {
    id: 'faq-ev-battery',
    index: '04.',
    category: 'Warranty',
    question: 'How do you verify battery health on electric and hybrid models?',
    answer:
      'Every EV and hybrid—such as the Porsche Taycan GTS, Hyundai Ioniq 5, Toyota Land Cruiser Hybrid, and Lexus RX 350h—undergoes a high-voltage cell balance and State of Health (SoH) diagnostic. The verified battery health percentage and DC fast-charge controller status are documented in the vehicle condition report.',
  },
  {
    id: 'faq-documentation',
    index: '05.',
    category: 'Documentation',
    question: 'Which ownership, title, and service documents are provided at handover?',
    answer:
      'Each vehicle is delivered with a verified clean, lien-free title, itemized bill of sale, customs and import clearance certificates where applicable, documented service history logs, PDI or 60-point inspection sheet, and dual factory keys.',
  },
  {
    id: 'faq-handover-timeline',
    index: '06.',
    category: 'Documentation',
    question: 'How fast can paperwork, registration, and delivery be completed?',
    answer:
      'All showroom vehicles have verified paperwork ready upfront, allowing same-day collection once payment is confirmed. If you require out-of-city transport, we prepare the transfer packet immediately and coordinate insured enclosed or flatbed delivery.',
  },
];

interface VehicleFAQsProps {
  onAskQuestion: () => void;
}

export function VehicleFAQs({ onAskQuestion }: VehicleFAQsProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('All');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const visibleFaqs = useMemo(() => {
    if (activeCategory === 'All') return FAQ_ITEMS;
    return FAQ_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (category: FaqCategory) => {
    setActiveCategory(category);
    const firstMatch =
      category === 'All'
        ? FAQ_ITEMS[0]
        : FAQ_ITEMS.find((item) => item.category === category);
    setOpenId(firstMatch ? firstMatch.id : null);
  };

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faqs"
      aria-labelledby="faqs-heading"
      className="border-t border-black/10 bg-[#F8F7F4] py-16 lg:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Heading, Category Filter & Seller Help */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <p className="text-[13px] font-medium text-[#5C5E64] mb-2">
              Buyer Trust &amp; Transparency
            </p>
            <h2
              id="faqs-heading"
              className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-[#141416]"
              style={{ textWrap: 'balance' }}
            >
              Vehicle FAQs
            </h2>
            <p className="text-sm text-[#5C5E64] mt-3 leading-relaxed">
              Clear answers on how we inspect every vehicle, back brand-new and used stock with warranty coverage, and prepare title and handover documentation.
            </p>
          </div>

          {/* Topic Filter Segmented Control */}
          <div
            role="group"
            aria-label="Filter FAQs by topic"
            className="flex flex-wrap gap-1.5 p-1 bg-[#ECEAE4] rounded-lg"
          >
            {(['All', 'Inspections', 'Warranty', 'Documentation'] as FaqCategory[]).map(
              (category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-[#5C5E64] hover:text-[#141416]'
                    }`}
                  >
                    {category === 'All' ? 'All Topics' : category}
                  </button>
                );
              }
            )}
          </div>

          {/* Direct Support Card */}
          <div className="bg-white border border-black/10 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[#141416]">
                Need a specific vehicle report?
              </h3>
              <p className="text-xs text-[#5C5E64] mt-1 leading-relaxed">
                Ask for a VIN check, service log copy, or live walkaround before visiting.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={SELLER_CHANNELS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Seller
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
              <button
                type="button"
                onClick={onAskQuestion}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-[#141416] bg-[#F3F1EC] hover:bg-[#E5E2DA] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Accessible Accordion List */}
        <div className="lg:col-span-8 bg-white border border-black/10 rounded-xl divide-y divide-black/8">
          {visibleFaqs.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `${item.id}-panel`;
            const buttonId = `${item.id}-button`;

            return (
              <div key={item.id}>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-[#F8F7F4]/60 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C8321E]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#5C5E64]">
                      <span className="font-mono tabular-nums font-medium text-[#C8321E]">
                        {item.index}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                    </div>
                    <span className="block font-display text-base lg:text-lg font-semibold text-[#141416] leading-snug">
                      {item.question}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-[#5C5E64] shrink-0 mt-1 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#141416]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-6 pt-0 text-sm text-[#5C5E64] leading-relaxed max-w-3xl"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
