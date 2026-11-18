import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { EnrollmentOrder, ManagedLearner } from '../types';
import { PACKAGES } from '../data/ciaData';
import {
  X,
  Check,
  ShieldCheck,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  BookOpen,
  AlertCircle,
  Copy,
} from 'lucide-react';

// Generates strictly sequential order IDs starting from 2026000, 2026001, 2026002...
const generateSequentialOrderId = (): string => {
  const INITIAL_SEQ = 2026000;
  const SEQ_KEY = 'bnc_order_sequence_counter';

  try {
    let nextSeq = INITIAL_SEQ;
    const stored = localStorage.getItem(SEQ_KEY);

    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= INITIAL_SEQ) {
        nextSeq = parsed;
      }
    } else {
      const existing = JSON.parse(localStorage.getItem('bnc_enrollment_requests') || '[]');
      if (Array.isArray(existing)) {
        for (const item of existing) {
          if (item && item.orderId) {
            const num = parseInt(String(item.orderId).trim(), 10);
            if (!isNaN(num) && num >= nextSeq) {
              nextSeq = num + 1;
            }
          }
        }
      }
    }

    localStorage.setItem(SEQ_KEY, String(nextSeq + 1));
    return String(nextSeq);
  } catch (err) {
    console.warn('Order sequence generation error:', err);
    return String(INITIAL_SEQ);
  }
};

