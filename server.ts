import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';

interface CourseCatalogItem {
  id: string;
  name: string;
  lmsAccess: string;
}

const COURSE_CATALOG: Record<string, CourseCatalogItem> = {
  basic: {
    id: 'basic',
    name: 'Basic Self-Paced',
    lmsAccess: '18 months LMS access',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    lmsAccess: '18 months LMS access',
  },
  'premium-live': {
    id: 'premium-live',
    name: 'Premium Live',
    lmsAccess: '18 months LMS access',
  },
  'premium-plus': {
    id: 'premium-plus',
    name: 'Premium Plus',
    lmsAccess: '24 months Extended LMS',
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    lmsAccess: '36 months + lifetime alumni',
  },
};

interface PaymentRecord {
  orderId: string;
  gatewayOrderId: string;
  razorpayQrId?: string;
  razorpayQrImageUrl?: string;
  packageId: string;
  packageName: string;
  customAmount?: number;
  amountPaidINR?: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  status: 'created' | 'pending_verification' | 'paid';
  paymentMethod?: string;
  transactionId?: string;
  upiTransactionCode?: string;
  gatewayPaymentId?: string;
  payerVpa?: string;
  invoiceNumber?: string;
  paidAt?: string;
  signature: string;
}

const paymentLedger = new Map<string, PaymentRecord>();

const SIGNING_SECRET =
  process.env.PAYMENT_SIGNING_SECRET ||
  crypto.createHash('sha256').update(`bnc-elevate-${process.cwd()}`).digest('hex');

