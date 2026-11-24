import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  Pause,
  Play,
  ShieldCheck,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CAR_INVENTORY,
  SELLER_CHANNELS,
  TIKTOK_REELS,
  type CarListing,
  type VehicleConditionType,
} from '../data/cars';
import { CarImage } from './CarImage';

interface TikTokReelsSectionProps {
  onSelectCar: (car: CarListing) => void;
}

type ReelConditionFilter = 'All' | VehicleConditionType;
type ReelSortOption = 'featured' | 'price-asc' | 'price-desc' | 'year-desc' | 'make-asc';

const REEL_BRANDS = Array.from(new Set(TIKTOK_REELS.map((r) => r.make))).sort((a, b) =>
  a.localeCompare(b)
);

const INSPECTION_POINTS = [
  {
    code: '01.',
    title: 'Paint & Chassis Thickness Check',
    detail:
      'Every used panel is measured digitally to verify original factory paint and accident-free geometry.',
  },
  {
    code: '02.',
    title: 'Engine, Battery & OBD Diagnostic',
    detail:
      'Full live telemetry scan on hybrid/EV battery state of health, turbo boost, and transmission shift logs.',
  },
  {
    code: '03.',
    title: 'Verified Mileage & Ownership Log',
    detail:
      'Service history, odometer consistency, and spare keys are confirmed prior to showroom listing.',
  },
];

