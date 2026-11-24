import { useEffect, useState, type FormEvent } from 'react';
import Paystack from '@paystack/inline-js';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Landmark,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { CAR_INVENTORY, SELLER_CHANNELS, type CarListing } from '../data/cars';
import { CarImage } from './CarImage';
import { InternationalPhoneInput } from './InternationalPhoneInput';

interface PaymentSectionProps {
  selectedCar: CarListing | null;
  onInspectCar: (car: CarListing) => void;
}

type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'AED';
type PaymentType = 'deposit' | 'downpayment' | 'full';
type PaymentMethod = 'card' | 'wire';

const CURRENCY_FX: Record<CurrencyCode, { rate: number; symbol: string; label: string }> = {
  USD: { rate: 1, symbol: '$', label: 'USD ($)' },
  GBP: { rate: 0.79, symbol: '£', label: 'GBP (£)' },
  EUR: { rate: 0.92, symbol: '€', label: 'EUR (€)' },
  CAD: { rate: 1.38, symbol: 'C$', label: 'CAD (C$)' },
  AUD: { rate: 1.54, symbol: 'A$', label: 'AUD (A$)' },
  AED: { rate: 3.67, symbol: 'AED ', label: 'AED' },
};

const DEPOSIT_USD = 500;

interface InitResult {
  mode: 'live' | 'sandbox_preview' | 'wire_invoice';
  paymentMethod?: PaymentMethod;
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  vehicleTitle: string;
  stockCode: string;
  amountFormatted: string;
  currency: string;
  displayCurrency?: string;
  displayAmountFormatted?: string;
  usdAmountFormatted?: string;
  wireRail?: string;
  settlementNotice?: string;
  notice?: string;
}

interface VerifyResult {
  mode: 'live' | 'sandbox_preview' | 'wire_invoice';
  verified: boolean;
  status: string;
  reference: string;
  vehicleTitle: string;
  amountFormatted: string;
  message?: string;
}

