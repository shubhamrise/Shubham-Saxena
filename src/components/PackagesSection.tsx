import React, { useState } from 'react';
import { Currency } from '../types';
import { PACKAGES } from '../data/ciaData';
import { Check, ArrowRight, Sparkles, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

interface PackagesSectionProps {
  currency: Currency;
  onOpenCheckout: (packageId: string) => void;
  onOpenInquiry: () => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  currency,
  onOpenCheckout,
  onOpenInquiry,
}) => {
  const [billingPlan, setBillingPlan] = useState<'full' | 'installment'>('full');
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="packages" className="relative overflow-hidden py-24 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Tuition Packages Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#f1bd5b]" />
            <span>TRANSPARENT TUITION & PACKAGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Invest in Your Global Audit Credential
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            All packages include complete preparation for all 3 CIA parts, the BNC Test Bank ($499 value included), and full IIA registration concierge.
          </p>

          {/* Billing Mode Switcher (Full vs 2-Part Installment) */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md">
            <button
              onClick={() => setBillingPlan('full')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingPlan === 'full'
                  ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-md shadow-sky-700/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Standard Enrollment (Full LMS)
            </button>
            <button
              onClick={() => setBillingPlan('installment')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingPlan === 'installment'
                  ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-md shadow-sky-700/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>2-Part Installment Plan</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-[#f1bd5b] border border-[#f1bd5b]/40 font-bold">
                0% Fee
              </span>
            </button>
          </div>
        </div>

        {/* 3 Package Cards Grid with Reflection on Cards and Buttons (pt-6 ensures badge headroom) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16 pt-6">
          {PACKAGES.map((pkg) => {
            const isPopular = pkg.isPopular;
            const price =
              currency === 'INR'
                ? billingPlan === 'full'
                  ? `₹${pkg.priceINR.toLocaleString('en-IN')}`
                  : `₹${pkg.installmentINR.toLocaleString('en-IN')}`
                : billingPlan === 'full'
                ? `$${pkg.priceUSD}`
                : `$${Math.round(pkg.priceUSD / 2)}`;

            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 overflow-visible ${
                  isPopular
                    ? 'bg-white border-2 border-[#b58b42] shadow-xl ring-4 ring-[#b58b42]/15'
                    : 'bg-white border border-sky-100 hover:border-[#b58b42]/40 shadow-sm'
                }`}
              >
                {/* Dedicated internal reflection layer that clips to card shape without clipping external badge */}
                <div className="card-reflection absolute inset-0 rounded-3xl pointer-events-none z-0" />

                {/* Popular Badge - fully visible without being cut off */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-4 py-1 rounded-full bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white text-xs font-black uppercase tracking-wider shadow-md whitespace-nowrap border border-white/50">
                    {pkg.badge}
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{pkg.name}</h3>
                    <span className="text-xs font-medium text-slate-500">{pkg.deliverables.mode}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6 min-h-[36px]">
                    {pkg.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="pb-6 mb-6 border-b border-sky-50">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        {price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {billingPlan === 'full' ? '/ full program' : '/ month (2 installments)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Covers all 3 CIA exam parts · IIA exam fees separate
                    </div>
                  </div>

                  {/* Deliverable Highlights */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-slate-700">
                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="text-slate-500 text-[10px] uppercase font-bold">Instruction</div>
                      <div className="font-semibold text-sky-950 mt-0.5">{pkg.deliverables.hours}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div className="text-slate-500 text-[10px] uppercase font-bold">LMS Access</div>
                      <div className="font-semibold text-[#b58b42] mt-0.5">{pkg.deliverables.lmsAccess}</div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Included in this tier:
                    </div>
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-[#b58b42] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button with Reflection Effect */}
                <div className="relative z-10 pt-4 border-t border-sky-50">
                  <button
                    onClick={() => onOpenCheckout(pkg.id)}
                    className={`btn-reflection w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white shadow-sky-800/25 hover:shadow-[#b58b42]/30'
                        : 'bg-sky-100/70 hover:bg-sky-200/70 text-sky-950 border border-sky-300 hover:border-sky-400'
                    }`}
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Instant LMS portal access setup upon admissions confirmation
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Standalone IAP Milestone Banner */}
        <div className="card-reflection p-8 rounded-3xl bg-gradient-to-r from-sky-50/50 via-white to-amber-50/40 border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 shadow-sm">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#b58b42] border border-amber-200 uppercase tracking-wider">
              STUDENT FIRST MILESTONE
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Want to clear Part 1 first? The Internal Audit Practitioner (IAP)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Earn the permanent international "IAP" designation on Part 1 alone without a degree. Your pass counts as direct credit toward the full CIA for 4 years, and the IIA waives your CIA application fee!
            </p>
          </div>
          <button
            onClick={() => onOpenCheckout('basic')}
            className="btn-reflection px-6 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-sky-800/20"
          >
            Inquire for IAP Track
          </button>
        </div>

        {/* Detailed Comparison Table Accordion */}
        <div className="text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#b58b42]" />
            <span>{showComparison ? 'Hide Full Comparison Matrix' : 'View Full Feature Comparison Matrix'}</span>
            {showComparison ? <ChevronUp className="w-4 h-4 text-sky-600" /> : <ChevronDown className="w-4 h-4 text-sky-600" />}
          </button>
        </div>

        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-sm"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sky-50/70 text-slate-700 border-b border-sky-100">
                  <th className="p-4 font-bold">Feature / Inclusion</th>
                  <th className="p-4 font-bold">Basic (₹40,000)</th>
                  <th className="p-4 font-bold text-sky-800">Premium Live (₹60,000)</th>
                  <th className="p-4 font-bold text-[#b58b42]">Premium Plus (₹75,000)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-4 font-medium text-slate-900">Full 3-Part CIA Curriculum</td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Live Weekend Classes (Fri/Sat)</td>
                  <td className="p-4 text-slate-400">Recorded Only</td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">BNC CIA 5,000+ MCQ Test Bank ($499 Value)</td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Physical Books Delivered Home</td>
                  <td className="p-4 text-slate-400">Add-on Option</td>
                  <td className="p-4 text-emerald-700 font-bold">Included Free</td>
                  <td className="p-4 text-emerald-700 font-bold">Included Free</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">LMS Portal Access Duration</td>
                  <td className="p-4">18 Months</td>
                  <td className="p-4 font-semibold text-slate-900">18 Months</td>
                  <td className="p-4 font-semibold text-slate-900">24 Months Extended</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Interactive Doubt Clearing Workshops</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Hands-on AI Audit Tools Training Lab</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 text-indigo-700 font-bold">30 Hrs AI Lab Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Placement & Resume Review Assistance</td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="p-4 text-emerald-700 font-bold">Priority Corporate Referral</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </section>
  );
};
