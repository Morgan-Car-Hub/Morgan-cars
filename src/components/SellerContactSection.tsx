import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  MessageCircle,
  Send,
  Video,
} from 'lucide-react';
import {
  CAR_INVENTORY,
  getCarMessagePreset,
  SELLER_CHANNELS,
  type CarListing,
  type MessagePresetIntent,
} from '../data/cars';

interface SellerContactSectionProps {
  preselectedCar: CarListing | null;
  preselectedMessage: string | null;
  onOpenPaystack: (car: CarListing) => void;
}

export function SellerContactSection({
  preselectedCar,
  preselectedMessage,
  onOpenPaystack,
}: SellerContactSectionProps) {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [selectedCarId, setSelectedCarId] = useState<string>(
    preselectedCar?.id ?? CAR_INVENTORY[0].id
  );
  const [presetIntent, setPresetIntent] = useState<MessagePresetIntent>('availability');
  const [preferredChannel, setPreferredChannel] = useState<'WhatsApp' | 'Telegram' | 'Email'>(
    'WhatsApp'
  );
  const [message, setMessage] = useState(() =>
    getCarMessagePreset(preselectedCar ?? CAR_INVENTORY[0], 'availability')
  );
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    reference: string;
    carTitle: string;
    channel: string;
    summaryText: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedCar) {
      setSelectedCarId(preselectedCar.id);
      setMessage(
        preselectedMessage || getCarMessagePreset(preselectedCar, 'availability')
      );
      setSubmittedReceipt(null);
      setCopiedMessage(false);
    }
  }, [preselectedCar, preselectedMessage]);

  const activeCar =
    CAR_INVENTORY.find((c) => c.id === selectedCarId) ?? CAR_INVENTORY[0];

  const handleVehicleChange = (carId: string) => {
    setSelectedCarId(carId);
    const chosen = CAR_INVENTORY.find((c) => c.id === carId);
    if (chosen) {
      setMessage(getCarMessagePreset(chosen, presetIntent));
    } else {
      setMessage(
        'Hi Morgan Car Hub, I am looking to source a specific modern car. Please share your available arrivals and pricing.'
      );
    }
  };

  const handleIntentChange = (intent: MessagePresetIntent) => {
    setPresetIntent(intent);
    if (selectedCarId !== 'general') {
      setMessage(getCarMessagePreset(activeCar, intent));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const chosenCar = CAR_INVENTORY.find((c) => c.id === selectedCarId);
    const carTitle = chosenCar
      ? `${chosenCar.year} ${chosenCar.make} ${chosenCar.model}`
      : 'General Vehicle Inquiry';
    const refNumber = `MCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const summaryText = `Ref #${refNumber} | Vehicle: ${carTitle} | Buyer: ${name} (${contactInfo}) | Message: ${message}`;

    setCopiedMessage(false);
    setSubmittedReceipt({
      reference: refNumber,
      carTitle,
      channel: preferredChannel,
      summaryText,
    });
  };

  const handleCopyInquiry = async () => {
    if (!submittedReceipt) return;
    try {
      await navigator.clipboard.writeText(submittedReceipt.summaryText);
      setCopiedMessage(true);
      window.setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-16 lg:py-24 max-w-[1440px] mx-auto px-6 lg:px-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Direct Seller Social Channels & Paystack Quick Gateway */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-[13px] font-medium text-[#5C5E64] mb-2">
              Direct Seller Access &amp; Paystack Checkout
            </p>
            <h2
              id="contact-heading"
              className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-[#141416]"
              style={{ textWrap: 'balance' }}
            >
              Message &amp; Pay Morgan Car Hub
            </h2>
            <p className="text-sm text-[#5C5E64] mt-3 leading-relaxed">
              Use any vehicle&rsquo;s pre-filled message preset to contact us on WhatsApp or Telegram, follow daily walkarounds on TikTok, or lock a vehicle with Paystack.
            </p>
          </div>

          <div className="space-y-3">
            {/* Paystack Quick Payment Card */}
            <button
              type="button"
              onClick={() => onOpenPaystack(activeCar)}
              className="w-full flex items-center justify-between p-5 bg-[#141416] text-white rounded-xl hover:bg-[#232429] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#C8321E] text-white flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-display text-base font-semibold">
                    Paystack Deposit &amp; Checkout
                  </span>
                  <span className="block text-xs text-white/75">
                    Reserve {activeCar.year} {activeCar.make} {activeCar.model} (USD, GBP, EUR, CAD, AUD)
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/75 shrink-0" />
            </button>

            {/* WhatsApp */}
            <a
              href={SELLER_CHANNELS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                navigator.clipboard?.writeText(message).catch(() => {});
              }}
              className="flex items-center justify-between p-5 bg-white border border-black/10 rounded-xl hover:border-[#141416] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#C8321E]/10 text-[#C8321E] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-display text-base font-semibold text-[#141416]">
                    WhatsApp Direct Chat
                  </span>
                  <span className="block text-xs text-[#5C5E64]">
                    Copies your vehicle preset &amp; opens WhatsApp
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#5C5E64] group-hover:text-[#141416] shrink-0" />
            </a>

            {/* Telegram */}
            <a
              href={SELLER_CHANNELS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                navigator.clipboard?.writeText(message).catch(() => {});
              }}
              className="flex items-center justify-between p-5 bg-white border border-black/10 rounded-xl hover:border-[#141416] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#141416]/6 text-[#141416] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-display text-base font-semibold text-[#141416]">
                    Telegram · {SELLER_CHANNELS.telegramHandle}
                  </span>
                  <span className="block text-xs text-[#5C5E64]">
                    Join channel updates &amp; message the seller directly
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#5C5E64] group-hover:text-[#141416] shrink-0" />
            </a>

            {/* TikTok */}
            <a
              href={SELLER_CHANNELS.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-white border border-black/10 rounded-xl hover:border-[#141416] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#141416]/6 text-[#141416] flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-display text-base font-semibold text-[#141416]">
                    TikTok · {SELLER_CHANNELS.tiktokHandle}
                  </span>
                  <span className="block text-xs text-[#5C5E64]">
                    Daily car walkarounds, cold starts &amp; deal alerts
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#5C5E64] group-hover:text-[#141416] shrink-0" />
            </a>
          </div>
        </div>

        {/* Right: Direct Seller Message Form with Vehicle Preset Builder */}
        <div className="lg:col-span-7 bg-white border border-black/10 rounded-xl p-6 lg:p-8">
          {submittedReceipt ? (
            <div className="py-8 space-y-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#141416]">
                <CheckCircle2 className="w-5 h-5 text-[#C8321E]" />
                <span>Inquiry Prepared · Reference #{submittedReceipt.reference}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#141416]">
                Message Ready for {submittedReceipt.carTitle}
              </h3>
              <p className="text-sm text-[#5C5E64] leading-relaxed max-w-lg">
                Your inquiry for <strong className="text-[#141416]">{submittedReceipt.carTitle}</strong> is ready to send via {submittedReceipt.channel}. Copy the formatted summary below or open WhatsApp or Telegram directly.
              </p>

              <div className="p-4 bg-[#F8F7F4] border border-black/10 rounded-lg text-xs text-[#2E3035] font-mono leading-relaxed break-words">
                {submittedReceipt.summaryText}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={SELLER_CHANNELS.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors"
                >
                  Open WhatsApp Chat
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={SELLER_CHANNELS.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#141416] bg-[#F3F1EC] hover:bg-[#E5E2DA] rounded-lg transition-colors"
                >
                  Open Telegram
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyInquiry}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#141416] border border-black/15 hover:border-[#141416] rounded-lg transition-colors cursor-pointer"
                >
                  {copiedMessage ? (
                    <Check className="w-4 h-4 text-[#C8321E]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedMessage ? 'Copied' : 'Copy Message'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReceipt(null);
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-[#5C5E64] hover:text-[#141416] cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#141416]">
                  Send a Direct Message to the Seller
                </h3>
                <p className="text-xs text-[#5C5E64] mt-1">
                  Selecting any vehicle automatically populates a ready-to-send message preset.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="buyer-name"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="buyer-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] placeholder:text-[#787A80] focus:outline-none focus:border-[#141416]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="buyer-contact"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Phone, WhatsApp, or Email
                  </label>
                  <input
                    id="buyer-contact"
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="+1 555 234 5678, +44 7700 900077, or email"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] placeholder:text-[#787A80] focus:outline-none focus:border-[#141416]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="vehicle-interest"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Vehicle of Interest ({CAR_INVENTORY.length} Units)
                  </label>
                  <select
                    id="vehicle-interest"
                    value={selectedCarId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                  >
                    {CAR_INVENTORY.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.stockCode} · {car.year} {car.make} {car.model} ({car.conditionType}) — $
                        {car.price.toLocaleString()}
                      </option>
                    ))}
                    <option value="general">General Sourcing / Other Request</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reply-channel"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Preferred Reply Method
                  </label>
                  <select
                    id="reply-channel"
                    value={preferredChannel}
                    onChange={(e) =>
                      setPreferredChannel(
                        e.target.value as 'WhatsApp' | 'Telegram' | 'Email'
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Email">Email / Phone Call</option>
                  </select>
                </div>
              </div>

              {/* Message Preset Intent Selector */}
              {selectedCarId !== 'general' && (
                <div>
                  <span className="block text-xs font-medium text-[#141416] mb-1.5">
                    Message Preset Template
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['availability', 'Check Availability'],
                        ['inspection', 'Book Inspection'],
                        ['walkaround', 'Request Video Walkaround'],
                        ['pricing', 'Cash / Paystack Deposit'],
                      ] as [MessagePresetIntent, string][]
                    ).map(([intentKey, label]) => (
                      <button
                        key={intentKey}
                        type="button"
                        onClick={() => handleIntentChange(intentKey)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          presetIntent === intentKey
                            ? 'bg-[#141416] text-white'
                            : 'bg-[#F3F1EC] text-[#5C5E64] hover:text-[#141416]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="buyer-message"
                  className="block text-xs font-medium text-[#141416] mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="buyer-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about availability, final price, delivery options, or request a live walkaround video..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] placeholder:text-[#787A80] focus:outline-none focus:border-[#141416] resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <span className="text-xs text-[#5C5E64]">
                  Direct seller response via WhatsApp or Telegram.
                </span>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#141416] hover:bg-[#C8321E] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