export function PaymentSection({ selectedCar, onInspectCar }: PaymentSectionProps) {
  const [selectedStockCode, setSelectedStockCode] = useState<string>(
    selectedCar?.stockCode ?? CAR_INVENTORY[0].stockCode
  );
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedWire, setCopiedWire] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [popupNote, setPopupNote] = useState<string | null>(null);
  const [initResult, setInitResult] = useState<InitResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    if (selectedCar) {
      setSelectedStockCode(selectedCar.stockCode);
      setInitResult(null);
      setVerifyResult(null);
      setErrorMsg(null);
      setPopupNote(null);
      setCopiedWire(false);
    }
  }, [selectedCar]);

  useEffect(() => {
    fetch('/api/paystack/config')
      .then(async (res) => {
        const isJson = res.headers.get('content-type')?.includes('application/json');
        if (!res.ok || !isJson) return null;
        return (await res.json()) as { configured?: boolean };
      })
      .then((data) => {
        if (data && typeof data.configured === 'boolean') {
          setServerConfigured(data.configured);
        }
      })
      .catch(() => {
        setServerConfigured(null);
      });
  }, []);

  const activeCar =
    CAR_INVENTORY.find((c) => c.stockCode === selectedStockCode) ?? CAR_INVENTORY[0];

  const usdAmount =
    paymentType === 'full'
      ? activeCar.price
      : paymentType === 'downpayment'
        ? Math.round(activeCar.price * 0.25)
        : DEPOSIT_USD;
  const fx = CURRENCY_FX[currency];
  const convertedAmount = Math.round(usdAmount * fx.rate);

  const handleVerifyStatus = async (reference: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!isJson) {
        setPopupNote(
          'Payment receipt status is verified directly by the backend server or Paystack dashboard.'
        );
        return;
      }
      const data = (await res.json()) as VerifyResult & { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || 'Verification check failed.');
        return;
      }
      setVerifyResult(data);
    } catch {
      setErrorMsg('Network error while checking payment status.');
    } finally {
      setIsVerifying(false);
    }
  };

  const launchPaystackPopup = (accessCode: string, reference: string) => {
    setPopupNote(null);
    setErrorMsg(null);
    try {
      const popup = new Paystack();
      popup.resumeTransaction(accessCode, {
        onSuccess: (tx: { reference?: string }) => {
          const ref = tx?.reference || reference;
          setPopupNote('Payment completed in Paystack. Verifying receipt...');
          void handleVerifyStatus(ref);
        },
        onCancel: () => {
          setPopupNote(
            'Checkout window closed before completion. You can reopen the popup or use the hosted checkout link below.'
          );
        },
        onError: (err: { message?: string }) => {
          setErrorMsg(
            err?.message ||
              'Popup blocked or interrupted. Click "Open Hosted Checkout" below to complete payment.'
          );
        },
      });
    } catch {
      setPopupNote('Click "Open Hosted Checkout" below to complete your Paystack payment.');
    }
  };

  const handleCopyWireSummary = async (res: InitResult) => {
    const summary = `Morgan Car Hub Proforma Wire | Ref: ${res.reference} | Stock: ${res.stockCode} (${res.vehicleTitle}) | Amount: ${res.amountFormatted} ${res.currency} | Rail: ${res.wireRail || 'SWIFT Wire'} | Buyer: ${fullName} (${phone}, ${email})`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedWire(true);
      window.setTimeout(() => setCopiedWire(false), 2500);
    } catch {
      setCopiedWire(false);
    }
  };

  const handleStaticFallback = (): boolean => {
    const vehicleTitle = `${activeCar.year} ${activeCar.make} ${activeCar.model} ${activeCar.trim}`;
    const formatted = `${fx.symbol}${convertedAmount.toLocaleString()}`;

    if (paymentMethod === 'wire') {
      const wireRef = `MCH_WIRE_${Math.random().toString(16).slice(2, 14).toUpperCase()}`;
      setInitResult({
        mode: 'wire_invoice',
        paymentMethod: 'wire',
        reference: wireRef,
        vehicleTitle,
        stockCode: activeCar.stockCode,
        amountFormatted: formatted,
        currency,
        wireRail: 'International SWIFT / ACH / Faster Payments / SEPA',
        notice:
          'Use this Proforma Wire Reference with our sales desk to receive signed bank coordinates in your chosen currency.',
      });
      return true;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.trim();
    if (publicKey) {
      const clientRef = `MCH_PS_${Date.now().toString(36).toUpperCase()}`;
      setInitResult({
        mode: 'live',
        paymentMethod: 'card',
        reference: clientRef,
        vehicleTitle,
        stockCode: activeCar.stockCode,
        amountFormatted: formatted,
        currency,
      });
      try {
        const popup = new Paystack();
        popup.newTransaction({
          key: publicKey,
          email: email.trim(),
          amount: convertedAmount * 100,
          currency,
          channels: ['card', 'apple_pay'],
          reference: clientRef,
          metadata: {
            stockCode: activeCar.stockCode,
            vehicleTitle,
            buyerName: fullName.trim(),
            buyerPhone: phone.trim(),
          },
          onSuccess: (tx: { reference?: string }) => {
            setPopupNote(`Payment completed (Ref: ${tx?.reference || clientRef}).`);
          },
          onCancel: () => {
            setPopupNote('Checkout window closed before completion.');
          },
          onError: (err: { message?: string }) => {
            setErrorMsg(
              err?.message ||
                'Card checkout could not start in static mode. Switch to International Bank Wire above.'
            );
          },
        });
      } catch {
        setErrorMsg('Unable to open Paystack popup. Try International Bank Wire above.');
      }
      return true;
    }

    setErrorMsg(
      'Static hosting (GitHub Pages) does not run the Node payment server. Use International Bank Wire above or deploy the Node server for live Paystack API checkout.'
    );
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPopupNote(null);
    setVerifyResult(null);
    setCopiedWire(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockCode: activeCar.stockCode,
          email: email.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          paymentType,
          paymentMethod,
          currency,
        }),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (!isJson) {
        handleStaticFallback();
        return;
      }

      const data = (await response.json()) as InitResult & { error?: string };
      if (!response.ok) {
        setErrorMsg(data.error || 'Could not initialize payment session.');
        return;
      }

      setInitResult(data);

      if (data.mode === 'live' && data.accessCode) {
        launchPaystackPopup(data.accessCode, data.reference);
      }
    } catch {
      handleStaticFallback();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="payments"
      aria-labelledby="payments-heading"
      className="py-16 lg:py-24 border-t border-b border-black/10 bg-[#F3F1EC]"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-black/10">
          <div>
            <p className="text-[13px] font-medium text-[#5C5E64] mb-2">
              Paystack Gateway · Global Multi-Currency Vehicle Payments
            </p>
            <h2
              id="payments-heading"
              className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-[#141416]"
              style={{ textWrap: 'balance' }}
            >
              Reserve or Pay Online
            </h2>
          </div>

          <p className="text-sm text-[#5C5E64] max-w-md leading-relaxed">
            Place a refundable $500 vehicle hold, submit a 25% allocation down payment, or reserve for full settlement with any international phone number using Visa, Mastercard, Apple Pay, or Global Bank Wire.
          </p>
        </div>

        {/* Balanced 2-Column Payment Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-10 items-stretch">
          {/* Left Column: Selected Vehicle Summary & Payment Guarantees */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 bg-white border border-black/10 rounded-xl p-6 lg:p-8">
            <div className="space-y-5">
              <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-[#ECEAE4]">
                <CarImage
                  src={activeCar.image}
                  alt={`${activeCar.year} ${activeCar.make} ${activeCar.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#5C5E64] mb-1">
                  <span
                    className={
                      activeCar.conditionType === 'Brand New'
                        ? 'text-[#C8321E] font-semibold'
                        : 'text-[#141416] font-semibold'
                    }
                  >
                    {activeCar.conditionType} · {activeCar.year}
                  </span>
                  <span className="font-mono tabular-nums">{activeCar.stockCode}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#141416]">
                  {activeCar.make} {activeCar.model}
                </h3>
                <p className="text-xs text-[#5C5E64] mt-0.5">
                  {activeCar.trim} · {activeCar.exteriorColor} / {activeCar.interiorTrim}
                </p>

                <div className="mt-4 pt-4 border-t border-black/10 flex items-baseline justify-between">
                  <span className="text-xs text-[#5C5E64]">Showroom Asking Price</span>
                  <span className="font-mono tabular-nums text-lg font-semibold text-[#141416]">
                    ${activeCar.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onInspectCar(activeCar)}
                className="text-xs font-semibold text-[#141416] underline underline-offset-4 hover:text-[#C8321E] cursor-pointer"
              >
                Inspect vehicle angles &amp; condition sheet
              </button>
            </div>

            <div className="pt-5 border-t border-black/10 space-y-3 text-xs text-[#5C5E64]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C8321E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#141416] font-medium">72-Hour Hold Protection:</strong>{' '}
                  Hold deposits take the selected stock code off active listings while final physical inspection or pre-shipment checks are completed.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Landmark className="w-4 h-4 text-[#141416] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#141416] font-medium">Global Cards, Apple Pay &amp; Wire:</strong>{' '}
                  Card checkout routes directly to Visa, Mastercard, and Apple Pay via Paystack, while International Bank Wire issues a SWIFT / US ACH / UK Faster Payments / EUR SEPA reference worldwide.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Paystack Payment Form */}
          <div className="lg:col-span-7 bg-white border border-black/10 rounded-xl p-6 lg:p-8 flex flex-col justify-between">
            {initResult ? (
              <div className="space-y-6 my-auto">
                <div className="flex items-center gap-2.5 text-base font-semibold text-[#141416]">
                  <CheckCircle2 className="w-5 h-5 text-[#C8321E]" />
                  <span>
                    {verifyResult?.verified
                      ? 'Payment Confirmed'
                      : initResult.mode === 'wire_invoice'
                        ? 'Proforma Wire Reservation Ready'
                        : initResult.mode === 'live'
                          ? 'Paystack Card Checkout Ready'
                          : 'Payment Reference Initialized'}
                  </span>
                </div>

                <div className="border-t border-b border-black/10 py-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#5C5E64]">Vehicle</span>
                    <span className="font-medium text-[#141416] text-right">
                      {initResult.vehicleTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#5C5E64]">Stock Code</span>
                    <span className="font-mono tabular-nums text-[#141416]">
                      {initResult.stockCode}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#5C5E64]">
                      {initResult.mode === 'wire_invoice' ? 'Wire Reference' : 'Transaction Reference'}
                    </span>
                    <span className="font-mono tabular-nums text-[#141416]">
                      {initResult.reference}
                    </span>
                  </div>
                  {initResult.wireRail && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[#5C5E64]">Transfer Rail</span>
                      <span className="font-medium text-[#141416] text-right">
                        {initResult.wireRail}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-[#5C5E64]">
                      {initResult.mode === 'wire_invoice' ? 'Invoice Amount' : 'Paystack Amount'}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#141416]">
                      {initResult.amountFormatted} ({initResult.currency})
                    </span>
                  </div>
                </div>

                {initResult.settlementNotice && (
                  <p className="text-xs text-[#141416] leading-relaxed bg-[#F8F7F4] border border-black/10 rounded-lg p-3.5">
                    {initResult.settlementNotice}
                  </p>
                )}

                {initResult.notice && (
                  <p className="text-xs text-[#5C5E64] leading-relaxed bg-[#F8F7F4] border border-black/8 rounded-lg p-3.5">
                    {initResult.notice}
                  </p>
                )}

                {popupNote && (
                  <p className="text-xs text-[#5C5E64] leading-relaxed">{popupNote}</p>
                )}

                {errorMsg && (
                  <p className="text-xs font-medium text-[#C8321E]" role="alert">
                    {errorMsg}
                  </p>
                )}

                {verifyResult && (
                  <div className="p-4 bg-[#F8F7F4] border border-black/10 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-[#141416]">
                      Verification Status: {verifyResult.status}
                    </p>
                    {verifyResult.message && (
                      <p className="text-[#5C5E64]">{verifyResult.message}</p>
                    )}
                  </div>
                )}

                {initResult.mode === 'wire_invoice' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyWireSummary(initResult)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#141416] hover:bg-[#2B2B30] rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedWire ? (
                        <>
                          <Check className="w-4 h-4 text-[#C8321E]" />
                          Wire Summary Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Wire Reference
                        </>
                      )}
                    </button>

                    <a
                      href={SELLER_CHANNELS.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Get Bank Coordinates on WhatsApp
                    </a>

                    <a
                      href={SELLER_CHANNELS.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#141416] bg-[#F3F1EC] hover:bg-[#E5E2DA] rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Telegram {SELLER_CHANNELS.telegramHandle}
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setInitResult(null);
                        setVerifyResult(null);
                        setPopupNote(null);
                        setErrorMsg(null);
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-[#5C5E64] hover:text-[#141416] cursor-pointer"
                    >
                      Change Method
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    {initResult.mode === 'live' && initResult.accessCode && !verifyResult?.verified && (
                      <button
                        type="button"
                        onClick={() =>
                          launchPaystackPopup(initResult.accessCode!, initResult.reference)
                        }
                        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        Open Paystack Popup
                      </button>
                    )}

                    {initResult.mode === 'live' &&
                      initResult.authorizationUrl &&
                      initResult.authorizationUrl.startsWith('https://checkout.paystack.com/') &&
                      !verifyResult?.verified && (
                        <a
                          href={initResult.authorizationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#141416] bg-[#F3F1EC] hover:bg-[#E5E2DA] rounded-lg transition-colors"
                        >
                          Open Hosted Checkout
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleVerifyStatus(initResult.reference)}
                      className="px-4 py-2.5 text-sm font-semibold text-[#141416] border border-black/15 hover:border-[#141416] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isVerifying ? 'Checking Status...' : 'Verify Payment Status'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInitResult(null);
                        setVerifyResult(null);
                        setPopupNote(null);
                        setErrorMsg(null);
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-[#5C5E64] hover:text-[#141416] cursor-pointer"
                    >
                      New Payment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#141416]">
                      Checkout Details
                    </h3>
                    <p className="text-xs text-[#5C5E64] mt-0.5">
                      Server-authoritative pricing locked to selected stock unit.
                    </p>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#C8321E] shrink-0" />
                </div>

                {serverConfigured === false && (
                  <p className="text-xs text-[#5C5E64] bg-[#F8F7F4] border border-black/10 rounded-lg p-3 leading-relaxed">
                    <strong className="text-[#141416] font-semibold">Sandbox Preview Mode:</strong>{' '}
                    Add <code className="font-mono text-[#141416]">PAYSTACK_SECRET_KEY</code> in Settings &rarr; Secrets to enable live Paystack checkout.
                  </p>
                )}

                <div>
                  <label
                    htmlFor="section-paystack-vehicle"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Select Vehicle ({CAR_INVENTORY.length} Units)
                  </label>
                  <select
                    id="section-paystack-vehicle"
                    value={activeCar.stockCode}
                    onChange={(e) => setSelectedStockCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                  >
                    {CAR_INVENTORY.map((car) => (
                      <option key={car.id} value={car.stockCode}>
                        {car.stockCode} — {car.year} {car.make} {car.model} ({car.conditionType}) · $
                        {car.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <span className="block text-xs font-medium text-[#141416] mb-1.5">
                      Payment Option
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#ECEAE4] rounded-lg">
                      {(
                        [
                          ['deposit', '$500 Hold'],
                          ['downpayment', '25% Down'],
                          ['full', 'Full Pay'],
                        ] as [PaymentType, string][]
                      ).map(([typeKey, label]) => (
                        <button
                          key={typeKey}
                          type="button"
                          onClick={() => setPaymentType(typeKey)}
                          className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                            paymentType === typeKey
                              ? 'bg-white text-[#141416] shadow-xs'
                              : 'text-[#5C5E64] hover:text-[#141416]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="section-paystack-currency"
                      className="block text-xs font-medium text-[#141416] mb-1.5"
                    >
                      Display Currency
                    </label>
                    <select
                      id="section-paystack-currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] font-mono focus:outline-none focus:border-[#141416]"
                    >
                      {(Object.keys(CURRENCY_FX) as CurrencyCode[]).map((code) => (
                        <option key={code} value={code}>
                          {CURRENCY_FX[code].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#141416] mb-1.5">
                    Payment Method
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-[#ECEAE4] rounded-lg">
                    {(
                      [
                        ['card', 'Global Card / Apple Pay'],
                        ['wire', 'International Bank Wire'],
                      ] as [PaymentMethod, string][]
                    ).map(([methodKey, label]) => (
                      <button
                        key={methodKey}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(methodKey);
                          setErrorMsg(null);
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          paymentMethod === methodKey
                            ? 'bg-white text-[#141416] shadow-xs'
                            : 'text-[#5C5E64] hover:text-[#141416]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#5C5E64] mt-1.5 leading-relaxed">
                    {paymentMethod === 'card'
                      ? 'Opens direct Card & Apple Pay checkout (Visa, Mastercard, Apple Pay) worldwide.'
                      : 'Issues a Proforma Wire Reference for SWIFT, US ACH, UK Faster Payments, or EUR SEPA bank transfers with no card limit.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="section-paystack-name"
                      className="block text-xs font-medium text-[#141416] mb-1.5"
                    >
                      Buyer Full Name
                    </label>
                    <input
                      id="section-paystack-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full legal name"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="section-paystack-phone"
                      className="block text-xs font-medium text-[#141416] mb-1.5"
                    >
                      International Phone / WhatsApp
                    </label>
                    <InternationalPhoneInput
                      id="section-paystack-phone"
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="section-paystack-email"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Receipt Email Address
                  </label>
                  <input
                    id="section-paystack-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-[#C8321E]" role="alert">
                    {errorMsg}
                  </p>
                )}

                <div className="pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#5C5E64]">
                      <Lock className="w-3.5 h-3.5" />
                      Total Due ({currency})
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono tabular-nums text-2xl font-semibold text-[#141416]">
                        {fx.symbol}
                        {convertedAmount.toLocaleString()}
                      </span>
                      {currency !== 'USD' && (
                        <span className="font-mono tabular-nums text-xs text-[#5C5E64]">
                          (${usdAmount.toLocaleString()} USD)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    {isSubmitting
                      ? paymentMethod === 'wire'
                        ? 'Creating Wire Reference...'
                        : 'Launching Paystack...'
                      : paymentMethod === 'wire'
                        ? `Generate ${fx.symbol}${convertedAmount.toLocaleString()} Wire Ref`
                        : `Pay ${fx.symbol}${convertedAmount.toLocaleString()} Now`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
