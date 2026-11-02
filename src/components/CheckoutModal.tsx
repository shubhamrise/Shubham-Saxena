import React, { useState } from 'react';
import { Currency, EnrollmentOrder } from '../types';
import { PACKAGES } from '../data/ciaData';
import { X, Check, ShieldCheck, ArrowRight, Sparkles, Building, User, Mail, Phone, MapPin, GraduationCap, CheckCircle2, Clock } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  selectedPackageId?: string;
  onEnrollSuccess?: (order: EnrollmentOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  currency,
  selectedPackageId = 'premium',
  onEnrollSuccess,
}) => {
  const [activePackageId, setActivePackageId] = useState<string>(selectedPackageId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add-ons
  const [printedBooks, setPrintedBooks] = useState(true);
  const [oneOnOneMentoring, setOneOnOneMentoring] = useState(false);
  const [aiAuditLab, setAiAuditLab] = useState(activePackageId === 'premium-plus');

  // Student Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);

  // Final Order State
  const [completedOrder, setCompletedOrder] = useState<EnrollmentOrder | null>(null);

  if (!isOpen) return null;

  const currentPkg = PACKAGES.find((p) => p.id === activePackageId) || PACKAGES[1];

  const basePrice = currency === 'INR' ? currentPkg.priceINR : currentPkg.priceUSD;
  const booksCost = printedBooks && activePackageId === 'basic' ? (currency === 'INR' ? 4500 : 55) : 0;
  const mentorCost = oneOnOneMentoring ? (currency === 'INR' ? 8000 : 100) : 0;
  const aiLabCost = aiAuditLab && activePackageId !== 'premium-plus' ? (currency === 'INR' ? 12000 : 150) : 0;
  const subtotal = basePrice + booksCost + mentorCost + aiLabCost;

  const discountAmount = couponApplied ? Math.round(subtotal * (couponDiscountPercent / 100)) : 0;
  const finalTotal = subtotal - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'EARLYBIRD10') {
      setCouponApplied(true);
      setCouponDiscountPercent(10);
    } else if (couponCode.trim().toUpperCase() === 'IIAINDIASAVE') {
      setCouponApplied(true);
      setCouponDiscountPercent(15);
    } else {
      alert('Invalid coupon code. Try "EARLYBIRD10" for 10% off.');
    }
  };

  const handleSubmitRequest = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill in your name, email, and WhatsApp / phone number.');
      return;
    }

    setIsSubmitting(true);

    const orderId = `BNC-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const order: EnrollmentOrder = {
      orderId,
      packageId: currentPkg.id,
      packageName: currentPkg.name,
      currency,
      basePrice,
      discount: discountAmount,
      totalPrice: finalTotal,
      studentName: name,
      studentEmail: email,
      studentPhone: phone,
      qualification,
      paymentMethod: 'ADMISSIONS_DESK',
      createdAt: formattedDate,
      addOns: {
        printedBooks,
        oneOnOneMentoring,
        aiAuditLab,
      },
    };

    // Save to local storage
    try {
      const existing = JSON.parse(localStorage.getItem('bnc_enrollment_requests') || '[]');
      existing.unshift({ ...order, city, notes, submittedAt: new Date().toISOString() });
      localStorage.setItem('bnc_enrollment_requests', JSON.stringify(existing));
    } catch (e) {
      console.warn('Storage save error', e);
    }

    // Send HTTP POST to FormSubmit API delivering directly to elevate@bncglobal.in
    try {
      await fetch('https://formsubmit.co/ajax/elevate@bncglobal.in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[BNC ELEVATE] New CIA Enrollment: ${name} (${currentPkg.name})`,
          _template: 'table',
          _captcha: 'false',
          'Order ID': orderId,
          'Candidate Name': name,
          'Candidate Email': email,
          'WhatsApp / Phone': phone,
          'City of Residence': city || 'Not specified',
          'Qualification': qualification,
          'Selected Package': currentPkg.name,
          'Estimated Tuition': `${currency} ${finalTotal.toLocaleString()}`,
          'Physical Books Delivery': printedBooks ? 'Yes' : 'No',
          '1-on-1 Faculty Mentorship': oneOnOneMentoring ? 'Yes' : 'No',
          'Hands-on AI Lab': aiAuditLab ? 'Yes' : 'No',
          'Promo Discount Applied': discountAmount > 0 ? `${currency} ${discountAmount}` : 'None',
          'Candidate Notes': notes || 'Standard enrollment application',
          'Submission Timestamp': new Date().toLocaleString(),
        }),
      });
    } catch (err) {
      console.warn('FormSubmit background notification error', err);
    } finally {
      setIsSubmitting(false);
      setCompletedOrder(order);
      setStep(3);
      if (onEnrollSuccess) {
        onEnrollSuccess(order);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-sky-50/70 border-b border-sky-100">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-100 text-[#b58b42]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {step === 3 ? 'Enrollment Request Received!' : 'BNC Global · Student Enrollment Request'}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Official Certified Internal Auditor (CIA®) Training Program
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Progress Indicator */}
        {step !== 3 && (
          <div className="relative z-10 grid grid-cols-2 border-b border-sky-100 text-xs font-semibold bg-white">
            <div
              className={`py-3 text-center transition-colors ${
                step === 1 ? 'bg-sky-50 text-sky-950 font-bold border-b-2 border-[#b58b42]' : 'text-slate-500'
              }`}
            >
              1. Choose Package & Inclusions
            </div>
            <div
              className={`py-3 text-center transition-colors ${
                step === 2 ? 'bg-sky-50 text-sky-950 font-bold border-b-2 border-[#b58b42]' : 'text-slate-500'
              }`}
            >
              2. Student Details & Enroll Now
            </div>
          </div>
        )}

        <div className="relative z-10 p-6 bg-white text-slate-900">
          {/* STEP 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Select Training Tier
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2.5">
                  {PACKAGES.map((pkg) => {
                    const isSelected = activePackageId === pkg.id;
                    const price = currency === 'INR' ? `₹${pkg.priceINR.toLocaleString('en-IN')}` : `$${pkg.priceUSD}`;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setActivePackageId(pkg.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-visible ${
                          isSelected
                            ? 'bg-amber-50/60 border-[#b58b42] ring-2 ring-[#b58b42]/20 shadow-sm'
                            : 'bg-white border-sky-100 hover:border-sky-300'
                        }`}
                      >
                        {pkg.badge && (
                          <span className="absolute -top-2.5 right-3 z-20 px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white whitespace-nowrap shadow-xs">
                            {pkg.badge}
                          </span>
                        )}
                        <h4 className="font-bold text-slate-900 text-base mb-1">{pkg.name}</h4>
                        <div className="text-xl font-extrabold text-sky-700 mb-2">{price}</div>
                        <p className="text-xs text-slate-600 line-clamp-2">{pkg.tagline}</p>
                        <div className="mt-3 pt-3 border-t border-sky-100 text-[11px] text-slate-700 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#b58b42] shrink-0" />
                            <span className="font-semibold text-slate-800">{pkg.deliverables.hours}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#b58b42] shrink-0" />
                            <span className="font-semibold text-slate-800">{pkg.deliverables.lmsAccess} LMS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Optional Candidate Add-ons
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 cursor-pointer hover:bg-sky-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={printedBooks}
                        onChange={(e) => setPrintedBooks(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          Physical Printed Test Bank & Reference Binder
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {activePackageId === 'basic'
                            ? `Doorstep express courier across India (${currency === 'INR' ? '₹4,500' : '$55'})`
                            : 'Included Free with Premium & Premium Plus cohorts'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 whitespace-nowrap">
                      {activePackageId === 'basic' ? (currency === 'INR' ? '+₹4,500' : '+$55') : 'INCLUDED'}
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 cursor-pointer hover:bg-sky-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={oneOnOneMentoring}
                        onChange={(e) => setOneOnOneMentoring(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          1-on-1 Faculty Mentorship & Mock Interview
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Personalized resume audit & audit interview preparation with Senior Audit Partner
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-sky-800 whitespace-nowrap">
                      {currency === 'INR' ? '+₹8,000' : '+$100'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Order Summary Footnote */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-600">Estimated Total:</span>
                  <div className="text-2xl font-black text-slate-950">
                    {currency === 'INR' ? `₹${finalTotal.toLocaleString('en-IN')}` : `$${finalTotal}`}
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="btn-reflection inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-sm shadow-md shadow-sky-800/25 transition-all cursor-pointer"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Student Details & Enroll Now */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Full Legal Name (as per Passport / ID) *
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
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Address (for LMS & Portal Access) *
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
                  <label className="block text-xs font-bold text-slate-800 mb-1">
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
                  <label className="block text-xs font-bold text-slate-800 mb-1">
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Highest Educational Qualification
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                  >
                    <option>Master's Degree (MBA / M.Com / MS / M.Sc)</option>
                    <option>Bachelor's Degree (B.Com / BBA / B.Tech / BA)</option>
                    <option>Enrolled College / University Student (IAP Track)</option>
                    <option>Chartered Accountant (CA - ICAI) / CPA</option>
                    <option>CISA / ACCA / CMA Member</option>
                    <option>Other / Corporate Professional</option>
                  </select>
                </div>
              </div>

              {/* Coupon / Discount Code */}
              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Have a Promo / Referral Code? (e.g. EARLYBIRD10)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs uppercase tracking-wider focus:outline-none focus:border-sky-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {couponApplied && (
                  <p className="text-xs text-[#b58b42] mt-1.5 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coupon applied! You saved {currency === 'INR' ? `₹${discountAmount.toLocaleString('en-IN')}` : `$${discountAmount}`} (10% off).
                  </p>
                )}
              </div>

              {/* Request Summary Box */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">{currentPkg.name}</span>
                  <span className="font-bold">{currency === 'INR' ? `₹${basePrice.toLocaleString('en-IN')}` : `$${basePrice}`}</span>
                </div>
                {printedBooks && activePackageId === 'basic' && (
                  <div className="flex justify-between text-slate-600">
                    <span>Physical Test Bank Courier</span>
                    <span>{currency === 'INR' ? '₹4,500' : '$55'}</span>
                  </div>
                )}
                {oneOnOneMentoring && (
                  <div className="flex justify-between text-slate-600">
                    <span>1-on-1 Faculty Mentorship</span>
                    <span>{currency === 'INR' ? '₹8,000' : '$100'}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#b58b42] font-bold">
                    <span>Promo Discount ({couponDiscountPercent}%)</span>
                    <span>-{currency === 'INR' ? `₹${discountAmount.toLocaleString('en-IN')}` : `$${discountAmount}`}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-sky-100 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Estimated Total Tuition:</span>
                  <span className="text-sky-800 text-base">
                    {currency === 'INR' ? `₹${finalTotal.toLocaleString('en-IN')}` : `$${finalTotal}`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  * Our admissions director will review your profile, verify batch eligibility, and issue your official enrollment invoice.
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-semibold"
                >
                  ← Back to Packages
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitRequest}
                  className="btn-reflection inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-sm shadow-lg shadow-sky-800/30 hover:shadow-[#b58b42]/30 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Transmitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Enroll Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Request Confirmation */}
          {step === 3 && completedOrder && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  REQUEST RECEIVED & TRANSMITTED TO ELEVATE@BNCGLOBAL.IN
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Thank You, {completedOrder.studentName}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                  Your enrollment request for the <strong>{completedOrder.packageName}</strong> has been transmitted to the BNC ELEVATE Admissions Desk at <strong>elevate@bncglobal.in</strong>.
                </p>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Request Reference ID:</span>
                  <span className="font-mono font-bold text-sky-900">{completedOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination Desk:</span>
                  <span className="font-bold text-sky-900 flex items-center gap-1 font-mono">
                    <Mail className="w-3.5 h-3.5 text-[#b58b42]" />
                    elevate@bncglobal.in
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Program:</span>
                  <span className="font-semibold text-slate-900">{completedOrder.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="text-slate-800">{completedOrder.studentName} ({completedOrder.studentEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp / Phone:</span>
                  <span className="text-slate-800">{completedOrder.studentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Tuition:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {completedOrder.currency === 'INR'
                      ? `₹${completedOrder.totalPrice.toLocaleString('en-IN')}`
                      : `$${completedOrder.totalPrice}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-700 font-bold">
                  <span>Status:</span>
                  <span>Dispatched to elevate@bncglobal.in</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-sky-50/70 border border-sky-100 text-left text-xs space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-900 mb-1">What Happens Next:</div>
                <div>1. Your enrollment dossier has been routed to <strong>elevate@bncglobal.in</strong>.</div>
                <div>2. Our senior admissions coordinator will contact you via WhatsApp ({completedOrder.studentPhone}) within 2 hours.</div>
                <div>3. Official enrollment documentation & fee invoice will be delivered to <strong>{completedOrder.studentEmail}</strong>.</div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-reflection px-8 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-800/25"
                >
                  Done / Return to Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
