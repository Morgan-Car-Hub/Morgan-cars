import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CreditCard,
  GitCompareArrows,
  MessageCircle,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import {
  CAR_INVENTORY,
  type CarListing,
  type GalleryAngleKey,
} from '../data/cars';
import { CarImage } from './CarImage';

interface VehicleComparisonModalProps {
  cars: CarListing[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveCar: (carId: string) => void;
  onAddOrReplaceCar: (carId: string, replaceIndex?: number) => void;
  onClearAll: () => void;
  onInspectCar: (car: CarListing) => void;
  onMessageCar: (car: CarListing) => void;
  onPayCar: (car: CarListing) => void;
}

const ANGLE_SYNC_OPTIONS: { angle: GalleryAngleKey; label: string }[] = [
  { angle: 'front', label: 'Front' },
  { angle: 'rear', label: 'Rear' },
  { angle: 'trunk', label: 'Trunk' },
  { angle: 'bonnet', label: 'Bonnet' },
  { angle: 'interior', label: 'Interior' },
];

export function VehicleComparisonModal({
  cars,
  isOpen,
  onClose,
  onRemoveCar,
  onAddOrReplaceCar,
  onClearAll,
  onInspectCar,
  onMessageCar,
  onPayCar,
}: VehicleComparisonModalProps) {
  const [syncedAngle, setSyncedAngle] = useState<GalleryAngleKey | 'custom'>('front');
  const [perCarAngle, setPerCarAngle] = useState<Record<string, GalleryAngleKey>>({});
  const [slotCandidateId, setSlotCandidateId] = useState<string>(CAR_INVENTORY[0].id);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    const firstUnselected = CAR_INVENTORY.find(
      (candidate) => !cars.some((selected) => selected.id === candidate.id)
    );
    if (firstUnselected) {
      setSlotCandidateId(firstUnselected.id);
    }
  }, [cars]);

  const lowestPrice = useMemo(() => {
    if (cars.length < 2) return null;
    return Math.min(...cars.map((c) => c.price));
  }, [cars]);

  const highestPower = useMemo(() => {
    if (cars.length < 2) return null;
    return Math.max(...cars.map((c) => c.powerHp));
  }, [cars]);

  const allFeatures = useMemo(() => {
    const set = new Set<string>();
    cars.forEach((car) => {
      car.features.forEach((feat) => set.add(feat));
    });
    return Array.from(set);
  }, [cars]);

  if (!isOpen) return null;

  const getActiveMedia = (car: CarListing) => {
    const targetAngle =
      syncedAngle === 'custom' ? perCarAngle[car.id] ?? 'front' : syncedAngle;
    return (
      car.gallery.find((item) => item.angle === targetAngle) ?? car.gallery[0]
    );
  };

  const handleGlobalAngleSelect = (angle: GalleryAngleKey) => {
    setSyncedAngle(angle);
    const nextMap: Record<string, GalleryAngleKey> = {};
    cars.forEach((c) => {
      nextMap[c.id] = angle;
    });
    setPerCarAngle(nextMap);
  };

  const handleCardAngleSelect = (carId: string, angle: GalleryAngleKey) => {
    setSyncedAngle('custom');
    setPerCarAngle((prev) => ({ ...prev, [carId]: angle }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-[#F8F7F4] text-[#141416] rounded-2xl shadow-2xl border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-black/10">
          <div className="flex items-center gap-3">
            <GitCompareArrows className="w-5 h-5 text-[#C8321E]" />
            <div>
              <h2
                id="compare-modal-title"
                className="font-display text-lg lg:text-xl font-semibold text-[#141416]"
              >
                Side-by-Side Vehicle Comparison
              </h2>
              <p className="text-xs text-[#5C5E64]">
                Comparing {cars.length} of 3 vehicles across angles, pricing, specs, and features
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {cars.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-2 text-xs font-medium text-[#5C5E64] hover:text-[#C8321E] transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close vehicle comparison"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-black/10 text-[#141416] hover:bg-[#141416] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Global Sync Angle Bar + Add Vehicle Slot */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-black/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#5C5E64] mr-1">
                Sync Photo Angle:
              </span>
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg">
                {ANGLE_SYNC_OPTIONS.map((opt) => {
                  const active = syncedAngle === opt.angle;
                  return (
                    <button
                      key={opt.angle}
                      type="button"
                      onClick={() => handleGlobalAngleSelect(opt.angle)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-white text-[#141416] shadow-xs'
                          : 'text-[#5C5E64] hover:text-[#141416]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {cars.length < 3 && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={slotCandidateId}
                  onChange={(e) => setSlotCandidateId(e.target.value)}
                  aria-label="Choose a vehicle to add to comparison"
                  className="px-3 py-2 text-xs bg-white border border-black/12 rounded-lg text-[#141416] max-w-[260px]"
                >
                  {CAR_INVENTORY.filter(
                    (c) => !cars.some((sel) => sel.id === c.id)
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.stockCode} · {c.year} {c.make} {c.model} (${c.price.toLocaleString()})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onAddOrReplaceCar(slotCandidateId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#141416] hover:bg-[#C8321E] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Vehicle ({cars.length}/3)
                </button>
              </div>
            )}
          </div>

          {cars.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-xl p-12 text-center space-y-4">
              <p className="font-display text-xl font-semibold text-[#141416]">
                No vehicles selected for comparison
              </p>
              <p className="text-sm text-[#5C5E64] max-w-md mx-auto">
                Select up to three vehicles from the showroom catalog or add one using the dropdown above to compare specs, condition, pricing, and features side by side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[780px] space-y-6">
                {/* Vehicle Header Cards Grid */}
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `200px repeat(${cars.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="flex flex-col justify-end pb-2">
                    <span className="text-xs font-medium text-[#5C5E64]">
                      Selected Models
                    </span>
                    <span className="font-display text-lg font-semibold text-[#141416]">
                      Visual &amp; Price Overview
                    </span>
                  </div>

                  {cars.map((car, colIdx) => {
                    const media = getActiveMedia(car);
                    const isBestPrice = lowestPrice !== null && car.price === lowestPrice;

                    return (
                      <div
                        key={car.id}
                        className="bg-white border border-black/10 rounded-xl overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[4/3] w-full bg-[#ECEAE4]">
                            <CarImage
                              src={media.src}
                              alt={`${car.year} ${car.make} ${car.model} — ${media.label}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveCar(car.id)}
                              aria-label={`Remove ${car.year} ${car.make} ${car.model} from comparison`}
                              className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-md bg-[#141416]/80 text-white hover:bg-[#C8321E] transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#141416]/80 text-[10px] font-medium text-white">
                              {media.label}
                            </span>
                          </div>

                          {/* Per-Card Angle Buttons */}
                          <div className="px-3 pt-2.5 pb-1 flex flex-wrap gap-1 border-b border-black/8">
                            {car.gallery.map((gItem) => {
                              const active = media.id === gItem.id;
                              return (
                                <button
                                  key={gItem.id}
                                  type="button"
                                  onClick={() => handleCardAngleSelect(car.id, gItem.angle)}
                                  className={`px-2 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                                    active
                                      ? 'bg-[#141416] text-white'
                                      : 'bg-[#F3F1EC] text-[#5C5E64] hover:text-[#141416]'
                                  }`}
                                >
                                  {gItem.shortLabel}
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-[#5C5E64]">
                              <span
                                className={
                                  car.conditionType === 'Brand New'
                                    ? 'text-[#C8321E] font-semibold'
                                    : 'text-[#141416] font-semibold'
                                }
                              >
                                {car.conditionType} · {car.year}
                              </span>
                              <span className="font-mono tabular-nums">{car.stockCode}</span>
                            </div>

                            <h3 className="font-display text-base font-semibold text-[#141416] leading-snug">
                              {car.make} {car.model}
                            </h3>
                            <p className="text-xs text-[#5C5E64] truncate">{car.trim}</p>

                            <div className="pt-2 flex items-baseline justify-between gap-2">
                              <span className="font-mono tabular-nums text-lg font-semibold text-[#141416]">
                                ${car.price.toLocaleString()}
                              </span>
                              {isBestPrice && (
                                <span className="text-[11px] font-semibold text-[#C8321E]">
                                  Lowest Price
                                </span>
                              )}
                            </div>

                            {/* Swap Model Picker */}
                            <select
                              value={car.id}
                              onChange={(e) => onAddOrReplaceCar(e.target.value, colIdx)}
                              aria-label={`Swap comparison slot ${colIdx + 1}`}
                              className="w-full mt-2 px-2.5 py-1.5 text-[11px] bg-[#F8F7F4] border border-black/10 rounded-md text-[#141416]"
                            >
                              {CAR_INVENTORY.map((opt) => {
                                const usedElsewhere =
                                  opt.id !== car.id && cars.some((c) => c.id === opt.id);
                                return (
                                  <option key={opt.id} value={opt.id} disabled={usedElsewhere}>
                                    Swap: {opt.stockCode} · {opt.year} {opt.make} {opt.model} ($
                                    {opt.price.toLocaleString()})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-2 flex flex-col gap-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => onInspectCar(car)}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-white bg-[#141416] hover:bg-[#2A2B30] rounded-lg transition-colors cursor-pointer"
                            >
                              Inspect
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onMessageCar(car)}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-[#141416] border border-black/15 hover:border-[#141416] rounded-lg transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Preset
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onPayCar(car)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Deposit ($500)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Specifications & Condition Comparison Table */}
                <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-[#F3F1EC] border-b border-black/10">
                    <h3 className="font-display text-sm font-semibold text-[#141416]">
                      Technical Specifications &amp; Condition Comparison
                    </h3>
                  </div>

                  <div className="divide-y divide-black/8 text-xs">
                    {[
                      {
                        label: 'Condition Status',
                        render: (c: CarListing) => c.conditionType,
                      },
                      {
                        label: 'Body Style',
                        render: (c: CarListing) => c.bodyStyle,
                      },
                      {
                        label: 'Mileage',
                        render: (c: CarListing) => (
                          <span className="font-mono tabular-nums">
                            {c.mileageKm.toLocaleString()} km
                          </span>
                        ),
                      },
                      {
                        label: 'Horsepower',
                        render: (c: CarListing) => (
                          <span className="font-mono tabular-nums font-medium">
                            {c.powerHp} hp
                            {highestPower !== null && c.powerHp === highestPower && (
                              <span className="ml-1.5 text-[#C8321E] font-sans font-semibold">
                                (Highest)
                              </span>
                            )}
                          </span>
                        ),
                      },
                      {
                        label: 'Powertrain',
                        render: (c: CarListing) => c.fuelType,
                      },
                      {
                        label: 'Transmission',
                        render: (c: CarListing) => c.transmission,
                      },
                      {
                        label: 'Drivetrain',
                        render: (c: CarListing) => c.drivetrain,
                      },
                      {
                        label: 'Exterior Color',
                        render: (c: CarListing) => c.exteriorColor,
                      },
                      {
                        label: 'Interior Trim',
                        render: (c: CarListing) => c.interiorTrim,
                      },
                      {
                        label: 'Inspection Grade',
                        render: (c: CarListing) => c.condition.overallGrade,
                      },
                      {
                        label: 'Mechanical Check',
                        render: (c: CarListing) => c.condition.mechanicalScore,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="grid items-center gap-4 px-5 py-3"
                        style={{
                          gridTemplateColumns: `200px repeat(${cars.length}, minmax(0, 1fr))`,
                        }}
                      >
                        <span className="font-medium text-[#5C5E64]">{row.label}</span>
                        {cars.map((car) => (
                          <div key={`${row.label}-${car.id}`} className="text-[#141416]">
                            {row.render(car)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Installed Features Matrix */}
                <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-[#F3F1EC] border-b border-black/10">
                    <h3 className="font-display text-sm font-semibold text-[#141416]">
                      Equipment &amp; Feature Breakdown ({allFeatures.length} Features)
                    </h3>
                  </div>

                  <div className="divide-y divide-black/8 text-xs">
                    {allFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="grid items-center gap-4 px-5 py-2.5"
                        style={{
                          gridTemplateColumns: `200px repeat(${cars.length}, minmax(0, 1fr))`,
                        }}
                      >
                        <span className="text-[#2E3035] pr-2">{feature}</span>
                        {cars.map((car) => {
                          const hasFeature = car.features.includes(feature);
                          return (
                            <div
                              key={`${feature}-${car.id}`}
                              className="flex items-center gap-1.5"
                            >
                              {hasFeature ? (
                                <>
                                  <Check className="w-4 h-4 text-[#C8321E] shrink-0" />
                                  <span className="text-[#141416] font-medium">Included</span>
                                </>
                              ) : (
                                <>
                                  <Minus className="w-4 h-4 text-[#9B9DA3] shrink-0" />
                                  <span className="text-[#787A80]">Not listed</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
