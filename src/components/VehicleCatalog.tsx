import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  X,
  Film,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  GitCompareArrows,
  Check,
} from 'lucide-react';
import {
  CAR_INVENTORY,
  type BodyStyle,
  type CarListing,
  type VehicleConditionType,
} from '../data/cars';
import { CarImage } from './CarImage';

interface VehicleCatalogProps {
  onSelectCar: (car: CarListing) => void;
  onMessageWithPreset: (car: CarListing) => void;
  compareIds: string[];
  onToggleCompare: (car: CarListing) => void;
  onOpenCompare: () => void;
}

type ConditionFilter = 'All' | VehicleConditionType;
type BodyFilter = 'All' | BodyStyle;
type MediaMode = 'exterior' | 'interior' | 'video';
type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'make-asc'
  | 'make-desc'
  | 'year-desc'
  | 'year-asc';

const PAGE_SIZE = 12;

const AVAILABLE_BRANDS = Array.from(new Set(CAR_INVENTORY.map((car) => car.make))).sort((a, b) =>
  a.localeCompare(b)
);

const AVAILABLE_YEARS = Array.from(new Set(CAR_INVENTORY.map((car) => car.year))).sort(
  (a, b) => b - a
);

const BRAND_NEW_COUNT = CAR_INVENTORY.filter((c) => c.conditionType === 'Brand New').length;
const USED_COUNT = CAR_INVENTORY.filter((c) => c.conditionType === 'Used').length;

