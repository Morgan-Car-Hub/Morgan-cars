import { useEffect, useState, type FormEvent } from 'react';
import Paystack from '@paystack/inline-js';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CAR_INVENTORY, SELLER_CHANNELS, type CarListing } from '../data/cars';
import { InternationalPhoneInput } from './InternationalPhoneInput';

interface PaystackCheckoutModalProps {
  car: CarListing | null;
  isOpen: boolean;
  initialReference?: string | null;
  onClose: () => void;
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
  stockCode?: string;
  currency?: string;
  amountFormatted: string;
  channel?: string;
  message?: string;
}

export function PaystackCheckoutModal({
  car,
  isOpen,
  initialReference = null,
  onClose,
}: PaystackCheckoutModalProps) {
  const [selectedStockCode, setSelectedStockCode] = useState<string>(
    car?.stockCode ?? CAR_INVENTORY[0].stockCode
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
    if (car) {
      setSelectedStockCode(car.stockCode);
    }
  }, [car]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setPopupNote(null);
    setInitResult(null);
    setVerifyResult(null);
    setCopiedWire(false);

    if (window.location.hostname.endsWith('.github.io')) {
      setServerConfigured(false);
    } else {
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
    }

    if (initialReference) {
      setIsVerifying(true);
      fetch(`/api/paystack/verify/${encodeURIComponent(initialReference)}`)
        .then(async (res) => {
          const isJson = res.headers.get('content-type')?.includes('application/json');
          if (!isJson) return;
          const data = (await res.json()) as VerifyResult & { error?: string };
          if (!res.ok) {
            setErrorMsg(data.error || 'Verification failed.');
            return;
          }
          setVerifyResult(data);
          setInitResult({
            mode: data.mode,
            reference: data.reference,
            vehicleTitle: data.vehicleTitle,
            stockCode: data.stockCode || car?.stockCode || 'VERIFIED',
            amountFormatted: data.amountFormatted,
            currency: data.currency || 'USD',
          });
        })
        .catch(() => {
          setErrorMsg('Failed to verify Paystack transaction.');
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [isOpen, initialReference, car]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCar =
    CAR_INVENTORY.find((item) => item.stockCode === selectedStockCode) ?? CAR_INVENTORY[0];
  const usdTotal =
    paymentType === 'full'
      ? activeCar.price
      : paymentType === 'downpayment'
        ? Math.round(activeCar.price * 0.25)
        : DEPOSIT_USD;
  const fx = CURRENCY_FX[currency];
  const convertedAmount = Math.round(usdTotal * fx.rate);

  const handleVerifyReference = async (ref: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/paystack/verify/${encodeURIComponent(ref)}`);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!isJson) {
        setPopupNote(
          'Payment receipt status is verified directly by the backend server or Paystack dashboard.'
        );
        return;
      }
      const data = (await res.json()) as VerifyResult & { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || 'Verification failed.');
        return;
      }
      setVerifyResult(data);
    } catch {
      setErrorMsg('Failed to verify Paystack transaction.');
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
          void handleVerifyReference(ref);
        },
        onCancel: () => {
          setPopupNote(
            'Checkout window closed before completion. You can reopen the popup or use Hosted Checkout below.'
          );
        },
        onError: (err: { message?: string }) => {
          setErrorMsg(
            err?.message ||
              'Popup interrupted. Click "Open Hosted Checkout" below to complete payment.'
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

  const handleInitialize = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPopupNote(null);
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
        setErrorMsg(data.error || 'Could not initialize Paystack checkout.');
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paystack-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#F8F7F4] text-[#141416] rounded-2xl shadow-2xl border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-[#C8321E]" />
            <span className="font-display text-sm font-semibold">
              Paystack Payment Gateway
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Paystack checkout"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-black/10 text-[#141416] hover:bg-[#141416] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div>
            <h2
              id="paystack-modal-title"
              className="font-display text-2xl font-semibold text-[#141416] tracking-tight"
            >
              Reserve or Pay via Paystack
            </h2>
            <p className="text-xs text-[#5C5E64] mt-1">
              International checkout supporting any global phone number with Card / Apple Pay (via Paystack) or Global Bank Wire (SWIFT, ACH, SEPA).
            </p>
          </div>

          {serverConfigured === false && (
            <div className="p-4 bg-white border border-black/12 rounded-xl text-xs text-[#5C5E64] leading-relaxed">
              <strong className="text-[#141416] font-semibold block mb-1">
                Gateway Mode: Sandbox Preview
              </strong>
              Set <code className="font-mono text-[#141416]">PAYSTACK_SECRET_KEY</code> in Settings
              &rarr; Secrets to enable live Paystack checkout.
            </div>
          )}

          {initResult ? (
            <div className="bg-white border border-black/10 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#141416]">
                <CheckCircle2 className="w-5 h-5 text-[#C8321E]" />
                <span>
                  {verifyResult?.verified
                    ? 'Payment Confirmed'
                    : initResult.mode === 'wire_invoice'
                      ? 'Proforma Wire Reservation Ready'
                      : initResult.mode === 'live'
                        ? 'Paystack Card Checkout Ready'
                        : 'Preview Checkout Initialized'}
                </span>
              </div>

              <div className="border-t border-b border-black/10 py-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Vehicle</span>
                  <span className="font-medium text-[#141416] text-right">
                    {initResult.vehicleTitle}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">Stock Reference</span>
                  <span className="font-mono tabular-nums text-[#141416]">
                    {initResult.stockCode}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5C5E64]">
                    {initResult.mode === 'wire_invoice' ? 'Wire Reference' : 'Transaction Ref'}
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
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Wire Ref
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
                    Get Bank Details on WhatsApp
                  </a>

                  <a
                    href={SELLER_CHANNELS.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#141416] bg-[#F3F1EC] hover:bg-[#E5E2DA] rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
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
                    Edit Order
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
                    onClick={() => handleVerifyReference(initResult.reference)}
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
                    Edit Order
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleInitialize} className="space-y-5">
              {/* Vehicle Selection */}
              <div className="bg-white border border-black/10 rounded-xl p-5 space-y-4">
                <div>
                  <label
                    htmlFor="paystack-vehicle"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Selected Vehicle
                  </label>
                  <select
                    id="paystack-vehicle"
                    value={activeCar.stockCode}
                    onChange={(e) => setSelectedStockCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                  >
                    {CAR_INVENTORY.map((item) => (
                      <option key={item.id} value={item.stockCode}>
                        {item.stockCode} — {item.year} {item.make} {item.model} ({item.conditionType}) · $
                        {item.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Option & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <span className="block text-xs font-medium text-[#141416] mb-1.5">
                      Payment Type
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#ECEAE4] rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPaymentType('deposit')}
                        className={`px-2 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          paymentType === 'deposit'
                            ? 'bg-white text-[#141416] shadow-xs'
                            : 'text-[#5C5E64] hover:text-[#141416]'
                        }`}
                      >
                        $500 Hold
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('downpayment')}
                        className={`px-2 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          paymentType === 'downpayment'
                            ? 'bg-white text-[#141416] shadow-xs'
                            : 'text-[#5C5E64] hover:text-[#141416]'
                        }`}
                      >
                        25% Down
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('full')}
                        className={`px-2 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          paymentType === 'full'
                            ? 'bg-white text-[#141416] shadow-xs'
                            : 'text-[#5C5E64] hover:text-[#141416]'
                        }`}
                      >
                        Full Pay
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="paystack-currency"
                      className="block text-xs font-medium text-[#141416] mb-1.5"
                    >
                      Display Currency
                    </label>
                    <select
                      id="paystack-currency"
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

                <div className="pt-3 border-t border-black/8 flex items-baseline justify-between">
                  <span className="text-xs text-[#5C5E64]">
                    {paymentType === 'deposit'
                      ? 'Refundable 72-Hour Vehicle Hold'
                      : paymentType === 'downpayment'
                        ? '25% Allocation & Shipping Deposit'
                        : 'Full Showroom Invoice'}
                  </span>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-xl font-semibold text-[#141416] block">
                      {fx.symbol}
                      {convertedAmount.toLocaleString()}
                    </span>
                    {currency !== 'USD' && (
                      <span className="font-mono tabular-nums text-[11px] text-[#5C5E64]">
                        (${usdTotal.toLocaleString()} USD)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-black/10 rounded-xl p-5 space-y-2">
                <span className="block text-xs font-medium text-[#141416]">
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
                      className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        paymentMethod === methodKey
                          ? 'bg-white text-[#141416] shadow-xs'
                          : 'text-[#5C5E64] hover:text-[#141416]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#5C5E64] leading-relaxed">
                  {paymentMethod === 'card'
                    ? 'Opens direct Card & Apple Pay checkout (Visa, Mastercard, Apple Pay) worldwide.'
                    : 'Generates a Proforma Wire Reference for SWIFT, US ACH, UK Faster Payments, or EUR SEPA bank transfers.'}
                </p>
              </div>

              {/* Buyer Details */}
              <div className="bg-white border border-black/10 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="paystack-name"
                      className="block text-xs font-medium text-[#141416] mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="paystack-name"
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
                      htmlFor="paystack-phone"
                      className="block text-xs font-medium text-[#141416] mb-1.5"
                    >
                      International Phone / WhatsApp
                    </label>
                    <InternationalPhoneInput
                      id="paystack-phone"
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="paystack-email"
                    className="block text-xs font-medium text-[#141416] mb-1.5"
                  >
                    Receipt Email Address
                  </label>
                  <input
                    id="paystack-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] focus:outline-none focus:border-[#141416]"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[#C8321E]" role="alert">
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#5C5E64]">
                  <Lock className="w-3.5 h-3.5" />
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {paymentMethod === 'wire'
                    ? 'Verified Dealership Wire Proforma'
                    : 'Secured via server-side Paystack API'}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#C8321E] hover:bg-[#AE2917] rounded-lg transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  {isSubmitting
                    ? paymentMethod === 'wire'
                      ? 'Generating Wire Ref...'
                      : 'Launching Paystack...'
                    : paymentMethod === 'wire'
                      ? `Generate ${fx.symbol}${convertedAmount.toLocaleString()} Wire Ref`
                      : `Pay ${fx.symbol}${convertedAmount.toLocaleString()} by Card`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
