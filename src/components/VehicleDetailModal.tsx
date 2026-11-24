import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Film,
  GitCompareArrows,
  MessageCircle,
  Pause,
  Play,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  getCarMessagePreset,
  SELLER_CHANNELS,
  type CarListing,
  type MessagePresetIntent,
} from '../data/cars';
import { CarImage } from './CarImage';

interface VehicleDetailModalProps {
  car: CarListing | null;
  isCompared?: boolean;
  onToggleCompare?: (car: CarListing) => void;
  onClose: () => void;
  onSendToContactForm: (car: CarListing, presetText: string) => void;
  onOpenPaystack: (car: CarListing) => void;
}

export function VehicleDetailModal({
  car,
  isCompared = false,
  onToggleCompare,
  onClose,
  onSendToContactForm,
  onOpenPaystack,
}: VehicleDetailModalProps) {
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0);
  const [walkaroundActive, setWalkaroundActive] = useState(false);
  const [walkaroundPlaying, setWalkaroundPlaying] = useState(true);
  const [presetIntent, setPresetIntent] = useState<MessagePresetIntent>('availability');
  const [copiedPreset, setCopiedPreset] = useState(false);

  useEffect(() => {
    setSelectedGalleryIdx(0);
    setWalkaroundActive(false);
    setWalkaroundPlaying(true);
    setPresetIntent('availability');
    setCopiedPreset(false);
  }, [car?.id]);

  useEffect(() => {
    if (!car || !walkaroundActive || !walkaroundPlaying) return;
    const timer = window.setInterval(() => {
      setSelectedGalleryIdx((idx) => (idx + 1) % car.gallery.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [car, walkaroundActive, walkaroundPlaying]);

  useEffect(() => {
    if (!car) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [car, onClose]);

  if (!car) return null;

  const activeMedia = car.gallery[selectedGalleryIdx] ?? car.gallery[0];
  const presetText = getCarMessagePreset(car, presetIntent);

  const handleCopyPreset = async () => {
    try {
      await navigator.clipboard.writeText(presetText);
      setCopiedPreset(true);
      window.setTimeout(() => setCopiedPreset(false), 2200);
    } catch {
      setCopiedPreset(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-car-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#F8F7F4] text-[#141416] rounded-2xl shadow-2xl border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-black/10">
          <div className="flex items-center gap-2 text-xs text-[#5C5E64]">
            <span className="font-mono tabular-nums font-medium text-[#141416]">
              Stock {car.stockCode}
            </span>
            <span aria-hidden="true">·</span>
            <span>{car.conditionType}</span>
            <span aria-hidden="true">·</span>
            <span>{car.year}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vehicle details"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-black/10 text-[#141416] hover:bg-[#141416] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Contiguous Inspection & Purchase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
          {/* Left Column: 4-Angle Exterior & Interior Gallery, Condition Report, Features */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#ECEAE4] border border-black/8">
                <div
                  key={activeMedia.id}
                  className={`w-full h-full ${walkaroundActive ? 'animate-reel-pan' : ''}`}
                  style={{
                    animationPlayState:
                      walkaroundActive && walkaroundPlaying ? 'running' : 'paused',
                  }}
                >
                  <CarImage
                    src={activeMedia.src}
                    alt={`${car.year} ${car.make} ${car.model} — ${activeMedia.label}`}
                    title={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-[#141416]/80 backdrop-blur-xs rounded-md text-xs font-medium text-white">
                  {activeMedia.label} ·{' '}
                  {activeMedia.type === 'interior' ? car.interiorTrim : car.exteriorColor}
                </div>

                {walkaroundActive && (
                  <button
                    type="button"
                    onClick={() => setWalkaroundPlaying((p) => !p)}
                    aria-label={walkaroundPlaying ? 'Pause walkaround' : 'Play walkaround'}
                    className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-[#C8321E] text-white cursor-pointer"
                  >
                    {walkaroundPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Multi-Angle Exterior & Interior Thumbnails + Video Walkaround Button */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                {car.gallery.map((item, idx) => {
                  const selected = !walkaroundActive && selectedGalleryIdx === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setWalkaroundActive(false);
                        setSelectedGalleryIdx(idx);
                      }}
                      className={`flex flex-col rounded-lg overflow-hidden border transition-colors cursor-pointer bg-white text-left ${
                        selected
                          ? 'border-[#C8321E] ring-1 ring-[#C8321E]'
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <span className="w-full aspect-[4/3] block overflow-hidden bg-[#ECEAE4]">
                        <CarImage
                          src={item.src}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      </span>
                      <span className="px-2 py-1.5 text-[11px] font-medium text-[#141416] truncate">
                        {item.shortLabel}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setWalkaroundActive(true);
                    setWalkaroundPlaying(true);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    walkaroundActive
                      ? 'bg-[#141416] text-white border-[#141416]'
                      : 'bg-white text-[#141416] border-black/12 hover:border-[#141416]'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Video Tour</span>
                </button>
              </div>
            </div>

            {/* General Condition Report */}
            <div className="bg-white border border-black/10 rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#C8321E]" />
                <h3 className="font-display text-lg font-semibold text-[#141416]">
                  General Condition &amp; Inspection Report
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-black/8">
                  <span className="text-[#5C5E64]">Overall Grade</span>
                  <span className="font-semibold text-[#141416]">{car.condition.overallGrade}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-black/8">
                  <span className="text-[#5C5E64]">Exterior Body &amp; Paint</span>
                  <span className="text-[#141416] sm:text-right">{car.condition.exteriorScore}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-black/8">
                  <span className="text-[#5C5E64]">Interior &amp; Electronics</span>
                  <span className="text-[#141416] sm:text-right">{car.condition.interiorScore}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-black/8">
                  <span className="text-[#5C5E64]">Mechanical &amp; Powertrain</span>
                  <span className="text-[#141416] sm:text-right">{car.condition.mechanicalScore}</span>
                </div>
                <div className="pt-2 text-[#5C5E64] leading-relaxed">
                  <p>
                    <strong className="font-medium text-[#141416]">History:</strong>{' '}
                    {car.condition.historySummary}
                  </p>
                  <p className="mt-1">
                    <strong className="font-medium text-[#141416]">Workshop Note:</strong>{' '}
                    {car.condition.inspectionNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features List */}
            <div className="bg-white border border-black/10 rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-[#141416] mb-4">
                Installed Features &amp; Equipment
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-[#2E3035]"
                  >
                    <Check className="w-4 h-4 text-[#C8321E] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase, Preset Seller Message & Paystack Module */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20 bg-white border border-black/10 rounded-xl p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#5C5E64] mb-1.5">
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
                  <span>{car.bodyStyle}</span>
                </div>
                <h2
                  id="modal-car-title"
                  className="font-display text-2xl font-semibold tracking-tight text-[#141416]"
                >
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-sm text-[#5C5E64] mt-0.5">{car.trim}</p>

                <div className="mt-4 pt-4 border-t border-black/10 flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#5C5E64]">
                    Vehicle Price
                  </span>
                  <span className="font-mono tabular-nums text-2xl font-semibold text-[#141416]">
                    ${car.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Technical Spec Table */}
              <div className="border-t border-b border-black/10 py-3.5 space-y-2 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Mileage</span>
                  <span className="font-mono tabular-nums font-medium text-[#141416]">
                    {car.mileageKm.toLocaleString()} km
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Powertrain</span>
                  <span className="font-medium text-[#141416] text-right">{car.fuelType}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Output</span>
                  <span className="font-mono tabular-nums font-medium text-[#141416]">
                    {car.powerHp} hp
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Transmission</span>
                  <span className="font-medium text-[#141416] text-right">
                    {car.transmission}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Exterior Color</span>
                  <span className="font-medium text-[#141416] text-right">
                    {car.exteriorColor}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Interior Trim</span>
                  <span className="font-medium text-[#141416] text-right">
                    {car.interiorTrim}
                  </span>
                </div>
              </div>

              {/* Vehicle Message Preset Builder */}
              <div className="space-y-2.5 bg-[#F8F7F4] border border-black/10 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#141416]">
                    Seller Message Preset
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPreset}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#141416] hover:text-[#C8321E] cursor-pointer"
                  >
                    {copiedPreset ? (
                      <>
                        <Check className="w-3 h-3 text-[#C8321E]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Preset
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      ['availability', 'Availability'],
                      ['inspection', 'Book Inspection'],
                      ['walkaround', 'Video Tour'],
                      ['pricing', 'Cash / Deposit'],
                    ] as [MessagePresetIntent, string][]
                  ).map(([intentKey, label]) => (
                    <button
                      key={intentKey}
                      type="button"
                      onClick={() => setPresetIntent(intentKey)}
                      className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        presetIntent === intentKey
                          ? 'bg-[#141416] text-white'
                          : 'bg-white border border-black/10 text-[#5C5E64] hover:text-[#141416]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-[#2E3035] leading-relaxed bg-white border border-black/8 rounded-lg p-2.5">
                  {presetText}
                </p>
              </div>

              {/* Direct Seller Contact & Paystack Payment Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onOpenPaystack(car)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#141416] hover:bg-[#2A2B30] rounded-lg transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Reserve / Pay with Paystack
                </button>

                <a
                  href={SELLER_CHANNELS.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    navigator.clipboard?.writeText(presetText).catch(() => {});
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Copy Preset &amp; Open WhatsApp
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href={SELLER_CHANNELS.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    navigator.clipboard?.writeText(presetText).catch(() => {});
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#141416] bg-[#F3F1EC] hover:bg-[#E5E2DA] rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Open Telegram ({SELLER_CHANNELS.telegramHandle})
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                {onToggleCompare && (
                  <button
                    type="button"
                    onClick={() => onToggleCompare(car)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isCompared
                        ? 'bg-[#C8321E]/10 text-[#C8321E] border border-[#C8321E]'
                        : 'text-[#141416] border border-black/15 hover:border-[#141416]'
                    }`}
                  >
                    <GitCompareArrows className="w-3.5 h-3.5" />
                    {isCompared ? 'Selected in Side-by-Side Comparison' : 'Add to Side-by-Side Compare'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSendToContactForm(car, presetText)}
                  className="w-full inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium text-[#141416] border border-black/15 hover:border-[#141416] rounded-lg transition-colors cursor-pointer"
                >
                  Send Preset via Inquiry Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