export function VehicleCatalog({
  onSelectCar,
  onMessageWithPreset,
  compareIds,
  onToggleCompare,
  onOpenCompare,
}: VehicleCatalogProps) {
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('All');
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mediaMode, setMediaMode] = useState<MediaMode>('exterior');
  const [cardOverrides, setCardOverrides] = useState<Record<string, number>>({});
  const [videoTick, setVideoTick] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCars, setShowAllCars] = useState(false);

  useEffect(() => {
    if (mediaMode !== 'video') return;
    const timer = window.setInterval(() => {
      setVideoTick((t) => t + 1);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [mediaMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [conditionFilter, bodyFilter, brandFilter, yearFilter, searchQuery, sortBy]);

  const filteredCars = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = CAR_INVENTORY.filter((car) => {
      if (conditionFilter !== 'All' && car.conditionType !== conditionFilter) {
        return false;
      }
      if (bodyFilter !== 'All' && car.bodyStyle !== bodyFilter) {
        return false;
      }
      if (brandFilter !== 'All' && car.make !== brandFilter) {
        return false;
      }
      if (yearFilter !== 'All' && car.year !== Number(yearFilter)) {
        return false;
      }
      if (query) {
        const searchable =
          `${car.stockCode} ${car.year} ${car.make} ${car.model} ${car.trim} ${car.fuelType} ${car.exteriorColor} ${car.interiorTrim} ${car.conditionType}`.toLowerCase();
        if (!searchable.includes(query)) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'make-asc') {
      return [...list].sort(
        (a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model)
      );
    }
    if (sortBy === 'make-desc') {
      return [...list].sort(
        (a, b) => b.make.localeCompare(a.make) || b.model.localeCompare(a.model)
      );
    }
    if (sortBy === 'year-desc') {
      return [...list].sort((a, b) => b.year - a.year || a.price - b.price);
    }
    if (sortBy === 'year-asc') {
      return [...list].sort((a, b) => a.year - b.year || a.price - b.price);
    }
    return list;
  }, [conditionFilter, bodyFilter, brandFilter, yearFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const visibleCars = useMemo(() => {
    if (showAllCars) return filteredCars;
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCars.slice(start, start + PAGE_SIZE);
  }, [filteredCars, safePage, showAllCars]);

  const resetFilters = () => {
    setConditionFilter('All');
    setBodyFilter('All');
    setBrandFilter('All');
    setYearFilter('All');
    setSearchQuery('');
    setSortBy('featured');
    setCardOverrides({});
    setCurrentPage(1);
  };

  const hasActiveFilters =
    conditionFilter !== 'All' ||
    bodyFilter !== 'All' ||
    brandFilter !== 'All' ||
    yearFilter !== 'All' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'featured';

  const getActiveGalleryItem = (car: CarListing) => {
    if (mediaMode === 'video') {
      const idx = videoTick % car.gallery.length;
      return car.gallery[idx] ?? car.gallery[0];
    }
    const overrideIdx = cardOverrides[car.id];
    if (typeof overrideIdx === 'number' && car.gallery[overrideIdx]) {
      return car.gallery[overrideIdx];
    }
    if (mediaMode === 'interior') {
      return (
        car.gallery.find((item) => item.angle === 'interior') ??
        car.gallery[car.gallery.length - 1]
      );
    }
    return car.gallery[0];
  };

  return (
    <section
      id="inventory"
      aria-labelledby="inventory-heading"
      className="py-16 lg:py-24 max-w-[1440px] mx-auto px-6 lg:px-12"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-black/10">
        <div>
          <p className="text-[13px] font-medium text-[#5C5E64] mb-2">
            {CAR_INVENTORY.length} Vehicles Available · {BRAND_NEW_COUNT} Brand New · {USED_COUNT} Used
          </p>
          <h2
            id="inventory-heading"
            className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-[#141416]"
            style={{ textWrap: 'balance' }}
          >
            Browse Modern Vehicles
          </h2>
        </div>

        <p className="text-sm text-[#5C5E64] max-w-md leading-relaxed">
          Search and sort across {CAR_INVENTORY.length} brand-new and inspected used vehicles. Inspect Front, Rear, Side, Trunk, Bonnet, and Interior angles, compare up to 3 models side by side, or reserve online via Paystack.
        </p>
      </div>

      {/* Search, Filter, Sort & Media View Toolbar */}
      <div className="py-6 space-y-4">
        {/* Top Row: Search Bar + Brand, Model Year & Sort Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-[#5C5E64] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brand, model, year, stock code..."
              aria-label="Search inventory by brand, model, year, or stock code"
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-black/12 rounded-lg text-[#141416] placeholder:text-[#787A80] focus:outline-none focus:border-[#141416] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C5E64] hover:text-[#141416] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-2">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              aria-label="Filter by car brand"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416] cursor-pointer"
            >
              <option value="All">All Brands</option>
              {AVAILABLE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              aria-label="Filter by model year"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-black/12 rounded-lg text-[#141416] font-mono tabular-nums focus:outline-none focus:border-[#141416] cursor-pointer"
            >
              <option value="All">All Years</option>
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center md:col-span-3">
            <SlidersHorizontal className="w-4 h-4 text-[#5C5E64] absolute left-3.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort vehicles by price, car brand, or model year"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="make-asc">Brand: A to Z</option>
              <option value="make-desc">Brand: Z to A</option>
              <option value="year-desc">Model Year: Newest</option>
              <option value="year-asc">Model Year: Oldest</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Condition, Body Style & Media View Mode */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Condition Segmented Control */}
            <div
              role="group"
              aria-label="Filter by vehicle condition"
              className="inline-flex items-center p-1 bg-[#ECEAE4] rounded-lg"
            >
              {(['All', 'Brand New', 'Used'] as ConditionFilter[]).map((option) => {
                const active = conditionFilter === option;
                const countLabel =
                  option === 'All'
                    ? `All (${CAR_INVENTORY.length})`
                    : option === 'Brand New'
                      ? `Brand New (${BRAND_NEW_COUNT})`
                      : `Used (${USED_COUNT})`;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setConditionFilter(option)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-[#5C5E64] hover:text-[#141416]'
                    }`}
                  >
                    {countLabel}
                  </button>
                );
              })}
            </div>

            {/* Body Style Segmented Control */}
            <div
              role="group"
              aria-label="Filter by body style"
              className="inline-flex items-center p-1 bg-[#ECEAE4] rounded-lg"
            >
              {(['All', 'Sedan', 'SUV', 'Crossover', 'Coupe'] as BodyFilter[]).map((style) => {
                const active = bodyFilter === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setBodyFilter(style)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-[#5C5E64] hover:text-[#141416]'
                    }`}
                  >
                    {style === 'All' ? 'All Styles' : style}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between xl:justify-end gap-4">
            {/* Global Media Mode Toggle */}
            <div
              role="group"
              aria-label="Catalog media display mode"
              className="inline-flex items-center p-1 bg-[#ECEAE4] rounded-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setMediaMode('exterior');
                  setCardOverrides({});
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mediaMode === 'exterior'
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-[#5C5E64] hover:text-[#141416]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Exterior
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaMode('interior');
                  setCardOverrides({});
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mediaMode === 'interior'
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-[#5C5E64] hover:text-[#141416]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Interior
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaMode('video');
                  setCardOverrides({});
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mediaMode === 'video'
                    ? 'bg-[#141416] text-white shadow-xs'
                    : 'text-[#5C5E64] hover:text-[#141416]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Video Walkaround
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C5E64]">
              <span className="font-mono tabular-nums whitespace-nowrap">
                Showing {visibleCars.length} of {filteredCars.length} matched ({CAR_INVENTORY.length} total)
              </span>
              <button
                type="button"
                onClick={onOpenCompare}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  compareIds.length > 0
                    ? 'bg-[#C8321E] text-white hover:bg-[#AE2917]'
                    : 'bg-white border border-black/15 text-[#141416] hover:border-[#141416]'
                }`}
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                Compare ({compareIds.length}/3)
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-medium text-[#C8321E] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Vehicle Grid */}
      {filteredCars.length === 0 ? (
        <div className="bg-white border border-black/10 rounded-xl p-12 text-center">
          <p className="font-display text-xl font-semibold text-[#141416] mb-2">
            No vehicles match your current filter
          </p>
          <p className="text-sm text-[#5C5E64] mb-6 max-w-md mx-auto">
            Try clearing your search or switching between Brand New and Used vehicles to view available stock.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#141416] hover:bg-[#2A2B30] rounded-lg transition-colors cursor-pointer"
          >
            Show All Vehicles
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {visibleCars.map((car) => {
              const activeItem = getActiveGalleryItem(car);

              return (
                <article
                  key={car.id}
                  className="group bg-white border border-black/10 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Vehicle Image / Multi-Angle & Video Frame (4:3 uniform aspect ratio) */}
                  <div className="relative aspect-[4/3] w-full bg-[#ECEAE4] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onSelectCar(car)}
                      aria-label={`Inspect ${car.year} ${car.make} ${car.model}`}
                      className="w-full h-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#C8321E]"
                    >
                      <div
                        key={activeItem.id}
                        className={`w-full h-full ${mediaMode === 'video' ? 'animate-reel-pan' : ''}`}
                      >
                        <CarImage
                          src={activeItem.src}
                          alt={`${car.year} ${car.make} ${car.model} — ${activeItem.label}`}
                          title={`${car.year} ${car.make} ${car.model}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    </button>

                    {/* Compare Selection Button (Top Right) */}
                    {(() => {
                      const isCompared = compareIds.includes(car.id);
                      const compareFull = compareIds.length >= 3 && !isCompared;
                      return (
                        <button
                          type="button"
                          disabled={compareFull}
                          onClick={() => onToggleCompare(car)}
                          aria-pressed={isCompared}
                          title={
                            compareFull
                              ? 'Maximum of 3 vehicles can be compared at once'
                              : isCompared
                                ? 'Remove from comparison'
                                : 'Add to side-by-side comparison'
                          }
                          className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isCompared
                              ? 'bg-[#C8321E] text-white shadow-xs'
                              : 'bg-[#141416]/75 backdrop-blur-xs text-white hover:bg-[#141416]'
                          }`}
                        >
                          {isCompared ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <GitCompareArrows className="w-3 h-3" />
                          )}
                          {isCompared ? 'Compared' : 'Compare'}
                        </button>
                      );
                    })()}

                    {/* Per-Card Multi-Angle Exterior / Interior Quick Switch */}
                    {mediaMode !== 'video' ? (
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 bg-[#141416]/80 backdrop-blur-xs rounded text-[10px] font-medium text-white truncate">
                            {activeItem.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#141416]/80 backdrop-blur-xs rounded-md w-fit max-w-full">
                          {car.gallery.map((gItem, idx) => {
                            const selected = activeItem.id === gItem.id;
                            return (
                              <button
                                key={gItem.id}
                                type="button"
                                onClick={() =>
                                  setCardOverrides((prev) => ({ ...prev, [car.id]: idx }))
                                }
                                className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                                  selected
                                    ? 'bg-white text-[#141416]'
                                    : 'text-white/80 hover:text-white'
                                }`}
                              >
                                {gItem.shortLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#141416]/80 backdrop-blur-xs rounded text-[11px] font-medium text-white">
                        Video · {activeItem.label}
                      </div>
                    )}
                  </div>

                  {/* Card Details (Strict field order, zero pill spam) */}
                  <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#5C5E64] mb-2">
                        <span
                          className={
                            car.conditionType === 'Brand New'
                              ? 'text-[#C8321E] font-semibold'
                              : 'text-[#141416] font-semibold'
                          }
                        >
                          {car.conditionType}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{car.year}</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.bodyStyle}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{car.stockCode}</span>
                      </div>

                      <h3 className="font-display text-xl font-semibold text-[#141416] tracking-tight leading-snug">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-sm text-[#5C5E64] mt-0.5 truncate">{car.trim}</p>

                      {/* Matching Exterior + Interior Color/Trim Line */}
                      <p className="text-xs text-[#5C5E64] mt-2 truncate">
                        {car.exteriorColor} · {car.interiorTrim}
                      </p>

                      {/* Key Mechanical & Condition Line */}
                      <div className="mt-4 pt-4 border-t border-black/8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5C5E64]">
                        <span className="font-mono tabular-nums text-[#141416]">
                          {car.mileageKm.toLocaleString()} km
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{car.drivetrain}</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.condition.overallGrade.split('—')[0].trim()}</span>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-[#5C5E64]">
                          Asking Price
                        </span>
                        <span className="font-mono tabular-nums text-lg font-medium text-[#141416]">
                          ${car.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onMessageWithPreset(car)}
                          title="Send preset message for this vehicle"
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#141416] border border-black/15 hover:border-[#141416] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectCar(car)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-[#141416] hover:bg-[#C8321E] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Inspect
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination & View-All Controls for 108 Cars */}
          {filteredCars.length > PAGE_SIZE && (
            <div className="mt-10 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#5C5E64]">
                <span className="font-mono tabular-nums">
                  {showAllCars
                    ? `Displaying all ${filteredCars.length} vehicles`
                    : `Page ${safePage} of ${totalPages} (${filteredCars.length} vehicles)`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllCars((v) => !v)}
                  className="ml-2 font-semibold text-[#141416] underline underline-offset-4 hover:text-[#C8321E] cursor-pointer"
                >
                  {showAllCars ? 'Paginate (12 per page)' : `View All ${filteredCars.length}`}
                </button>
              </div>

              {!showAllCars && totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-black/12 bg-white text-[#141416] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const active = pageNum === safePage;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-xs font-mono tabular-nums font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#141416] text-white'
                            : 'bg-white border border-black/12 text-[#141416] hover:bg-[#ECEAE4]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-black/12 bg-white text-[#141416] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