export function TikTokReelsSection({ onSelectCar }: TikTokReelsSectionProps) {
  const [conditionFilter, setConditionFilter] = useState<ReelConditionFilter>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<ReelSortOption>('featured');
  const [playingReelId, setPlayingReelId] = useState<string | null>(TIKTOK_REELS[0].id);
  const [reelFrameTick, setReelFrameTick] = useState(0);

  useEffect(() => {
    if (!playingReelId) return;
    const timer = window.setInterval(() => {
      setReelFrameTick((tick) => tick + 1);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [playingReelId]);

  const filteredReels = useMemo(() => {
    const list = TIKTOK_REELS.filter((reel) => {
      if (conditionFilter !== 'All' && reel.conditionType !== conditionFilter) {
        return false;
      }
      if (brandFilter !== 'All' && reel.make !== brandFilter) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'year-desc') {
      return [...list].sort((a, b) => b.year - a.year || a.price - b.price);
    }
    if (sortBy === 'make-asc') {
      return [...list].sort((a, b) => a.make.localeCompare(b.make));
    }
    return list;
  }, [conditionFilter, brandFilter, sortBy]);

  const handleToggleReel = (reelId: string) => {
    setPlayingReelId((current) => (current === reelId ? null : reelId));
    setReelFrameTick(0);
  };

  return (
    <section
      id="reels"
      aria-labelledby="reels-heading"
      className="bg-[#141416] text-white py-16 lg:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
        {/* Section Header + Direct TikTok Profile Link */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/12">
          <div>
            <p className="text-[13px] font-medium text-[#E5E4E0]/75 mb-2">
              Video Walkarounds · {SELLER_CHANNELS.tiktokHandle}
            </p>
            <h2
              id="reels-heading"
              className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Showroom Reels &amp; TikTok Highlights
            </h2>
          </div>

          <a
            href={SELLER_CHANNELS.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            Watch All Videos on TikTok ({SELLER_CHANNELS.tiktokHandle})
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Video Filter & Sort Controls (Brand New vs. Used, Brand, Sort) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter showroom videos by condition"
            className="inline-flex items-center p-1 bg-[#1B1C20] border border-white/10 rounded-lg self-start"
          >
            {(['All', 'Brand New', 'Used'] as ReelConditionFilter[]).map((option) => {
              const active = conditionFilter === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setConditionFilter(option)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active ? 'bg-white text-[#141416]' : 'text-[#E5E4E0]/75 hover:text-white'
                  }`}
                >
                  {option === 'All' ? 'All Videos' : `${option} Videos`}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              aria-label="Filter videos by car brand"
              className="px-3.5 py-2.5 text-xs font-medium bg-[#1B1C20] border border-white/12 rounded-lg text-white focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="All">All Brands</option>
              {REEL_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <div className="relative flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5E4E0]/70 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ReelSortOption)}
                aria-label="Sort showroom videos"
                className="pl-9 pr-4 py-2.5 text-xs font-medium bg-[#1B1C20] border border-white/12 rounded-lg text-white focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="year-desc">Model Year: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="make-asc">Brand: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Video Walkaround Reels Grid */}
        {filteredReels.length === 0 ? (
          <div className="bg-[#1B1C20] border border-white/10 rounded-xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-white mb-2">
              No video walkarounds match your filter
            </p>
            <button
              type="button"
              onClick={() => {
                setConditionFilter('All');
                setBrandFilter('All');
                setSortBy('featured');
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold text-[#141416] bg-white rounded-lg cursor-pointer"
            >
              Show All Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredReels.map((reel) => {
              const isPlaying = playingReelId === reel.id;
              const showingInterior = isPlaying && reelFrameTick % 2 === 1;
              const activeSrc = showingInterior ? reel.interiorImage : reel.coverImage;
              const linkedCar =
                CAR_INVENTORY.find((car) => car.id === reel.carId) ?? CAR_INVENTORY[0];

              return (
                <div
                  key={reel.id}
                  className="bg-[#1B1C20] border border-white/10 rounded-xl overflow-hidden flex flex-col"
                >
                  {/* Video Preview Container (Cycles Exterior <-> Matching Interior while playing) */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0D0E11]">
                    <div
                      key={`${reel.id}-${showingInterior ? 'int' : 'ext'}`}
                      className="w-full h-full animate-reel-pan"
                      style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                    >
                      <CarImage
                        src={activeSrc}
                        alt={`${reel.featuredCar} — ${showingInterior ? 'Matching Interior' : 'Exterior'}`}
                        title={reel.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Measured contrast scrim */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#0D0E11] via-[#0D0E11]/30 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Top Duration + View State + Play Toggle */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="font-mono tabular-nums text-xs text-white bg-black/60 px-2.5 py-1 rounded">
                        {reel.duration} · {showingInterior ? 'Interior' : 'Exterior'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleReel(reel.id)}
                        aria-label={isPlaying ? `Pause ${reel.title}` : `Play ${reel.title}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-[#C8321E] text-white backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs text-[#E5E4E0]/85 mb-1">
                        {reel.conditionType} · {reel.featuredCar} ·{' '}
                        <span className="font-mono tabular-nums">${reel.price.toLocaleString()}</span>
                      </p>
                      <h3 className="font-display text-lg font-semibold text-white leading-snug">
                        {reel.title}
                      </h3>
                    </div>
                  </div>

                  {/* Reel Breakdown & Direct Links */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#E5E4E0]/80 leading-relaxed mb-3">
                        {reel.subtitle}
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#E5E4E0]/70">
                        {reel.highlights.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectCar(linkedCar)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-[#F4A499] transition-colors cursor-pointer"
                      >
                        Inspect Car
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={SELLER_CHANNELS.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#E5E4E0]/80 hover:text-white transition-colors"
                      >
                        Open TikTok
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inspection Standard Sub-Band */}
        <div
          id="inspection"
          className="pt-10 border-t border-white/12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#E5E4E0]/75 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#C8321E]" />
              <span>Transparent Vehicle Grading</span>
            </div>
            <h3 className="font-display text-2xl font-semibold text-white tracking-tight">
              Every Car Graded Before Listing
            </h3>
            <p className="text-sm text-[#E5E4E0]/75 mt-2 leading-relaxed">
              Whether you choose a delivery-mileage brand-new vehicle or a value-priced pre-owned model, we disclose full body, interior, and mechanical condition upfront.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {INSPECTION_POINTS.map((point) => (
              <div
                key={point.code}
                className="bg-[#1B1C20] border border-white/10 rounded-xl p-5"
              >
                <span className="font-mono text-xs text-[#C8321E] font-medium block mb-2">
                  {point.code}
                </span>
                <h4 className="font-display text-base font-semibold text-white mb-2">
                  {point.title}
                </h4>
                <p className="text-xs text-[#E5E4E0]/75 leading-relaxed">{point.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
