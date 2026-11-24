import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowUpRight } from 'lucide-react';
import {
  COMMERCIAL_SCENES,
  CAR_INVENTORY,
  type CarListing,
  type VehicleConditionType,
} from '../data/cars';
import { CarImage } from './CarImage';

interface VideoAdBannerProps {
  onBrowseInventory: () => void;
  onInspectVehicle: (car: CarListing) => void;
  onContactSeller: () => void;
}

type BannerFilter = 'All' | VehicleConditionType;

export function VideoAdBanner({
  onBrowseInventory,
  onInspectVehicle,
  onContactSeller,
}: VideoAdBannerProps) {
  const [bannerFilter, setBannerFilter] = useState<BannerFilter>('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(0);

  const visibleScenes = useMemo(() => {
    if (bannerFilter === 'All') return COMMERCIAL_SCENES;
    return COMMERCIAL_SCENES.filter((s) => s.conditionType === bannerFilter);
  }, [bannerFilter]);

  const safeIndex = activeIndex >= visibleScenes.length ? 0 : activeIndex;
  const activeScene = visibleScenes[safeIndex] ?? COMMERCIAL_SCENES[0];
  const featuredCar =
    CAR_INVENTORY.find((car) => car.id === activeScene.carId) ?? CAR_INVENTORY[0];

  const showInteriorCut = elapsedSec >= activeScene.durationSec * 0.55;

  useEffect(() => {
    if (!isPlaying) return;

    const tick = window.setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 0.1;
        if (next >= activeScene.durationSec) {
          setActiveIndex((idx) => (idx + 1) % visibleScenes.length);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(tick);
  }, [isPlaying, activeScene.durationSec, visibleScenes.length]);

  const handleFilterChange = (filter: BannerFilter) => {
    setBannerFilter(filter);
    setActiveIndex(0);
    setElapsedSec(0);
  };

  const handleSelectScene = (index: number) => {
    setActiveIndex(index);
    setElapsedSec(0);
  };

  const handlePrev = () => {
    setActiveIndex((idx) => (idx - 1 + visibleScenes.length) % visibleScenes.length);
    setElapsedSec(0);
  };

  const handleNext = () => {
    setActiveIndex((idx) => (idx + 1) % visibleScenes.length);
    setElapsedSec(0);
  };

  const formatSeconds = (sec: number) => {
    const whole = Math.floor(sec);
    return `00:${whole < 10 ? `0${whole}` : whole}`;
  };

  return (
    <section
      aria-label="Modern Vehicles Video Commercial"
      className="relative w-full bg-[#0D0E11] text-white overflow-hidden"
    >
      <div className="relative min-h-[540px] lg:min-h-[640px] max-w-[1440px] mx-auto">
        {/* Background Video-Motion Commercial Frame (Exterior -> Matching Interior Cut) */}
        <div className="absolute inset-0 overflow-hidden">
          {visibleScenes.map((scene, idx) => {
            const isActive = idx === safeIndex;
            const sceneImage = isActive && showInteriorCut ? scene.interiorImage : scene.image;
            return (
              <div
                key={scene.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <div
                  key={`${scene.id}-${showInteriorCut ? 'int' : 'ext'}`}
                  className={`w-full h-full ${isActive ? 'animate-ken-burns' : ''}`}
                  style={{
                    animationPlayState: isActive && isPlaying ? 'running' : 'paused',
                  }}
                >
                  <CarImage
                    src={sceneImage}
                    alt={`${scene.caption} — ${showInteriorCut ? 'Matching Interior' : 'Exterior'}`}
                    title={scene.headline}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            );
          })}

          {/* Measured WCAG AA contrast scrim */}
          <div
            className="absolute inset-0 z-20 bg-gradient-to-t from-[#0D0E11] via-[#0D0E11]/55 to-[#0D0E11]/30"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-20 bg-gradient-to-r from-[#0D0E11]/90 via-[#0D0E11]/45 to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* Foreground Commercial Copy & Controls */}
        <div className="relative z-30 flex flex-col justify-between min-h-[540px] lg:min-h-[640px] px-6 lg:px-12 py-10 lg:py-14">
          <div className="max-w-2xl pt-4 lg:pt-8">
            <p className="text-[13px] font-medium tracking-[0.06em] text-[#E5E4E0]/85 mb-3">
              {activeScene.kicker}
            </p>
            <h1
              className="font-display font-semibold text-white tracking-tight leading-[1.08] mb-4"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.65rem)',
                textWrap: 'balance',
              }}
            >
              {activeScene.headline}
            </h1>
            <p className="text-base lg:text-lg text-[#E5E4E0]/90 max-w-xl leading-relaxed mb-8">
              Explore brand-new arrivals and certified pre-owned modern vehicles with matching exterior and interior previews, full inspection reports, and direct seller support.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBrowseInventory}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse Inventory
              </button>
              <button
                type="button"
                onClick={onContactSeller}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/18 border border-white/25 rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Contact Seller
              </button>
            </div>
          </div>

          {/* Commercial Reel Scrubber, Condition Switcher & Featured Car Strip */}
          <div className="mt-10 pt-5 border-t border-white/15 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#E5E4E0]/75">
                <span className="font-mono tabular-nums">
                  {formatSeconds(elapsedSec)} / {formatSeconds(activeScene.durationSec)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{showInteriorCut ? 'Matching Interior Cockpit' : 'Exterior Commercial View'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-display text-lg font-semibold text-white">
                  {featuredCar.year} {featuredCar.make} {featuredCar.model}
                </span>
                <span className="text-sm text-[#E5E4E0]/80">
                  {featuredCar.conditionType} · {featuredCar.mileageKm.toLocaleString()} km ·{' '}
                  <span className="font-mono tabular-nums text-white font-medium">
                    ${featuredCar.price.toLocaleString()}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onInspectVehicle(featuredCar)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-white underline underline-offset-4 hover:text-[#F4A499] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Inspect Vehicle
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Reel Condition Filter + Playback & Chapter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                role="group"
                aria-label="Filter commercial videos by condition"
                className="inline-flex items-center p-1 bg-white/10 rounded-lg self-start"
              >
                {(['All', 'Brand New', 'Used'] as BannerFilter[]).map((option) => {
                  const selected = bannerFilter === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleFilterChange(option)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selected
                          ? 'bg-white text-[#141416]'
                          : 'text-[#E5E4E0]/80 hover:text-white'
                      }`}
                    >
                      {option === 'All' ? 'All Ads' : option}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {visibleScenes.map((scene, idx) => {
                  const isCurrent = idx === safeIndex;
                  const progressPct = isCurrent
                    ? Math.min(100, (elapsedSec / scene.durationSec) * 100)
                    : idx < safeIndex
                      ? 100
                      : 0;
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => handleSelectScene(idx)}
                      aria-label={`Play commercial scene ${idx + 1}: ${scene.caption}`}
                      className="group py-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-white rounded"
                    >
                      <span className="block w-10 sm:w-12 h-1 bg-white/25 overflow-hidden rounded-sm">
                        <span
                          className="block h-full bg-white transition-[width] duration-100"
                          style={{ width: `${progressPct}%` }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous commercial scene"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause commercial reel' : 'Play commercial reel'}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next commercial scene"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
