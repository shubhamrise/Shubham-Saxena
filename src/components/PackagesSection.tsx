import React, { useState } from 'react';
import { Currency } from '../types';
import { PACKAGES } from '../data/ciaData';
import { Check, ArrowRight, Sparkles, FileSpreadsheet, ChevronDown, ChevronUp, Download, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface PackagesSectionProps {
  currency: Currency;
  onOpenCheckout: (packageId: string) => void;
  onOpenInquiry: () => void;
  onOpenBrochure?: (packageId?: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  currency,
  onOpenCheckout,
  onOpenInquiry,
  onOpenBrochure,
}) => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="packages" className="relative overflow-hidden py-24 border-b border-sky-950">
      {/* Corporate Architectural Background Layer */}
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
        {/* Header - Directly matching Page 4 of the official BNC Elevate Brochure */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#f1bd5b]" />
            <span>PACKAGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Choose how you want to learn.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            All five packages cover every part of the CIA® exam. LMS access starts as soon as your admission is confirmed. IIA exam fees are paid separately.
          </p>

          {/* Promotional 20% off banner from Brochure Page 4 */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold shadow-lg">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Offer: 20% off the listed package price, valid till 31 March 2027</span>
          </div>

          {/* Brochure & Fee Structure Option */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenBrochure?.('all')}
              className="btn-reflection px-6 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-800/25 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#f1bd5b]" />
              <span>Download Official Student Brochure (PDF)</span>
            </button>
            <button
              onClick={onOpenInquiry}
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span>Request Fee Counseling</span>
            </button>
          </div>
        </div>

        {/* 5 Package Cards Grid matching Brochure Page 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch mb-16 pt-6">
          {PACKAGES.map((pkg) => {
            const isPopular = pkg.isPopular;

            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 overflow-visible ${
                  isPopular
                    ? 'bg-white border-2 border-[#b58b42] shadow-xl ring-4 ring-[#b58b42]/15'
                    : 'bg-white border border-sky-100 hover:border-[#b58b42]/40 shadow-sm'
                }`}
              >
                {/* Dedicated internal reflection layer that clips to card shape without clipping external badge */}
                <div className="card-reflection-layer rounded-3xl z-0" />

                {/* Popular / Tier Badge from Brochure Page 4 */}
                {pkg.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap border border-white/50 ${
                      pkg.id === 'elite'
                        ? 'bg-gradient-to-r from-amber-600 via-[#b58b42] to-amber-700'
                        : pkg.id === 'premium-plus'
                        ? 'bg-gradient-to-r from-purple-700 via-sky-800 to-indigo-800'
                        : pkg.id === 'premium-live'
                        ? 'bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42]'
                        : pkg.id === 'premium'
                        ? 'bg-gradient-to-r from-sky-800 to-teal-800'
                        : 'bg-gradient-to-r from-slate-700 to-slate-800'
                    }`}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    {/* Header info */}
                    <div className="mb-2">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                        {pkg.name}
                      </h3>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5">
                        {pkg.deliverables.mode}
                      </div>
                    </div>

                    {/* Pricing Display from Brochure Page 4 */}
                    <div className="my-3.5 pt-3 pb-3 border-y border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight">
                          {currency === 'INR'
                            ? `₹${pkg.priceINR.toLocaleString('en-IN')}`
                            : `$${pkg.priceUSD.toLocaleString('en-US')}`}
                        </span>
                        {pkg.originalPriceINR && (
                          <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
                            {currency === 'INR'
                              ? `₹${pkg.originalPriceINR.toLocaleString('en-IN')}`
                              : `$${pkg.originalPriceUSD?.toLocaleString('en-US')}`}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-block">
                        {pkg.offerNote || 'full program 20% off till 31 Mar 2027'}
                      </div>
                    </div>

                    {/* Metric Highlights Tiles from Brochure Page 4 */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-700">
                      <div className="p-2 rounded-xl bg-sky-50/70 border border-sky-100">
                        <div className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Instruction</div>
                        <div className="font-bold text-sky-950 text-xs mt-0.5 leading-tight">
                          {pkg.deliverables.hours}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                        <div className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">LMS Access</div>
                        <div className="font-bold text-[#b58b42] text-xs mt-0.5 leading-tight">
                          {pkg.deliverables.lmsAccess}
                        </div>
                      </div>
                    </div>

                    {/* Features List Header & Checklist from Page 4 */}
                    <div className="space-y-2 mb-6">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        {pkg.featuresHeader || "What's included"}
                      </div>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-[#b58b42] shrink-0 mt-0.5" />
                          <span className="leading-snug text-[11px] sm:text-xs">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom CTA Area with Reflection Effect */}
                  <div className="pt-4 border-t border-sky-50 space-y-2 mt-auto">
                    <button
                      onClick={() => onOpenCheckout(pkg.id)}
                      className={`btn-reflection w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer ${
                        isPopular
                          ? 'bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white shadow-sky-800/25 hover:shadow-[#b58b42]/30'
                          : pkg.id === 'elite'
                          ? 'bg-gradient-to-r from-amber-600 via-[#b58b42] to-amber-700 text-white shadow-amber-800/20'
                          : 'bg-sky-100/70 hover:bg-sky-200/70 text-sky-950 border border-sky-300 hover:border-sky-400'
                      }`}
                    >
                      <span>Enrol now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenBrochure?.(pkg.id)}
                      className="w-full py-1 text-xs font-semibold text-slate-600 hover:text-sky-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#b58b42]" />
                      <span className="text-[11px]">Download Brochure (PDF)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Standalone IAP Milestone Banner */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-sky-50/50 via-white to-amber-50/40 border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 shadow-sm overflow-hidden">
          <div className="card-reflection-layer rounded-3xl z-0" />
          <div className="relative z-10 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#b58b42] border border-amber-200 uppercase tracking-wider">
              STUDENT FIRST MILESTONE
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              New to audit? Start with the IAP™
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              The Internal Audit Practitioner from IIA India is an affordable, accessible first step for students: no bachelor’s degree needed, add permanent "IAP" designation to your name, and skip CIA Part 1 later!
            </p>
          </div>
          <button
            onClick={() => onOpenCheckout('basic')}
            className="btn-reflection relative z-10 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-sky-800/20"
          >
            Inquire for IAP Track
          </button>
        </div>

        {/* Comparison Matrix Table matching bottom table of Page 4 */}
        <div className="text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#b58b42]" />
            <span>{showComparison ? 'Hide Feature Summary Table' : 'View Full Package Summary Table (from Brochure Page 4)'}</span>
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
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-sky-50/70 text-slate-700 border-b border-sky-100">
                  <th className="p-3.5 font-bold">Feature / Inclusion</th>
                  <th className="p-3.5 font-bold">Basic Self-Paced</th>
                  <th className="p-3.5 font-bold text-sky-800">Premium</th>
                  <th className="p-3.5 font-bold text-[#b58b42]">Premium Live</th>
                  <th className="p-3.5 font-bold text-purple-800">Premium Plus</th>
                  <th className="p-3.5 font-bold text-amber-800">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="bg-amber-50/30">
                  <td className="p-3.5 font-bold text-slate-900">Format</td>
                  <td className="p-3.5 font-medium text-slate-800">Recorded</td>
                  <td className="p-3.5 font-medium text-slate-800">Recorded + doubts</td>
                  <td className="p-3.5 font-medium text-slate-800">Live weekends</td>
                  <td className="p-3.5 font-medium text-slate-800">Live + AI Lab</td>
                  <td className="p-3.5 font-medium text-slate-800">Live + mentorship</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Printed books and test bank</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 font-bold text-emerald-700">Included</td>
                  <td className="p-3.5 font-bold text-emerald-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">AI audit training and certificate</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 font-bold text-emerald-700">Included</td>
                  <td className="p-3.5 font-bold text-emerald-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Expert mentorship</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 text-slate-400">–</td>
                  <td className="p-3.5 font-bold text-amber-900 bg-amber-50/50">Included</td>
                </tr>
                <tr className="bg-slate-50/70">
                  <td className="p-3.5 font-bold text-slate-900">Full Program Fee (20% Off)</td>
                  <td className="p-3.5 font-bold text-slate-900">₹36,000</td>
                  <td className="p-3.5 font-bold text-slate-900">₹48,000</td>
                  <td className="p-3.5 font-bold text-sky-800">₹65,600</td>
                  <td className="p-3.5 font-bold text-purple-900">₹92,000</td>
                  <td className="p-3.5 font-bold text-amber-900">₹1,16,000</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Brochure Download</td>
                  {PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="p-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenBrochure?.(pkg.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 hover:text-[#b58b42] underline cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#b58b42]" />
                        <span>Download</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="p-3 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-200">
              Offer: 20% off the listed package price, valid till 31 March 2027. IIA exam fees are paid separately.
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