interface ServerOrderSession {
  gatewayMode: 'razorpay' | 'direct';
  razorpayKeyId: string | null;
  razorpayQrImageUrl?: string | null;
  gatewayError?: string | null;
  orderId: string;
  gatewayOrderId: string;
  signature: string;
  upiId: string;
  merchantName: string;
  upiDeepLink: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackageId?: string;
  onEnrollSuccess?: (order: EnrollmentOrder) => void;
  onOpenLms?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPackageId = 'premium',
  onEnrollSuccess,
  onOpenLms,
}) => {
  const [activePackageId, setActivePackageId] = useState<string>(selectedPackageId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Student Details (Step 1)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState("Bachelor's Degree (B.Com / BBA / B.Tech / BA)");
  const [city, setCity] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Payment Options (Step 2)
  const [serverOrder, setServerOrder] = useState<ServerOrderSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [upiRefInput, setUpiRefInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Completed Enrollment (Step 3)
  const [completedOrder, setCompletedOrder] = useState<EnrollmentOrder | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActivePackageId(selectedPackageId || 'premium');
      setStep(1);
      setStep1Error(null);
      setPaymentError(null);
      setUpiRefInput('');
      setCopiedUpi(false);
      setCompletedOrder(null);
      setServerOrder(null);
    }
  }, [isOpen, selectedPackageId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentPkg = PACKAGES.find((p) => p.id === activePackageId) || PACKAGES[1];

  // Generate open merchant UPI QR (without any preset course price)
  useEffect(() => {
    if (!isOpen || step !== 2) return;
    const upiId = serverOrder?.upiId || 'bnc01@ptaxis';
    const merchantName = serverOrder?.merchantName || 'Paytm';
    const deepLink =
      serverOrder?.upiDeepLink ||
      `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR`;

    QRCode.toDataURL(deepLink, {
      width: 240,
      margin: 1,
      color: { dark: '#07172b', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR render warning:', err));
  }, [isOpen, step, serverOrder, currentPkg.name]);

  // Automatically fetch payment confirmation every 2.5s when live gateway mode is active
  useEffect(() => {
    if (!isOpen || step !== 2 || !serverOrder?.orderId || serverOrder.gatewayMode !== 'razorpay') {
      return;
    }

    let cancelled = false;
    const pollStatus = async () => {
      try {
        const resp = await fetch(`/api/payments/status/${encodeURIComponent(serverOrder.orderId)}`);
        if (!resp.ok || cancelled) return;
        const statusData = (await resp.json()) as {
          paid?: boolean;
          transactionId?: string;
          upiTransactionCode?: string;
          gatewayPaymentId?: string;
          payerVpa?: string;
          amountPaidINR?: number;
          invoiceNumber?: string;
          paymentMethod?: string;
          paidAt?: string;
        };
        if (statusData.paid && !cancelled) {
          cancelled = true;
          window.clearInterval(intervalId);
          await finalizeEnrollment(statusData);
        }
      } catch {}
    };

    const intervalId = window.setInterval(pollStatus, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isOpen, step, serverOrder]);

  if (!isOpen) return null;

  const handleProceedToPaymentStep = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setStep1Error('Please complete your full legal name, email address, and WhatsApp / contact number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStep1Error('Please enter a valid email address so we can send your confirmation & LMS credentials.');
      return;
    }

    setStep1Error(null);
    setPaymentError(null);
    setIsProcessing(true);

    const orderId = generateSequentialOrderId();

    try {
      const resp = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          packageId: currentPkg.id,
          studentName: name.trim(),
          studentEmail: email.trim(),
          studentPhone: phone.trim(),
        }),
      });

      if (resp.ok) {
        const data = (await resp.json()) as ServerOrderSession;
        setServerOrder(data);
        setStep(2);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn('Enrollment session initialization notice:', err);
    }

    setServerOrder({
      gatewayMode: 'direct',
      razorpayKeyId: null,
      orderId,
      gatewayOrderId: `BNC-ORD-${orderId}`,
      signature: 'local-fallback',
      upiId: 'bnc01@ptaxis',
      merchantName: 'Paytm',
      upiDeepLink: `upi://pay?pa=bnc01@ptaxis&pn=${encodeURIComponent(
        'Paytm',
      )}&cu=INR`,
    });
    setStep(2);
    setIsProcessing(false);
  };

  const persistCompletedEnrollment = async (
    order: EnrollmentOrder,
    methodLabel: string,
    isPendingVerification: boolean,
  ) => {
    try {
      const existingReqs = JSON.parse(localStorage.getItem('bnc_enrollment_requests') || '[]');
      existingReqs.unshift({ ...order, submittedAt: new Date().toISOString() });
      localStorage.setItem('bnc_enrollment_requests', JSON.stringify(existingReqs));

      const existingOrders = JSON.parse(localStorage.getItem('bnc_orders') || '[]');
      existingOrders.unshift({ ...order, orderDate: new Date().toISOString() });
      localStorage.setItem('bnc_orders', JSON.stringify(existingOrders));

      const storedLearners: ManagedLearner[] = JSON.parse(
        localStorage.getItem('bnc_lms_students') || '[]',
      );
      if (Array.isArray(storedLearners)) {
        const cleanEmail = order.studentEmail.trim().toLowerCase();
        const feeStatusLabel = isPendingVerification
          ? `${methodLabel} · Pending Verification (Ref: ${order.transactionId})`
          : `${methodLabel} · Verified`;

        const idx = storedLearners.findIndex((l) => l.email.toLowerCase() === cleanEmail);
        const learnerEntry: ManagedLearner = {
          id: idx >= 0 ? storedLearners[idx].id : `stu-${order.orderId}`,
          name: order.studentName,
          email: cleanEmail,
          password: idx >= 0 ? storedLearners[idx].password : 'bnc2026',
          orderId: order.orderId,
          packageName: order.packageName,
          feeStatus: feeStatusLabel,
          status: isPendingVerification ? 'pending' : 'active',
          enrollmentDate: order.createdAt,
          accessDuration: currentPkg.deliverables.lmsAccess,
          phone: order.studentPhone,
          notes: `${methodLabel} · Ref ${order.transactionId}`,
        };

        if (idx >= 0) {
          storedLearners[idx] = learnerEntry;
        } else {
          storedLearners.unshift(learnerEntry);
        }
        localStorage.setItem('bnc_lms_students', JSON.stringify(storedLearners));
      }
    } catch (e) {
      console.warn('Enrollment storage error:', e);
    }

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '47c5850f-6624-4499-b44a-7899849e4b1b',
          subject: `[BNC ELEVATE] Course Enrollment: ${order.studentName} (${order.packageName})`,
          from_name: 'BNC ELEVATE Admissions Desk',
          'Order ID': order.orderId,
          'Reference Number': order.transactionId,
          'Enrollment Option': methodLabel,
          Status: order.paymentStatus,
          'Candidate Name': order.studentName,
          'Candidate Email': order.studentEmail,
          'WhatsApp / Phone': order.studentPhone,
          'Selected Package': order.packageName,
          Qualification: order.qualification,
          message: `Course Enrollment Request:\n• Order ID: ${order.orderId}\n• Mode: ${methodLabel} (${order.paymentStatus})\n• Ref: ${order.transactionId}\n• Student: ${order.studentName} (${order.studentEmail}, ${order.studentPhone})\n• Package: ${order.packageName}\n• City: ${order.city || 'India'}`,
        }),
      });
    } catch {}

    try {
      await fetch('https://formsubmit.co/ajax/info@bncglobal.in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `[BNC ELEVATE] Course Enrollment: ${order.studentName} (${order.packageName})`,
          _template: 'table',
          _captcha: 'false',
          'Order ID': order.orderId,
          'Reference Number': order.transactionId,
          Mode: methodLabel,
          Status: order.paymentStatus,
          'Candidate Name': order.studentName,
          'Candidate Email': order.studentEmail,
          'WhatsApp / Phone': order.studentPhone,
          'Selected Package': order.packageName,
        }),
      });
    } catch {}
  };

  interface VerifiedGatewayPayload {
    paid?: boolean;
    transactionId?: string;
    upiTransactionCode?: string;
    gatewayPaymentId?: string;
    payerVpa?: string;
    amountPaidINR?: number;
    invoiceNumber?: string;
    paymentMethod?: string;
    paidAt?: string;
  }

  const finalizeEnrollment = async (gatewayData: VerifiedGatewayPayload) => {
    if (!gatewayData.paid || !gatewayData.gatewayPaymentId) {
      setPaymentError('Enrollment can only complete once a confirmed payment is received from the payment gateway.');
      return;
    }

    setPaymentError(null);
    setIsProcessing(true);

    const activeOrderId = serverOrder?.orderId || generateSequentialOrderId();
    const methodLabel = gatewayData.paymentMethod || 'UPI / QR Code (Gateway Verified)';

    try {
      const verifyResp = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: activeOrderId }),
      });

      const verifyData = await verifyResp.json();
      if (!verifyResp.ok || !verifyData.verified) {
        setPaymentError(
          verifyData.error || 'No confirmed payment detected yet. Please complete payment first.',
        );
        setIsProcessing(false);
        return;
      }

      const paidIso = verifyData.paidAt || gatewayData.paidAt || new Date().toISOString();
      const formattedDate = new Date(paidIso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const completed: EnrollmentOrder = {
        orderId: activeOrderId,
        packageId: currentPkg.id,
        packageName: currentPkg.name,
        studentName: name.trim(),
        studentEmail: email.trim(),
        studentPhone: phone.trim(),
        qualification,
        city: city.trim(),
        paymentMethod: verifyData.paymentMethod || methodLabel,
        paymentPlan: 'full',
        paymentStatus: 'Paid',
        amountPaidToday: verifyData.amountPaidINR ?? gatewayData.amountPaidINR,
        transactionId: verifyData.transactionId || gatewayData.transactionId,
        upiTransactionCode: verifyData.upiTransactionCode || gatewayData.upiTransactionCode,
        gatewayPaymentId: verifyData.gatewayPaymentId || gatewayData.gatewayPaymentId,
        payerVpa: verifyData.payerVpa || gatewayData.payerVpa,
        paidAt: formattedDate,
        invoiceNumber: verifyData.invoiceNumber || gatewayData.invoiceNumber || `INV-BNC-${activeOrderId}`,
        createdAt: formattedDate,
        addOns: {
          printedBooks: false,
          oneOnOneMentoring: false,
          aiAuditLab: currentPkg.id === 'premium-plus' || currentPkg.id === 'elite',
        },
      };

      await persistCompletedEnrollment(completed, completed.paymentMethod || methodLabel, false);

      setCompletedOrder(completed);
      setStep(3);
      setIsProcessing(false);
      if (onEnrollSuccess) {
        onEnrollSuccess(completed);
      }
    } catch {
      setPaymentError('Unable to verify payment status with the server. Please retry.');
      setIsProcessing(false);
    }
  };

  const handleConfirmManualUpi = async () => {
    const cleanRef = upiRefInput.replace(/\s+/g, '').trim();
    if (!cleanRef || !/^[A-Za-z0-9_-]{8,40}$/.test(cleanRef)) {
      setPaymentError(
        'Please complete the UPI transfer via the QR code and enter a valid UPI Transaction ID / 12-digit UTR number (at least 8 characters).',
      );
      return;
    }

    setPaymentError(null);
    setIsProcessing(true);

    const activeOrderId = serverOrder?.orderId || generateSequentialOrderId();
    const methodLabel = 'Direct UPI QR (Manual Verification)';
    let verifiedPayload: {
      invoiceNumber?: string;
      transactionId?: string;
      upiTransactionCode?: string;
      payerVpa?: string;
      paymentMethod?: string;
      paymentStatus?: 'Paid' | 'Pending Verification';
      paidAt?: string;
    } = {};

    try {
      const resp = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          transactionId: cleanRef,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.verified) {
        setPaymentError(data.error || 'Please enter a valid UPI Transaction ID / UTR reference.');
        setIsProcessing(false);
        return;
      }
      verifiedPayload = data;
    } catch {
      // Fallback locally if server session expired across restarts
      verifiedPayload = {
        invoiceNumber: `INV-BNC-${activeOrderId}`,
        transactionId: cleanRef,
        upiTransactionCode: cleanRef,
        paymentMethod: methodLabel,
        paymentStatus: 'Pending Verification',
        paidAt: new Date().toISOString(),
      };
    }

    const paidIso = verifiedPayload.paidAt || new Date().toISOString();
    const formattedDate = new Date(paidIso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const completed: EnrollmentOrder = {
      orderId: activeOrderId,
      packageId: currentPkg.id,
      packageName: currentPkg.name,
      studentName: name.trim(),
      studentEmail: email.trim(),
      studentPhone: phone.trim(),
      qualification,
      city: city.trim(),
      paymentMethod: verifiedPayload.paymentMethod || methodLabel,
      paymentPlan: 'full',
      paymentStatus: verifiedPayload.paymentStatus || 'Pending Verification',
      transactionId: verifiedPayload.transactionId || cleanRef,
      upiTransactionCode: verifiedPayload.upiTransactionCode || cleanRef,
      payerVpa: verifiedPayload.payerVpa,
      paidAt: formattedDate,
      invoiceNumber: verifiedPayload.invoiceNumber || `INV-BNC-${activeOrderId}`,
      createdAt: formattedDate,
      addOns: {
        printedBooks: false,
        oneOnOneMentoring: false,
        aiAuditLab: currentPkg.id === 'premium-plus' || currentPkg.id === 'elite',
      },
    };

    await persistCompletedEnrollment(completed, completed.paymentMethod || methodLabel, true);

    setCompletedOrder(completed);
    setStep(3);
    setIsProcessing(false);
    if (onEnrollSuccess) {
      onEnrollSuccess(completed);
    }
  };

  const handleCopyUpiId = async () => {
    const upi = serverOrder?.upiId || 'bnc01@ptaxis';
    try {
      await navigator.clipboard.writeText(upi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {}
  };

  const handleCheckPaymentStatusNow = async () => {
    setPaymentError(null);
    if (!serverOrder?.orderId || serverOrder.gatewayMode !== 'razorpay') {
      await handleConfirmManualUpi();
      return;
    }

    setIsProcessing(true);
    try {
      const resp = await fetch(`/api/payments/status/${encodeURIComponent(serverOrder.orderId)}`);
      if (resp.ok) {
        const statusData = (await resp.json()) as VerifiedGatewayPayload;
        if (statusData.paid && statusData.gatewayPaymentId) {
          await finalizeEnrollment(statusData);
          return;
        }
      }
    } catch {}

    setIsProcessing(false);
    setPaymentError(
      'Payment has not been received by the gateway yet. Complete the UPI payment via the QR code and it will unlock automatically.',
    );
  };

  const handleDownloadEnrollmentSlip = () => {
    if (!completedOrder) return;

    const amountRow = completedOrder.amountPaidToday
      ? `<div><strong>Amount Paid:</strong> ₹${completedOrder.amountPaidToday.toLocaleString('en-IN')}</div>`
      : '';
    const payerVpaRow = completedOrder.payerVpa
      ? `<div><strong>Payer UPI ID (VPA):</strong> ${completedOrder.payerVpa}</div>`
      : '';

    const isGatewayPaid = completedOrder.paymentStatus === 'Paid';
    const receiptBadge = isGatewayPaid
      ? 'PAID · GATEWAY VERIFIED'
      : 'SUBMITTED · PENDING UTR VERIFICATION';
    const gatewayRow = completedOrder.gatewayPaymentId
      ? `<div><strong>Gateway Payment ID:</strong> <span class="mono">${completedOrder.gatewayPaymentId}</span></div>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Official Payment Receipt - ${completedOrder.invoiceNumber}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 36px; background: #f8fafc; }
  .sheet { max-width: 740px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 16px; padding: 32px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #07172b; padding-bottom: 18px; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 900; color: #07172b; }
  .brand span { color: #b58b42; }
  .meta { text-align: right; font-size: 12px; color: #475569; line-height: 1.5; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: ${isGatewayPaid ? '#dcfce7' : '#fef3c7'}; color: ${isGatewayPaid ? '#166534' : '#92400e'}; font-weight: 800; font-size: 11px; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 13px; }
  .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; line-height: 1.65; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 6px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 700; }
  .footer { font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 14px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div>
        <div class="brand">bnc <span>ELEVATE</span></div>
        <div style="font-size:12px;color:#475569;margin-top:4px;">BNC Global Consultech Pvt. Ltd. · Enrollment Payment Receipt</div>
        <div style="font-size:11px;color:#64748b;">info@bncglobal.in · +91 98213 75702</div>
      </div>
      <div class="meta">
        <div class="badge">${receiptBadge}</div>
        <div style="margin-top:8px;"><strong>Receipt No:</strong> <span class="mono">${completedOrder.invoiceNumber}</span></div>
        <div><strong>Order ID:</strong> <span class="mono">#${completedOrder.orderId}</span></div>
        <div><strong>Submitted On:</strong> ${completedOrder.paidAt || completedOrder.createdAt}</div>
      </div>
    </div>
    <div class="grid">
      <div class="box">
        <div class="label">Candidate Details</div>
        <div><strong>${completedOrder.studentName}</strong></div>
        <div>${completedOrder.studentEmail}</div>
        <div>${completedOrder.studentPhone}</div>
        <div>${completedOrder.city || 'India'} · ${completedOrder.qualification}</div>
      </div>
      <div class="box">
        <div class="label">UPI / Transaction Receipt</div>
        <div><strong>UPI Transfer Code / UTR:</strong> <span class="mono">${completedOrder.upiTransactionCode || completedOrder.transactionId}</span></div>
        ${gatewayRow}
        <div><strong>Payment Method:</strong> ${completedOrder.paymentMethod}</div>
        ${payerVpaRow}
        ${amountRow}
      </div>
    </div>
    <div class="box" style="margin-bottom:20px;font-size:13px;">
      <div class="label">Enrolled Program</div>
      <div><strong>Program:</strong> Certified Internal Auditor (CIA®) — ${completedOrder.packageName}</div>
      <div><strong>Delivery Mode:</strong> ${currentPkg.deliverables.mode} · <strong>LMS Access:</strong> ${currentPkg.deliverables.lmsAccess}</div>
    </div>
    <div class="footer">
      <strong>LMS Portal Access:</strong> Visit the Student LMS Portal and sign in with your registered email (<strong>${completedOrder.studentEmail}</strong>) and temporary passcode <strong>bnc2026</strong>.<br/>
      This is a computer-generated payment receipt verified automatically by the payment gateway.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BNC_ELEVATE_Payment_Receipt_${completedOrder.orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[96vw] max-w-6xl min-h-[78vh] max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Pinned Modal Header */}
        <div className="shrink-0 z-30 flex items-center justify-between px-5 sm:px-7 py-3.5 bg-sky-50/95 border-b border-sky-100 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-amber-100 text-[#b58b42] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                {step === 3
                  ? 'Enrollment Confirmed!'
                  : 'BNC ELEVATE · Cohort Enrollment & Onboarding'}
              </h3>
              <p className="text-xs text-slate-600 font-medium truncate">
                Certified Internal Auditor (CIA®) · Direct Admissions & Payment Setup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-all cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        </div>

        {/* Pinned 2-Step Progress Bar */}
        {step !== 3 && (
          <div className="shrink-0 relative z-10 grid grid-cols-2 border-b border-sky-100 text-xs sm:text-sm font-semibold bg-white">
            {[
              { s: 1, label: '1. Package & Student Details' },
              { s: 2, label: '2. Pay Fee Securely' },
            ].map((item) => (
              <div
                key={item.s}
                className={`py-3 text-center transition-colors ${
                  step === item.s
                    ? 'bg-sky-50 text-sky-950 font-extrabold border-b-2 border-[#b58b42]'
                    : step > item.s
                    ? 'bg-emerald-50/40 text-emerald-800 font-bold'
                    : 'text-slate-500'
                }`}
              >
                {step > item.s ? `✓ ${item.label.slice(3)}` : item.label}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto relative z-10 p-5 sm:p-7 bg-white text-slate-900">
          {/* STEP 1: Combined Package Selection + Student Details */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Package Selection Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Select Your CIA® Preparation Package
                  </label>
                  <span className="text-xs font-bold text-[#9e7735]">
                    All 3 Exam Parts Included
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
                  {PACKAGES.map((pkg) => {
                    const isSelected = activePackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setActivePackageId(pkg.id)}
                        className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-visible flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50/75 border-[#b58b42] ring-2 ring-[#b58b42]/25 shadow-md'
                            : 'bg-white border-sky-100 hover:border-sky-300'
                        }`}
                      >
                        {pkg.badge && (
                          <span className="absolute -top-2.5 right-2.5 z-20 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-sky-700 to-[#b58b42] text-white whitespace-nowrap shadow-xs">
                            {pkg.badge}
                          </span>
                        )}
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">{pkg.name}</h4>
                          <div className="text-xs font-semibold text-sky-900 mb-3">
                            {pkg.deliverables.mode}
                          </div>
                        </div>
                        <div className="pt-3 border-t border-sky-100 text-[11px] text-slate-700 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#b58b42] shrink-0" />
                            <span className="font-semibold">{pkg.deliverables.hours}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#b58b42] shrink-0" />
                            <span className="font-semibold">{pkg.deliverables.lmsAccess}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#b58b42] shrink-0" />
                            <span className="font-semibold">{pkg.deliverables.mocksCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Combined Student Registration Details Section */}
              <div className="pt-5 border-t border-sky-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Student Registration Details
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Used for LMS Portal Credentials & Cohort Onboarding
                  </span>
                </div>

                {step1Error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{step1Error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Full Legal Name (for Certificate & LMS) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Rohit Verma"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Email Address (LMS Login & Notifications) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rohit.verma@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      WhatsApp / Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Selected Course Package *
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-[#b58b42] absolute left-3 top-3" />
                      <select
                        value={activePackageId}
                        onChange={(e) => setActivePackageId(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-amber-50/40 border border-[#b58b42]/50 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      >
                        {PACKAGES.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg.deliverables.mode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      City / Country of Residence
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., New Delhi, India / Dubai, UAE"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Eligibility Pathway / Qualification
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      >
                        <option>Students & No Degree (IAP™ Fast Track)</option>
                        <option>Bachelor's Degree (B.Com / BBA / B.Tech / BA)</option>
                        <option>Master's Degree (MBA / M.Com / MS / M.Sc)</option>
                        <option>Qualified Professional (CA / CMA / CPA / CISA)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Track Summary & Proceed to Payment */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/75 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-black text-slate-900">
                    Selected Track: <span className="text-sky-900">{currentPkg.name}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {currentPkg.deliverables.hours} · {currentPkg.deliverables.lmsAccess} · {currentPkg.deliverables.mocksCount}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProceedToPaymentStep}
                  className="btn-reflection inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-sm shadow-lg shadow-sky-800/30 transition-all cursor-pointer disabled:opacity-75 shrink-0"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Preparing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#f1bd5b]" />
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Pay Fee Securely (Zero hardcoded prices shown) */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Order Summary Banner (No price shown) */}
              <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#07172b] to-[#0f2b4c] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#f1bd5b] font-extrabold">
                    Order #{serverOrder?.orderId} · {currentPkg.name}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5">
                    {name} · {email}
                  </div>
                </div>
                <div className="text-[11px] font-bold text-sky-200 sm:text-right">
                  {currentPkg.deliverables.mode} · {currentPkg.deliverables.lmsAccess}
                </div>
              </div>

              {paymentError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* UPI QR Payment (Automatic Razorpay OR Manual Direct UPI QR) */}
              {serverOrder?.gatewayMode === 'razorpay' ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 items-center">
                  <div className="md:col-span-2 flex flex-col items-center text-center space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    {serverOrder?.razorpayQrImageUrl ? (
                      <img
                        src={serverOrder.razorpayQrImageUrl}
                        alt="Razorpay Automatic UPI QR Code"
                        className="w-44 h-44 rounded-lg border border-slate-100 object-contain"
                      />
                    ) : qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-44 h-44 rounded-lg border border-slate-100"
                      />
                    ) : (
                      <div className="w-44 h-44 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                        Generating Gateway QR...
                      </div>
                    )}
                    <div className="text-xs font-bold text-slate-700">
                      Scan with GPay, PhonePe, Paytm or BHIM
                    </div>
                    <div className="text-xs font-semibold text-sky-900">
                      Receipt & LMS unlock automatically after payment
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-3">
                    <div className="p-4 rounded-xl bg-sky-50/90 border border-sky-200 text-xs text-slate-700 space-y-2">
                      <div className="flex items-center gap-2 font-extrabold text-sky-950 text-sm">
                        <Clock className="w-4 h-4 text-[#b58b42] animate-spin shrink-0" />
                        <span>Awaiting Automatic Payment Confirmation...</span>
                      </div>
                      <p className="leading-relaxed text-xs text-slate-600">
                        Scan the gateway QR code using any UPI app. Once your payment succeeds, your <strong>UPI Transfer Code (RRN)</strong>, <strong>Payment ID</strong>, and <strong>Official Payment Receipt</strong> are fetched and generated automatically—no manual confirmation needed.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 items-center">
                  <div className="md:col-span-2 flex flex-col items-center text-center space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="BNC ELEVATE UPI QR Code"
                        className="w-44 h-44 rounded-lg border border-slate-100"
                      />
                    ) : (
                      <div className="w-44 h-44 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                        Generating UPI QR...
                      </div>
                    )}
                    <div className="text-xs font-bold text-slate-700">
                      Scan with GPay, PhonePe, Paytm or BHIM
                    </div>
                    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 text-xs">
                      <span className="font-mono font-bold text-sky-950 truncate">
                        {serverOrder?.upiId || 'bnc01@ptaxis'}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-sky-200 text-[11px] font-bold text-sky-900 hover:bg-sky-100 cursor-pointer shrink-0"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-4">
                    <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-slate-700 space-y-1">
                      <div className="font-extrabold text-sky-950">Direct UPI QR Transfer</div>
                      <p className="leading-relaxed text-slate-600">
                        Scan the QR code (or copy the UPI ID) to pay directly via any UPI app, then enter your <strong>12-Digit UPI UTR / Transaction ID</strong> below to submit enrollment and generate your receipt.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Enter UPI Transaction ID / 12-Digit UTR *
                      </label>
                      <input
                        type="text"
                        required
                        value={upiRefInput}
                        onChange={(e) => setUpiRefInput(e.target.value)}
                        placeholder="e.g., 432198765432 or PTM..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation & Submit / Status Check */}
              <div className="flex items-center justify-between pt-4 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 cursor-pointer font-semibold"
                >
                  ← Edit Package & Student Details
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCheckPaymentStatusNow}
                  className="btn-reflection inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-sm shadow-lg shadow-sky-800/30 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>
                        {serverOrder?.gatewayMode === 'razorpay'
                          ? 'Checking Gateway...'
                          : 'Generating Receipt...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#f1bd5b]" />
                      <span>
                        {serverOrder?.gatewayMode === 'razorpay'
                          ? 'Check Payment Status'
                          : 'Confirm Enrollment & Generate Receipt'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Receipt & Enrollment Confirmation */}
          {step === 3 && completedOrder && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    completedOrder.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {completedOrder.paymentStatus === 'Paid'
                    ? 'PAYMENT VERIFIED · OFFICIAL RECEIPT & LMS ACTIVATED'
                    : 'PAYMENT REFERENCE RECORDED · RECEIPT GENERATED (VERIFICATION IN PROGRESS)'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Welcome to BNC ELEVATE, {completedOrder.studentName}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                  {completedOrder.paymentStatus === 'Paid' ? (
                    <>
                      Your verified payment for <strong>{completedOrder.packageName}</strong> is recorded under{' '}
                      <strong>#{completedOrder.orderId}</strong> and synced to{' '}
                      <strong>info@bncglobal.in</strong>.
                    </>
                  ) : (
                    <>
                      Your enrollment for <strong>{completedOrder.packageName}</strong> (Order{' '}
                      <strong>#{completedOrder.orderId}</strong>) and UPI transaction reference have been submitted to{' '}
                      <strong>info@bncglobal.in</strong>. LMS access unlocks automatically once Finance verifies your UTR.
                    </>
                  )}
                </p>
              </div>

              <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Official Receipt / Order:</span>
                  <span className="font-mono font-bold text-sky-950">
                    {completedOrder.invoiceNumber} · #{completedOrder.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UPI Transfer Code / Bank RRN:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {completedOrder.upiTransactionCode || completedOrder.transactionId}
                  </span>
                </div>
                {completedOrder.gatewayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gateway Payment ID:</span>
                    <span className="font-mono font-bold text-slate-900">{completedOrder.gatewayPaymentId}</span>
                  </div>
                )}
                {completedOrder.payerVpa && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payer UPI ID (VPA):</span>
                    <span className="font-mono font-semibold text-slate-900">{completedOrder.payerVpa}</span>
                  </div>
                )}
                {completedOrder.amountPaidToday && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid (Verified):</span>
                    <span className="font-bold text-slate-900">
                      ₹{completedOrder.amountPaidToday.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode &amp; Date:</span>
                  <span className="font-semibold text-slate-900">
                    {completedOrder.paymentMethod} · {completedOrder.paidAt || completedOrder.createdAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course Package:</span>
                  <span className="font-semibold text-slate-900">{completedOrder.packageName}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">LMS Portal Login:</span>
                  <span className="font-mono font-bold text-sky-900">
                    {completedOrder.studentEmail} (Pass: bnc2026)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadEnrollmentSlip}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-950 font-bold text-xs cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#b58b42]" />
                  <span>Download Official Payment Receipt</span>
                </button>

                {onOpenLms && completedOrder.paymentStatus === 'Paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLms();
                    }}
                    className="btn-reflection inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-800/25"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Launch Student LMS Now</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Done / Return to Website
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