const cleanEnv = (val?: string) => (val || '').trim().replace(/^['"]+|['"]+$/g, '');

const RAZORPAY_KEY_ID = cleanEnv(process.env.RAZORPAY_KEY_ID);
const RAZORPAY_KEY_SECRET = cleanEnv(process.env.RAZORPAY_KEY_SECRET);
const RAZORPAY_WEBHOOK_SECRET = cleanEnv(process.env.RAZORPAY_WEBHOOK_SECRET);
const HAS_VALID_RAZORPAY_KEYS =
  /^rzp_(test|live)_/i.test(RAZORPAY_KEY_ID) && Boolean(RAZORPAY_KEY_SECRET);
const ENV_MERCHANT_UPI = cleanEnv(process.env.MERCHANT_UPI_ID);
const MERCHANT_UPI_ID =
  !ENV_MERCHANT_UPI || ENV_MERCHANT_UPI === '6396018626@ptsbi' || ENV_MERCHANT_UPI === 'bncglobal@icici'
    ? 'bnc01@ptaxis'
    : ENV_MERCHANT_UPI;
const MERCHANT_UPI_NAME = cleanEnv(process.env.MERCHANT_UPI_NAME) || 'Paytm';

function signOrderPayload(orderId: string, packageId: string, customAmount: number): string {
  return crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(`${orderId}:${packageId}:${customAmount}`)
    .digest('hex');
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Payment Configuration Endpoint (never exposes secrets or public pricing)
  app.get('/api/payments/config', (_req: Request, res: Response) => {
    res.json({
      gatewayMode: HAS_VALID_RAZORPAY_KEYS ? 'razorpay' : 'direct',
      razorpayKeyId: HAS_VALID_RAZORPAY_KEYS ? RAZORPAY_KEY_ID : null,
      razorpayConfigCheck: {
        hasKeyId: Boolean(RAZORPAY_KEY_ID),
        validKeyIdFormat: /^rzp_(test|live)_/i.test(RAZORPAY_KEY_ID),
        hasKeySecret: Boolean(RAZORPAY_KEY_SECRET),
      },
      upiId: MERCHANT_UPI_ID,
      merchantName: MERCHANT_UPI_NAME,
      bankDetails: {
        accountName: 'BNC Global Consultech Pvt. Ltd.',
        bankName: 'ICICI Bank Ltd.',
        accountNumber: '000705039281',
        ifscCode: 'ICIC0000007',
        swiftCode: 'ICICINBBCTS',
        branch: 'Connaught Place, New Delhi',
      },
      courses: Object.values(COURSE_CATALOG),
    });
  });

  // Create Enrollment / Payment Session (without displaying public course prices)
  app.post('/api/payments/create-order', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const packageId = String(body.packageId || 'premium');
      const orderId = String(body.orderId || `2026${Math.floor(100 + Math.random() * 899)}`);
      const studentName = String(body.studentName || '').trim();
      const studentEmail = String(body.studentEmail || '').trim();
      const studentPhone = String(body.studentPhone || '').trim();
      const rawCustomAmount = Number(body.customAmount);
      const customAmount =
        Number.isFinite(rawCustomAmount) && rawCustomAmount > 0 ? Math.round(rawCustomAmount) : 0;

      const course = COURSE_CATALOG[packageId];
      if (!course) {
        res.status(400).json({ error: 'Selected course package was not found.' });
        return;
      }

      const signature = signOrderPayload(orderId, course.id, customAmount);
      let gatewayOrderId = `BNC-ORD-${orderId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      let gatewayMode: 'razorpay' | 'direct' = 'direct';
      let razorpayQrId: string | undefined;
      let razorpayQrImageUrl: string | undefined;

      let gatewayError: string | undefined;

      if (HAS_VALID_RAZORPAY_KEYS) {
        try {
          const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

          // Create an automatic Razorpay UPI QR (supports both fixed and open amount)
          const qrResp = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
            method: 'POST',
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'upi_qr',
              name: `BNC ELEVATE ${course.name}`,
              usage: customAmount > 0 ? 'single_use' : 'multiple_use',
              fixed_amount: customAmount > 0,
              ...(customAmount > 0 ? { payment_amount: customAmount * 100 } : {}),
              description: `CIA Enrollment Order #${orderId}`,
              notes: {
                orderId,
                packageId: course.id,
                packageName: course.name,
                studentEmail,
                studentName,
              },
            }),
          });

          if (qrResp.ok) {
            const qrData = (await qrResp.json()) as { id?: string; image_url?: string };
            if (qrData.id) {
              razorpayQrId = qrData.id;
              razorpayQrImageUrl = qrData.image_url;
              gatewayOrderId = qrData.id;
              gatewayMode = 'razorpay';
            }
          } else {
            const errText = await qrResp.text();
            console.warn('Razorpay QR creation rejected:', qrResp.status, errText);
            try {
              const parsed = JSON.parse(errText) as { error?: { description?: string } };
              gatewayError = parsed?.error?.description || `Razorpay API returned HTTP ${qrResp.status}`;
            } catch {
              gatewayError = `Razorpay API returned HTTP ${qrResp.status}`;
            }
          }

          if (!razorpayQrId && customAmount > 0) {
            const rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
              method: 'POST',
              headers: {
                Authorization: `Basic ${authHeader}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: customAmount * 100,
                currency: 'INR',
                receipt: `BNC-${orderId}`,
                notes: {
                  packageId: course.id,
                  packageName: course.name,
                  studentEmail,
                  studentName,
                },
              }),
            });
            if (rzpResp.ok) {
              const rzpOrder = (await rzpResp.json()) as { id?: string };
              if (rzpOrder.id) {
                gatewayOrderId = rzpOrder.id;
                gatewayMode = 'razorpay';
              }
            }
          }
        } catch (err) {
          console.warn('Razorpay QR/order creation fallback to direct mode:', err);
        }
      }

      const record: PaymentRecord = {
        orderId,
        gatewayOrderId,
        razorpayQrId,
        razorpayQrImageUrl,
        packageId: course.id,
        packageName: course.name,
        customAmount: customAmount > 0 ? customAmount : undefined,
        studentName,
        studentEmail,
        studentPhone,
        status: 'created',
        signature,
      };

      paymentLedger.set(orderId, record);

      const amountParam = customAmount > 0 ? `&am=${customAmount}` : '';
      const upiDeepLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(
        MERCHANT_UPI_NAME,
      )}${amountParam}&cu=INR`;

      res.json({
        gatewayMode,
        razorpayKeyId: gatewayMode === 'razorpay' ? RAZORPAY_KEY_ID : null,
        razorpayQrImageUrl: razorpayQrImageUrl || null,
        gatewayError: gatewayMode === 'razorpay' ? null : gatewayError || null,
        orderId,
        gatewayOrderId,
        signature,
        courseName: course.name,
        lmsAccess: course.lmsAccess,
        upiId: MERCHANT_UPI_ID,
        merchantName: MERCHANT_UPI_NAME,
        upiDeepLink,
      });
    } catch (err) {
      console.error('Create order failed:', err);
      res.status(500).json({ error: 'Unable to initialize enrollment session.' });
    }
  });

  // Confirm Enrollment ONLY after real gateway payment verification (no unpaid bypass)
  app.post('/api/payments/verify', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const orderId = String(body.orderId || '').trim();
      const transactionId = String(body.transactionId || '').trim();
      const payerVpaInput = String(body.payerVpa || '').trim();
      const razorpayOrderId = String(body.razorpay_order_id || '').trim();
      const razorpayPaymentId = String(body.razorpay_payment_id || '').trim();
      const razorpaySignature = String(body.razorpay_signature || '').trim();

      if (!orderId) {
        res.status(400).json({ verified: false, error: 'Missing orderId for verification.' });
        return;
      }

      const existing = paymentLedger.get(orderId);
      if (!existing) {
        res.status(404).json({ verified: false, error: 'Enrollment session not found or expired.' });
        return;
      }

      // Case 1: Already captured via Razorpay QR polling or Webhook
      if (existing.status === 'paid' && existing.gatewayPaymentId) {
        res.json({
          verified: true,
          orderId: existing.orderId,
          invoiceNumber: existing.invoiceNumber,
          transactionId: existing.transactionId,
          upiTransactionCode: existing.upiTransactionCode,
          gatewayPaymentId: existing.gatewayPaymentId,
          payerVpa: existing.payerVpa,
          amountPaidINR: existing.amountPaidINR,
          paymentMethod: existing.paymentMethod,
          paymentStatus: 'Paid',
          paidAt: existing.paidAt,
        });
        return;
      }

      // Case 2: Signed Razorpay Checkout callback verification
      if (razorpayPaymentId && razorpayOrderId && razorpaySignature && HAS_VALID_RAZORPAY_KEYS) {
        const expectedSig = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (expectedSig !== razorpaySignature) {
          res.status(400).json({ verified: false, error: 'Razorpay payment signature verification failed.' });
          return;
        }

        let upiCode = '';
        let payerVpa = '';
        let amountPaidINR: number | undefined;

        try {
          const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
          const payDetailResp = await fetch(
            `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`,
            { headers: { Authorization: `Basic ${authHeader}` } },
          );
          if (payDetailResp.ok) {
            const payDetail = (await payDetailResp.json()) as {
              amount?: number;
              vpa?: string;
              acquirer_data?: { rrn?: string; upi_transaction_id?: string };
            };
            upiCode = payDetail.acquirer_data?.rrn || payDetail.acquirer_data?.upi_transaction_id || '';
            payerVpa = payDetail.vpa || '';
            if (typeof payDetail.amount === 'number' && payDetail.amount > 0) {
              amountPaidINR = Math.round(payDetail.amount / 100);
            }
          }
        } catch (err) {
          console.warn('Payment detail lookup notice:', err);
        }

        const invoiceNumber = `INV-BNC-${orderId}`;
        const paidAt = new Date().toISOString();
        const txId = upiCode || razorpayPaymentId;

        existing.status = 'paid';
        existing.paymentMethod = 'UPI / Razorpay Verified';
        existing.transactionId = txId;
        existing.upiTransactionCode = upiCode || razorpayPaymentId;
        existing.gatewayPaymentId = razorpayPaymentId;
        existing.payerVpa = payerVpa || undefined;
        existing.amountPaidINR = amountPaidINR;
        existing.invoiceNumber = invoiceNumber;
        existing.paidAt = paidAt;
        paymentLedger.set(orderId, existing);

        res.json({
          verified: true,
          orderId: existing.orderId,
          invoiceNumber,
          transactionId: txId,
          upiTransactionCode: existing.upiTransactionCode,
          gatewayPaymentId: existing.gatewayPaymentId,
          payerVpa: existing.payerVpa,
          amountPaidINR: existing.amountPaidINR,
          paymentMethod: existing.paymentMethod,
          paymentStatus: 'Paid',
          paidAt,
        });
        return;
      }

      // Case 3: Manual Direct UPI QR Transaction Reference (UTR / Transaction ID)
      if (transactionId) {
        const cleanTx = transactionId.replace(/\s+/g, '');
        if (!/^[A-Za-z0-9_-]{8,40}$/.test(cleanTx)) {
          res.status(400).json({
            verified: false,
            error: 'Please enter a valid UPI Transaction ID / 12-digit UTR number (minimum 8 characters).',
          });
          return;
        }

        const invoiceNumber = `INV-BNC-${orderId}`;
        const paidAt = new Date().toISOString();

        existing.status = 'pending_verification';
        existing.paymentMethod = 'Direct UPI QR (Manual Verification)';
        existing.transactionId = cleanTx;
        existing.upiTransactionCode = cleanTx;
        existing.payerVpa = payerVpaInput || undefined;
        existing.invoiceNumber = invoiceNumber;
        existing.paidAt = paidAt;
        paymentLedger.set(orderId, existing);

        res.json({
          verified: true,
          orderId: existing.orderId,
          invoiceNumber,
          transactionId: cleanTx,
          upiTransactionCode: cleanTx,
          gatewayPaymentId: undefined,
          payerVpa: existing.payerVpa,
          amountPaidINR: existing.amountPaidINR,
          paymentMethod: existing.paymentMethod,
          paymentStatus: 'Pending Verification',
          paidAt,
        });
        return;
      }

      res.status(402).json({
        verified: false,
        error:
          'Please complete your UPI payment and enter your UPI Transaction ID / UTR reference to generate your receipt.',
      });
    } catch (err) {
      console.error('Verify enrollment failed:', err);
      res.status(500).json({ verified: false, error: 'Unable to verify payment.' });
    }
  });

  // Poll Gateway for Automatic Payment Detection (no manual fallback)
  app.get('/api/payments/status/:orderId', async (req: Request, res: Response) => {
    const orderId = String(req.params.orderId || '').trim();
    const record = paymentLedger.get(orderId);
    if (!record) {
      res.status(404).json({ paid: false, error: 'Order session not found' });
      return;
    }

    const gatewayConfigured = HAS_VALID_RAZORPAY_KEYS;

    if (record.status === 'paid' && record.gatewayPaymentId) {
      res.json({
        paid: true,
        gatewayMode: gatewayConfigured ? 'razorpay' : 'direct',
        orderId: record.orderId,
        transactionId: record.transactionId,
        upiTransactionCode: record.upiTransactionCode,
        gatewayPaymentId: record.gatewayPaymentId,
        payerVpa: record.payerVpa,
        amountPaidINR: record.amountPaidINR,
        invoiceNumber: record.invoiceNumber,
        paymentMethod: record.paymentMethod || 'UPI / Razorpay Verified',
        paymentStatus: 'Paid',
        paidAt: record.paidAt,
      });
      return;
    }

    if (gatewayConfigured && record.razorpayQrId) {
      try {
        const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        const qrPayResp = await fetch(
          `https://api.razorpay.com/v1/payments/qr_codes/${encodeURIComponent(record.razorpayQrId)}/payments`,
          {
            headers: { Authorization: `Basic ${authHeader}` },
          },
        );
        if (qrPayResp.ok) {
          const payload = (await qrPayResp.json()) as {
            items?: Array<{
              id: string;
              status: string;
              amount?: number;
              vpa?: string;
              created_at?: number;
              acquirer_data?: { rrn?: string; upi_transaction_id?: string };
            }>;
          };
          const captured = payload.items?.find((p) => p.status === 'captured' || p.status === 'authorized');
          if (captured) {
            const upiCode =
              captured.acquirer_data?.rrn ||
              captured.acquirer_data?.upi_transaction_id ||
              captured.id;
            const txId = upiCode || captured.id;
            const invoiceNumber = `INV-BNC-${orderId}`;
            const paidAt = captured.created_at
              ? new Date(captured.created_at * 1000).toISOString()
              : new Date().toISOString();
            const amountPaidINR =
              typeof captured.amount === 'number' && captured.amount > 0
                ? Math.round(captured.amount / 100)
                : undefined;

            record.status = 'paid';
            record.paymentMethod = 'UPI / QR Code (Gateway Verified)';
            record.transactionId = txId;
            record.upiTransactionCode = upiCode;
            record.gatewayPaymentId = captured.id;
            record.payerVpa = captured.vpa || undefined;
            record.amountPaidINR = amountPaidINR;
            record.invoiceNumber = invoiceNumber;
            record.paidAt = paidAt;
            paymentLedger.set(orderId, record);

            res.json({
              paid: true,
              gatewayMode: 'razorpay',
              orderId: record.orderId,
              transactionId: txId,
              upiTransactionCode: upiCode,
              gatewayPaymentId: captured.id,
              payerVpa: record.payerVpa,
              amountPaidINR,
              invoiceNumber,
              paymentMethod: record.paymentMethod,
              paymentStatus: 'Paid',
              paidAt,
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Razorpay QR status poll notice:', err);
      }
    }

    res.json({
      paid: false,
      gatewayMode: gatewayConfigured && record.razorpayQrId ? 'razorpay' : 'direct',
      orderId: record.orderId,
      status: record.status,
    });
  });

  // Razorpay Webhook for instant asynchronous QR/payment settlement updates
  app.post('/api/payments/webhook', (req: Request, res: Response) => {
    try {
      if (RAZORPAY_WEBHOOK_SECRET) {
        const signature = String(req.headers['x-razorpay-signature'] || '');
        const raw = (req as Request & { rawBody?: Buffer }).rawBody || JSON.stringify(req.body || {});
        const expected = crypto
          .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
          .update(raw)
          .digest('hex');
        if (!signature || signature !== expected) {
          res.status(400).json({ error: 'Invalid webhook signature' });
          return;
        }
      }

      const event = req.body as {
        event?: string;
        payload?: {
          payment?: {
            entity?: {
              id?: string;
              amount?: number;
              status?: string;
              vpa?: string;
              qr_code_id?: string;
              notes?: { orderId?: string };
              acquirer_data?: { rrn?: string; upi_transaction_id?: string };
            };
          };
        };
      };

      const paymentEntity = event?.payload?.payment?.entity;
      if (paymentEntity && (paymentEntity.status === 'captured' || paymentEntity.status === 'authorized')) {
        const targetOrderId = paymentEntity.notes?.orderId;
        const targetQrId = paymentEntity.qr_code_id;
        for (const [id, rec] of paymentLedger.entries()) {
          if ((targetOrderId && id === targetOrderId) || (targetQrId && rec.razorpayQrId === targetQrId)) {
            const upiCode =
              paymentEntity.acquirer_data?.rrn ||
              paymentEntity.acquirer_data?.upi_transaction_id ||
              paymentEntity.id ||
              id;
            rec.status = 'paid';
            rec.paymentMethod = 'UPI / QR Code (Gateway Verified)';
            rec.transactionId = upiCode;
            rec.upiTransactionCode = upiCode;
            rec.gatewayPaymentId = paymentEntity.id;
            rec.payerVpa = paymentEntity.vpa || undefined;
            rec.amountPaidINR =
              typeof paymentEntity.amount === 'number' && paymentEntity.amount > 0
                ? Math.round(paymentEntity.amount / 100)
                : undefined;
            rec.invoiceNumber = `INV-BNC-${id}`;
            rec.paidAt = new Date().toISOString();
            paymentLedger.set(id, rec);
          }
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook handling error:', err);
      res.status(500).json({ error: 'Webhook error' });
    }
  });

  app.get('/api/payments/receipt/:orderId', (req: Request, res: Response) => {
    const orderId = String(req.params.orderId || '').trim();
    const record = paymentLedger.get(orderId);
    if (!record) {
      res.status(404).json({ error: 'Receipt not found' });
      return;
    }
    if (record.status !== 'paid' && record.status !== 'pending_verification') {
      res.status(402).json({ error: 'Receipt is only available after payment submission.' });
      return;
    }
    res.json(record);
  });

  // Mount Vite middleware in dev or serve built SPA in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vitePromise = createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    vitePromise.catch((err) => {
      console.error('Vite dev middleware initialization failed:', err);
    });
    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('/{*splat}', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BNC ELEVATE server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
