import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { CAR_INVENTORY } from './src/data/cars.ts';

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';

const DEPOSIT_USD = 500;

const FX_FROM_USD: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  GBP: { rate: 0.79, symbol: '£' },
  EUR: { rate: 0.92, symbol: '€' },
  CAD: { rate: 1.38, symbol: 'C$' },
  AUD: { rate: 1.54, symbol: 'A$' },
  AED: { rate: 3.67, symbol: 'AED ' },
};

const PAYSTACK_DIRECT_CURRENCIES = new Set(['USD']);
const GATEWAY_FALLBACK_CURRENCY = 'NGN';
const GATEWAY_FALLBACK_RATE = 1600;
const REFERENCE_REGEX = /^[A-Za-z0-9_-]{6,64}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOST_REGEX = /^[a-zA-Z0-9.-]+(:\d{1,5})?$/;
const MAX_PREVIEW_ENTRIES = 500;

function isValidInternationalPhone(rawPhone: string): boolean {
  const trimmed = rawPhone.trim();
  if (!/^[+\d\s().-]{7,24}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

interface PreviewTransaction {
  reference: string;
  stockCode: string;
  vehicleTitle: string;
  email: string;
  fullName: string;
  phone: string;
  paymentType: 'deposit' | 'downpayment' | 'full';
  currency: string;
  amountMajor: number;
  amountSubunit: number;
  createdAt: string;
}

interface WireReservation {
  reference: string;
  stockCode: string;
  vehicleTitle: string;
  email: string;
  fullName: string;
  phone: string;
  paymentType: 'deposit' | 'downpayment' | 'full';
  currency: string;
  amountFormatted: string;
  usdAmountFormatted: string;
  wireRail: string;
  createdAt: string;
}

const previewTransactions = new Map<string, PreviewTransaction>();
const wireReservations = new Map<string, WireReservation>();

const WIRE_RAILS: Record<string, string> = {
  USD: 'USD SWIFT / US ACH Wire Transfer',
  GBP: 'GBP UK Faster Payments / International SWIFT',
  EUR: 'EUR SEPA Transfer / International SWIFT',
  CAD: 'CAD EFT / International SWIFT',
  AUD: 'AUD BSB / International SWIFT',
  AED: 'AED UAEFTS / International SWIFT',
};

function getSafeBaseUrl(req: Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured && configured !== 'MY_APP_URL' && /^https?:\/\/[^/\s]+/i.test(configured)) {
    return configured.replace(/\/$/, '');
  }
  const host = req.get('host')?.trim() || '';
  if (HOST_REGEX.test(host)) {
    const proto = req.protocol === 'https' ? 'https' : 'http';
    return `${proto}://${host}`;
  }
  return `http://localhost:${PORT}`;
}

function formatMoney(amountMajor: number, currency: string): string {
  const entry = FX_FROM_USD[currency] || FX_FROM_USD.USD;
  return `${entry.symbol}${Math.round(amountMajor).toLocaleString()}`;
}

async function callPaystackInitialize(
  secretKey: string,
  params: {
    email: string;
    amountSubunit: number;
    currency: string;
    reference: string;
    callbackUrl: string;
    channels?: string[];
    metadata: Record<string, unknown>;
  }
) {
  const payloadBody: Record<string, unknown> = {
    email: params.email,
    amount: params.amountSubunit,
    currency: params.currency,
    reference: params.reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
  };
  if (params.channels && params.channels.length > 0) {
    payloadBody.channels = params.channels;
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadBody),
  });

  const payload = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: {
      authorization_url?: string;
      access_code?: string;
      reference?: string;
    };
  };

  return { ok: response.ok, payload };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Raw body capture for Paystack webhook signature verification
  app.use(
    '/api/paystack/webhook',
    express.raw({ type: 'application/json', limit: '128kb' })
  );

  app.use(express.json({ limit: '64kb' }));

  // Paystack public configuration (never returns secret key)
  app.get('/api/paystack/config', (_req: Request, res: Response) => {
    const secretConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
    const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY?.trim() || '';
    res.json({
      configured: secretConfigured,
      publicKey,
      supportedCurrencies: Object.keys(FX_FROM_USD),
      depositUsd: DEPOSIT_USD,
    });
  });

  // Initialize Paystack checkout using server-authoritative vehicle price
  app.post('/api/paystack/initialize', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const stockCode = typeof body.stockCode === 'string' ? body.stockCode.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const paymentType: 'deposit' | 'downpayment' | 'full' =
      body.paymentType === 'full'
        ? 'full'
        : body.paymentType === 'downpayment'
          ? 'downpayment'
          : 'deposit';
    const paymentMethod: 'card' | 'wire' =
      body.paymentMethod === 'wire' ? 'wire' : 'card';
    const rawCurrency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : 'USD';
    const displayCurrency = FX_FROM_USD[rawCurrency] ? rawCurrency : 'USD';

    if (!stockCode || !EMAIL_REGEX.test(email) || fullName.length < 2 || !isValidInternationalPhone(phone)) {
      res.status(400).json({
        error: 'Please provide a valid vehicle, full name, email address, and international phone number.',
      });
      return;
    }

    const car = CAR_INVENTORY.find((item) => item.stockCode === stockCode);
    if (!car) {
      res.status(404).json({ error: 'Selected vehicle was not found in showroom inventory.' });
      return;
    }

    const usdAmount =
      paymentType === 'full'
        ? car.price
        : paymentType === 'downpayment'
          ? Math.round(car.price * 0.25)
          : DEPOSIT_USD;
    const displayFx = FX_FROM_USD[displayCurrency];
    const displayAmountMajor = Math.round(usdAmount * displayFx.rate);
    const displayAmountFormatted = formatMoney(displayAmountMajor, displayCurrency);
    const usdAmountFormatted = formatMoney(usdAmount, 'USD');
    const vehicleTitle = `${car.year} ${car.make} ${car.model} ${car.trim}`;

    if (paymentMethod === 'wire') {
      const wireReference = `MCH_WIRE_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const wireRail = WIRE_RAILS[displayCurrency] || WIRE_RAILS.USD;
      if (wireReservations.size >= MAX_PREVIEW_ENTRIES) {
        const oldestKey = wireReservations.keys().next().value;
        if (oldestKey) wireReservations.delete(oldestKey);
      }
      wireReservations.set(wireReference, {
        reference: wireReference,
        stockCode: car.stockCode,
        vehicleTitle,
        email,
        fullName,
        phone,
        paymentType,
        currency: displayCurrency,
        amountFormatted: displayAmountFormatted,
        usdAmountFormatted,
        wireRail,
        createdAt: new Date().toISOString(),
      });

      res.json({
        mode: 'wire_invoice',
        configured: true,
        paymentMethod: 'wire',
        reference: wireReference,
        vehicleTitle,
        stockCode: car.stockCode,
        paymentType,
        currency: displayCurrency,
        displayCurrency,
        displayAmountFormatted,
        usdAmountFormatted,
        amountMajor: displayAmountMajor,
        amountSubunit: displayAmountMajor * 100,
        amountFormatted: displayAmountFormatted,
        wireRail,
        notice:
          'Use this Proforma Wire Reference with our sales desk to receive signed SWIFT, IBAN, US ACH, or UK Faster Payments bank coordinates in your chosen currency.',
      });
      return;
    }

    const reference = `MCH_PS_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const selectedChannels = ['card', 'apple_pay'];

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

    if (!secretKey) {
      if (previewTransactions.size >= MAX_PREVIEW_ENTRIES) {
        const oldestKey = previewTransactions.keys().next().value;
        if (oldestKey) previewTransactions.delete(oldestKey);
      }
      previewTransactions.set(reference, {
        reference,
        stockCode: car.stockCode,
        vehicleTitle,
        email,
        fullName,
        phone,
        paymentType,
        currency: displayCurrency,
        amountMajor: displayAmountMajor,
        amountSubunit: displayAmountMajor * 100,
        createdAt: new Date().toISOString(),
      });

      res.json({
        mode: 'sandbox_preview',
        configured: false,
        paymentMethod,
        reference,
        vehicleTitle,
        stockCode: car.stockCode,
        paymentType,
        currency: displayCurrency,
        displayCurrency,
        displayAmountFormatted,
        amountMajor: displayAmountMajor,
        amountSubunit: displayAmountMajor * 100,
        amountFormatted: displayAmountFormatted,
        notice:
          'PAYSTACK_SECRET_KEY is not configured in server secrets yet. Add your Paystack sk_test_ or sk_live_ key in Settings -> Secrets to enable live Paystack checkout.',
      });
      return;
    }

    try {
      const appUrl = getSafeBaseUrl(req);
      const callbackUrl = `${appUrl}/?paystack_ref=${encodeURIComponent(reference)}`;

      const baseMetadata = {
        stockCode: car.stockCode,
        vehicleTitle,
        conditionType: car.conditionType,
        paymentType,
        paymentMethod,
        buyerName: fullName,
        buyerPhone: phone,
        displayCurrency,
        displayAmountFormatted,
      };

      let settledCurrency = PAYSTACK_DIRECT_CURRENCIES.has(displayCurrency)
        ? displayCurrency
        : 'USD';
      let settledAmountMajor = Math.round(usdAmount * FX_FROM_USD[settledCurrency].rate);
      let settledAmountSubunit = settledAmountMajor * 100;
      let activeChannels = selectedChannels;

      let initAttempt = await callPaystackInitialize(secretKey, {
        email,
        amountSubunit: settledAmountSubunit,
        currency: settledCurrency,
        reference,
        callbackUrl,
        channels: activeChannels,
        metadata: baseMetadata,
      });

      const errMsgLower = (initAttempt.payload?.message || '').toLowerCase();
      let settlementNotice: string | undefined;

      // Internal gateway fallback if international currency settlement is pending activation on merchant dashboard
      if (
        (!initAttempt.ok || !initAttempt.payload.status) &&
        settledCurrency !== GATEWAY_FALLBACK_CURRENCY &&
        (errMsgLower.includes('currency') || errMsgLower.includes('supported'))
      ) {
        settledCurrency = GATEWAY_FALLBACK_CURRENCY;
        settledAmountMajor = Math.round(usdAmount * GATEWAY_FALLBACK_RATE);
        settledAmountSubunit = settledAmountMajor * 100;

        initAttempt = await callPaystackInitialize(secretKey, {
          email,
          amountSubunit: settledAmountSubunit,
          currency: GATEWAY_FALLBACK_CURRENCY,
          reference,
          callbackUrl,
          channels: activeChannels,
          metadata: baseMetadata,
        });

        settlementNotice = `Authorized for ${displayAmountFormatted} ${displayCurrency} (${usdAmountFormatted} USD equivalent). Global Visa, Mastercard, and Apple Pay cards are accepted.`;
      } else if (settledCurrency !== displayCurrency) {
        settlementNotice = `Authorized for ${displayAmountFormatted} ${displayCurrency} (${formatMoney(settledAmountMajor, settledCurrency)} ${settledCurrency}). Global Visa, Mastercard, and Apple Pay cards are accepted.`;
      }

      // Fallback to card-only if a channel flag such as apple_pay isn't accepted for the session
      if (
        (!initAttempt.ok || !initAttempt.payload.status) &&
        activeChannels.includes('apple_pay') &&
        (initAttempt.payload?.message || '').toLowerCase().includes('channel')
      ) {
        activeChannels = ['card'];
        initAttempt = await callPaystackInitialize(secretKey, {
          email,
          amountSubunit: settledAmountSubunit,
          currency: settledCurrency,
          reference,
          callbackUrl,
          channels: activeChannels,
          metadata: baseMetadata,
        });
      }

      const authUrl = initAttempt.payload?.data?.authorization_url || '';
      if (
        !initAttempt.ok ||
        !initAttempt.payload.status ||
        !authUrl.startsWith('https://checkout.paystack.com/')
      ) {
        const rawPaystackError =
          initAttempt.payload?.message || 'Unable to initialize Paystack checkout session.';
        const lowerPaystackError = rawPaystackError.toLowerCase();
        const friendlyError =
          lowerPaystackError.includes('cannot be processed online') ||
          lowerPaystackError.includes('watch your spending') ||
          lowerPaystackError.includes('limit')
            ? "This full vehicle amount exceeds Paystack's single-transaction online card limit. Choose $500 Hold or 25% Down by Card, or switch to Global Bank Wire (SWIFT / ACH / SEPA) for full invoice settlement."
            : rawPaystackError;

        res.status(502).json({
          error: friendlyError,
        });
        return;
      }

      res.json({
        mode: 'live',
        configured: true,
        paymentMethod,
        channels: activeChannels,
        reference: initAttempt.payload.data?.reference || reference,
        authorizationUrl: authUrl,
        accessCode: initAttempt.payload.data?.access_code || '',
        vehicleTitle,
        stockCode: car.stockCode,
        paymentType,
        currency: displayCurrency,
        displayCurrency,
        displayAmountFormatted,
        amountMajor: displayAmountMajor,
        amountSubunit: settledAmountSubunit,
        amountFormatted: displayAmountFormatted,
        settlementNotice,
      });
    } catch {
      res.status(502).json({
        error: 'Network error communicating with Paystack API. Please try again.',
      });
    }
  });

  // Verify Paystack transaction or Global Wire reservation status on the server
  app.get('/api/paystack/verify/:reference', async (req: Request, res: Response) => {
    const rawRef = typeof req.params.reference === 'string' ? req.params.reference.trim() : '';
    if (!REFERENCE_REGEX.test(rawRef)) {
      res.status(400).json({ error: 'Invalid transaction reference format.' });
      return;
    }

    const wireEntry = wireReservations.get(rawRef);
    if (wireEntry) {
      res.json({
        mode: 'wire_invoice',
        verified: false,
        status: 'awaiting_wire_confirmation',
        reference: wireEntry.reference,
        vehicleTitle: wireEntry.vehicleTitle,
        stockCode: wireEntry.stockCode,
        amountFormatted: wireEntry.amountFormatted,
        currency: wireEntry.currency,
        message: `Wire reservation active via ${wireEntry.wireRail}. Send this reference on WhatsApp or Telegram to receive signed transfer instructions.`,
      });
      return;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
    if (!secretKey) {
      const preview = previewTransactions.get(rawRef);
      if (!preview) {
        res.status(404).json({ error: 'Preview transaction reference not found.' });
        return;
      }
      res.json({
        mode: 'sandbox_preview',
        verified: false,
        status: 'awaiting_live_key',
        reference: preview.reference,
        vehicleTitle: preview.vehicleTitle,
        amountFormatted: formatMoney(preview.amountMajor, preview.currency),
        currency: preview.currency,
        message: 'Preview reservation initialized. Configure PAYSTACK_SECRET_KEY to verify live payments.',
      });
      return;
    }

    try {
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(rawRef)}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );

      const data = (await verifyResponse.json()) as {
        status?: boolean;
        message?: string;
        data?: {
          status?: string;
          reference?: string;
          amount?: number;
          currency?: string;
          channel?: string;
          paid_at?: string;
          metadata?: {
            vehicleTitle?: string;
            stockCode?: string;
            displayCurrency?: string;
            displayAmountFormatted?: string;
          };
        };
      };

      if (!verifyResponse.ok || !data.status || !data.data) {
        res.status(502).json({ error: data?.message || 'Paystack verification failed.' });
        return;
      }

      const tx = data.data;
      const currency = tx.metadata?.displayCurrency || tx.currency || 'USD';
      const amountMajor = typeof tx.amount === 'number' ? tx.amount / 100 : 0;

      res.json({
        mode: 'live',
        verified: tx.status === 'success',
        status: tx.status || 'unknown',
        reference: tx.reference || rawRef,
        vehicleTitle: tx.metadata?.vehicleTitle || 'Vehicle Order',
        stockCode: tx.metadata?.stockCode || '',
        amountFormatted: tx.metadata?.displayAmountFormatted || formatMoney(amountMajor, currency),
        currency,
        channel: tx.channel || 'card',
        paidAt: tx.paid_at || '',
      });
    } catch {
      res.status(502).json({ error: 'Failed to verify Paystack transaction.' });
    }
  });

  // Paystack webhook with HMAC-SHA512 signature check
  app.post('/api/paystack/webhook', (req: Request, res: Response) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
    if (!secretKey) {
      res.status(200).json({ received: true, mode: 'unconfigured' });
      return;
    }

    const signature = req.get('x-paystack-signature') || '';
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    const expected = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      res.status(401).json({ error: 'Invalid Paystack webhook signature.' });
      return;
    }

    res.status(200).json({ received: true });
  });

  // Mount Vite middlewares in development or serve production build in dist/
  if (NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.resolve(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Morgan Car Hub server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
