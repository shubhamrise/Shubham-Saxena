import React, { useState } from 'react';
import { Currency } from '../types';
import {
  ArrowRight,
  Sparkles,
  Award,
  Globe,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Briefcase,
  Layers,
  GraduationCap,
  BookOpen,
  Check,
  Mail,
  Phone,
  User,
  Send,
  Clock
} from 'lucide-react';

interface HeroSectionProps {
  currency: Currency;
  onOpenCheckout: (packageId?: string) => void;
  onOpenQuiz: () => void;
  onOpenInquiry: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currency,
  onOpenCheckout,
  onOpenQuiz,
  onOpenInquiry,
}) => {
  // Hero Direct Enquiry Form State
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryQualification, setEnquiryQualification] = useState("Bachelor's / Master's Degree");
  const [enquiryProgram, setEnquiryProgram] = useState('Full 3-Part Live Accelerator');
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const existing = JSON.parse(localStorage.getItem('bnc_hero_enquiries') || '[]');
      existing.unshift({
        enquiryName,
        enquiryPhone,
        enquiryEmail,
        enquiryQualification,
        enquiryProgram,
        targetEmail: 'elevate@bncglobal.in',
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('bnc_hero_enquiries', JSON.stringify(existing));
    } catch (err) {
      console.log('Enquiry storage error', err);
    }

    try {
      await fetch('https://formsubmit.co/ajax/elevate@bncglobal.in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[BNC ELEVATE] Quick CIA Enquiry: ${enquiryName}`,
          _template: 'table',
          _captcha: 'false',
          'Enquiry Name': enquiryName,
          'Phone / WhatsApp': enquiryPhone,
          'Email Address': enquiryEmail,
          'Educational Qualification': enquiryQualification,
          'Preferred Program': enquiryProgram,
          'Submission Date': new Date().toLocaleString(),
        }),
      });
    } catch (err) {
      console.warn('Enquiry dispatch error', err);
    } finally {
      setIsSubmitting(false);
      setEnquirySubmitted(true);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-16 border-b border-sky-950">
      {/* High-Resolution Corporate Architectural Background Image - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/hero-bg.jpg"
          alt="BNC Corporate Architecture"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-130 brightness-75 saturate-110"
        />
        {/* Slightly dark executive navy & gold atmospheric vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/85 via-[#0a1c32]/75 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(2,132,199,0.22)_0%,_transparent_65%)]"></div>
        {/* Modern stylish grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.09]"></div>
      </div>

      {/* Background Ambient Lighting & Specular Atmospheric Glows with brand tones */}
      <div className="absolute inset-0 pointer-events-none opacity-45">
        <div className="absolute -top-32 left-1/4 w-[750px] h-[500px] bg-sky-300/35 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/2 -right-20 w-[600px] h-[500px] bg-[#b58b42]/15 rounded-full blur-[160px]"></div>
        <div className="absolute -bottom-16 left-12 w-[500px] h-[400px] bg-sky-200/40 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =============================================================== */}
        {/* TOP HERO ARCHITECTURE: PROGRAM LAUNCHPAD                        */}
        {/* =============================================================== */}
        <div className="text-center max-w-5xl lg:max-w-6xl mx-auto mb-10">
          {/* Top Elite Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/95 border border-sky-400/40 text-[11px] font-bold text-white shadow-lg backdrop-blur-md uppercase tracking-wider mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f1bd5b] animate-pulse shadow-[0_0_10px_#f1bd5b]"></span>
            <span className="text-white font-black tracking-wider">BNC GLOBAL CONSULTECH</span>
            <span className="text-[#f1bd5b]">·</span>
            <span className="text-sky-200 font-bold">ESTD. 2014</span>
            <span className="text-[#f1bd5b]">·</span>
            <span className="text-[#f1bd5b] font-black">CIA® EXECUTIVE ACCELERATOR</span>
          </div>

          {/* Central Program Master Headline (Keeps line 1 on single unbroken line on full screen) */}
          <h1 className="text-2xl sm:text-3xl md:text-[2.25rem] lg:text-[2.85rem] xl:text-[3.15rem] font-black text-white tracking-tight leading-[1.22] mb-4 text-center">
            <span className="block md:whitespace-nowrap text-white">Master Internal Audit with BNC ELEVATE</span>
            <span className="block my-2 text-[#f1bd5b] font-black drop-shadow-[0_2px_12px_rgba(241,189,91,0.35)]">Become a CIA</span>
            <span className="block md:whitespace-nowrap text-slate-100">Lead Enterprise Governance Globally</span>
          </h1>

          {/* Master Program Subtext */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Complete exam preparation featuring 150+ hours of live weekend coaching, proprietary BNC 5,000+ MCQ test banks, modern AI audit workflow training, and dedicated placement advisory.
          </p>
        </div>

        {/* =============================================================== */}
        {/* FIRST PAGE SPLIT: CONTENT (LEFT) + DIRECT ENQUIRY FORM (RIGHT)  */}
        {/* =============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column (7 cols): CTAs, 4 Metric Tiles, and Consulting Callout */}
          <div className="lg:col-span-7 space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenCheckout('premium')}
                className="btn-reflection inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] shadow-xl shadow-sky-800/25 hover:shadow-[#b58b42]/30 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Explore Packages & Enroll Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenQuiz}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 shadow-xs hover:border-[#b58b42]/70 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#f1bd5b]" />
                <span>Try Real Practice MCQ</span>
              </button>

              <button
                onClick={onOpenInquiry}
                className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-[#f1bd5b] transition-colors cursor-pointer"
              >
                Request Syllabus PDF
              </button>
            </div>

            {/* 4 Quantifiable Live Metrics Strip in 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3.5 text-left">
              <div className="card-reflection p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg hover:border-sky-400 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight mb-0.5 tabular-nums">94%</div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">First-Time Pass Rate</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  Compared to global average of 42%, our structured live mocks deliver verifiable pass results.
                </div>
              </div>

              <div className="card-reflection p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg hover:border-[#b58b42]/70 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f1bd5b] tracking-tight mb-0.5 tabular-nums">150+ Hrs</div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Live Interactive Classes</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  Weekly live classes every Friday & Saturday, complete with instant HD portal recordings.
                </div>
              </div>

              <div className="card-reflection p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg hover:border-sky-400 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight mb-0.5 tabular-nums">$499</div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Test Bank Included Free</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  Physical copy of BNC CIA Books & 5,000+ practice questions delivered to your doorstep.
                </div>
              </div>

              <div className="card-reflection p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg hover:border-[#b58b42]/70 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f1bd5b] tracking-tight mb-0.5 tabular-nums">170+</div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Countries Recognition</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  The premier designation preferred by 70% of CAEs globally over CA/CPA for internal audit.
                </div>
              </div>
            </div>

            {/* Consulting & Placement Callout */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 shadow-md">
              <ShieldCheck className="w-5 h-5 text-[#f1bd5b] shrink-0" />
              <span>
                <strong className="text-white font-semibold">Active Risk Consulting Practice:</strong> Apart from an educational company, BNC is an active risk consulting and accounting company providing recruitment and placement support.
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Direct Enquiry Form Routing to elevate@bncglobal.in */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-950/5 p-6 sm:p-7 overflow-hidden hover:border-[#b58b42]/30 transition-colors">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42]"></div>

              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-[#b58b42] uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#b58b42] animate-pulse"></span>
                  ADMISSIONS & COUNSELING DESK
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Speak to a Senior CIA® Counselor
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Receive syllabus roadmap, fee scholarship options & personalized eligibility advice.
                </p>
              </div>

              {enquirySubmitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Enquiry Dispatched!</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Thank you, <strong className="text-slate-900">{enquiryName}</strong>. Your enquiry details have been delivered to{' '}
                      <span className="font-bold text-sky-950">elevate@bncglobal.in</span>.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Our Lead Academic Counselor will contact you via WhatsApp / Phone at{' '}
                      <strong className="text-blue-950">{enquiryPhone}</strong> within 2 business hours.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href="https://wa.me/919810575613?text=Hi%20BNC%20ELEVATE%2C%20I%20have%20submitted%20an%20enquiry%20for%20CIA%20coaching."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <span>Direct WhatsApp +91 98105 75613</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setEnquirySubmitted(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer py-1"
                    >
                      Submit another enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        placeholder="e.g., Rohit Verma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-700 focus:bg-white focus:ring-2 focus:ring-sky-200 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          value={enquiryPhone}
                          onChange={(e) => setEnquiryPhone(e.target.value)}
                          placeholder="+91 98105 75613"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-700 focus:bg-white focus:ring-2 focus:ring-sky-200 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={enquiryEmail}
                          onChange={(e) => setEnquiryEmail(e.target.value)}
                          placeholder="name@firm.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-700 focus:bg-white focus:ring-2 focus:ring-sky-200 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Background
                      </label>
                      <select
                        value={enquiryQualification}
                        onChange={(e) => setEnquiryQualification(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-slate-900 text-xs focus:outline-none focus:border-sky-700 focus:bg-white focus:ring-2 focus:ring-sky-200 transition-all"
                      >
                        <option>Working Internal Auditor</option>
                        <option>CA / CPA / ACCA / CMA</option>
                        <option>Bachelor's / Master's Degree</option>
                        <option>Risk & Compliance Officer</option>
                        <option>Commerce College Student</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Program
                      </label>
                      <select
                        value={enquiryProgram}
                        onChange={(e) => setEnquiryProgram(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-slate-900 text-xs focus:outline-none focus:border-sky-700 focus:bg-white focus:ring-2 focus:ring-sky-200 transition-all"
                      >
                        <option>Full 3-Part Live Accelerator</option>
                        <option>Premium Plus with AI Audit Lab</option>
                        <option>Self-Paced Recorded Prep</option>
                        <option>CA/CPA CIA Challenge Exam</option>
                        <option>IAP Part 1 Student Fast-Track</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-reflection w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Submitting Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Direct academic dispatch · Response within 2 business hours
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* THE 3 PILLARS MASTER ARCHITECTURE (MERGED WITH ZERO DUPLICATION) */}
        {/* Pillar 01: Why CIA | Pillar 02: Why BNC Global | Pillar 03: Tutor */}
        {/* =============================================================== */}
        <div className="mt-8 pt-8 border-t border-sky-950">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 text-[#f1bd5b] border border-[#b58b42]/40 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#f1bd5b]" />
              <span>THE 3 PILLARS OF YOUR CERTIFICATION JOURNEY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why CIA® · Why BNC Global · Master Faculty
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Everything you need to qualify, practice, and lead enterprise internal audit globally—all in one unified program.
            </p>
          </div>

          {/* 3-Column Split-Grid Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* ----------------------------------------------------------- */}
            {/* PILLAR 01 OF 03: WHY THE CIA® (THE CREDENTIAL)              */}
            {/* ----------------------------------------------------------- */}
            <div
              id="why-cia"
              className="card-reflection group relative flex flex-col justify-between rounded-3xl bg-white border-2 border-sky-100 hover:border-sky-400 p-6 sm:p-7 shadow-[0_15px_45px_-12px_rgba(2,132,199,0.12)] hover:shadow-[0_25px_60px_-12px_rgba(2,132,199,0.22)] transition-all duration-300 overflow-hidden"
            >
              {/* Top Gradient Banner Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-sky-800 to-[#b58b42]"></div>

              <div>
                {/* Pillar 01 Kicker */}
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-sky-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100/80 text-sky-950 border border-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                    PILLAR 01 OF 03 · THE CREDENTIAL
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#b58b42] bg-amber-50 border border-amber-200">
                    <Sparkles className="w-3 h-3 text-[#b58b42]" />
                    Global Gold Standard
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  Why the CIA® is the Global Gold Standard
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  The Certified Internal Auditor (CIA®) is the only globally recognized certification specifically tailored for internal audit, enterprise risk governance, and regulatory compliance.
                </p>

                {/* 3 Value Pillars inside Pillar 01 */}
                <div className="space-y-3 mb-5">
                  {/* Global Portability */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/80 to-white border border-sky-200/80 hover:border-sky-400 hover:shadow-xs transition-all">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-black text-slate-900">Global Portability (170+ Countries)</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-11 mb-2">
                      Recognized in over 170+ countries by multinational corporations, central banks, and regulatory bodies. Travel seamlessly across US, UK, Middle East, Singapore, and Europe.
                    </p>
                    <div className="pl-11 text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                      <span>Accepted across 170+ countries</span>
                    </div>
                  </div>

                  {/* 94% Audit Leader Preference */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/80 hover:border-[#b58b42] hover:shadow-xs transition-all">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-[#b58b42] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-black text-slate-900">94% Audit Leader Preference</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-11 mb-2">
                      According to the IIA North American Pulse of Internal Audit survey, 94% of audit leaders value CIA over CA/CPA, and 70% of CAEs explicitly prefer hiring CIAs.
                    </p>
                    <div className="pl-11 text-[11px] font-bold text-[#b58b42] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b58b42]"></span>
                      <span>Source: IIA Pulse Survey</span>
                    </div>
                  </div>

                  {/* 40%+ Compensation Premium */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/80 to-white border border-sky-200/80 hover:border-sky-400 hover:shadow-xs transition-all">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-700 to-sky-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-black text-slate-900">40%+ Compensation Premium</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-11 mb-2">
                      Certified Internal Auditors command up to 40% higher median earnings, accelerating promotion to Senior Auditor, Audit Manager, and Chief Audit Executive.
                    </p>
                    <div className="pl-11 text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>Average package: ₹12L - ₹28L+</span>
                    </div>
                  </div>
                </div>

                {/* Alumni Strip */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-800 shrink-0" />
                    <span>Where BNC alumni lead internal audit:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black text-slate-800">
                    {['DELOITTE', 'EY', 'PwC', 'KPMG', 'BARCLAYS', 'GRANT THORNTON', 'GENPACT GCC'].map((firm, fIdx) => (
                      <span key={fIdx} className="px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs font-bold text-slate-700 hover:border-sky-400 transition-colors">
                        {firm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-3 border-t border-sky-100">
                <button
                  onClick={() => scrollTo('exam')}
                  className="btn-reflection w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-950 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-sky-800/20"
                >
                  <span>Explore 3-Part Exam Structure</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* PILLAR 02 OF 03: WHY BNC GLOBAL (THE CONSULTING PRACTICE)   */}
            {/* ----------------------------------------------------------- */}
            <div
              id="why-bnc"
              className="card-reflection group relative flex flex-col justify-between rounded-3xl bg-white border-2 border-amber-200 hover:border-[#b58b42] p-6 sm:p-7 shadow-[0_15px_45px_-12px_rgba(181,139,66,0.12)] hover:shadow-[0_25px_60px_-12px_rgba(181,139,66,0.25)] transition-all duration-300 overflow-hidden"
            >
              {/* Top Gradient Banner Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b58b42] via-amber-500 to-sky-700"></div>

              <div>
                {/* Pillar 02 Kicker */}
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-amber-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#b58b42] border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b58b42]"></span>
                    PILLAR 02 OF 03 · THE CONSULTING PRACTICE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200">
                    Established 2014
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      WHY BNC Global?
                    </h3>
                    <div className="text-xs font-bold text-[#b58b42] mt-0.5">
                      Multidisciplinary Consulting Firm & Risk Advisory
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#b58b42] to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Core Advisory Background */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-sky-50/40 border-l-4 border-l-[#b58b42] border border-amber-100 text-xs text-slate-700 leading-relaxed mb-4 shadow-2xs">
                  <p>
                    <strong className="text-slate-950 font-bold">BNC Global Consultech established in 2014</strong> is a multidisciplinary consulting firm specializing in risk advisory, internal audit, compliance, financial consulting, cybersecurity, ESG, and GCC advisory. We help businesses strengthen governance, navigate complex regulations, and achieve sustainable growth across India and international markets.
                  </p>
                </div>

                {/* Placement & Recruitment Support Highlight Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-amber-500/10 border border-amber-300 text-xs text-slate-900 font-semibold flex items-start gap-3 mb-4 shadow-2xs">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-700 to-[#b58b42] text-white shrink-0 mt-0.5 shadow-xs">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <span className="leading-relaxed">
                    Apart from an educational company, BNC is an active risk consulting and accounting company providing recruitment and placement support for our candidates across corporate and GCC internal audit teams.
                  </span>
                </div>

                {/* Core Advisory Verticals */}
                <div className="mb-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-800" />
                    <span>Core Advisory Verticals:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Risk Advisory',
                      'Internal Audit',
                      'Regulatory Compliance',
                      'Financial Consulting',
                      'Cybersecurity',
                      'ESG Frameworks',
                      'GCC Advisory'
                    ].map((service, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-amber-200/80 text-slate-800 shadow-2xs hover:border-[#b58b42] hover:bg-amber-50/50 transition-colors"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3 Career Support Phases */}
                <div className="space-y-2.5 pt-3.5 border-t border-amber-100 mb-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1">
                    Three-Phase Career Support Initiative:
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50/70 to-white border border-sky-200/80 hover:border-sky-400 transition-all">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                      <span>Phase 1: Internal Audit Career Navigators</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Guidance on GCCs, banking, and Big 4 roles during your study. Help identifying suitable audit internships and qualifying work experience.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/70 to-white border border-amber-200/80 hover:border-[#b58b42] transition-all">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#b58b42] text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                      <span>Phase 2: Placement Assistance Network</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Resume optimization for internal audit keywords, mock interview preparation, and direct vacancy referrals across BNC Global's client network.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50/70 to-white border border-sky-200/80 hover:border-sky-400 transition-all">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                      <span>Phase 3: Honest Mentorship & CPE Compliance</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Clear upfront costs, zero hidden institutional fees, and ongoing annual CPE reporting support after you earn your designation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-3 border-t border-amber-100">
                <button
                  onClick={() => scrollTo('packages')}
                  className="btn-reflection w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#b58b42] via-amber-600 to-[#9e7735] hover:from-[#9e7735] hover:to-[#846328] text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#b58b42]/20"
                >
                  <span>View BNC Training Packages</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* PILLAR 03 OF 03: MASTER FACULTY (CA GURVINDER PAL SINGH)    */}
            {/* ----------------------------------------------------------- */}
            <div
              id="tutor"
              className="card-reflection group relative flex flex-col justify-between rounded-3xl bg-white border-2 border-sky-100 hover:border-sky-400 p-6 sm:p-7 shadow-[0_15px_45px_-12px_rgba(2,132,199,0.12)] hover:shadow-[0_25px_60px_-12px_rgba(2,132,199,0.22)] transition-all duration-300 overflow-hidden"
            >
              {/* Top Gradient Banner Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42]"></div>

              <div>
                {/* Pillar 03 Kicker */}
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-sky-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100/80 text-sky-950 border border-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                    PILLAR 03 OF 03 · THE MASTER FACULTY
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#b58b42] bg-amber-50 border border-amber-200">
                    <ShieldCheck className="w-3 h-3 text-[#b58b42]" />
                    100% Live Coaching
                  </span>
                </div>

                {/* Faculty Portrait & Name Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-3 ring-[#b58b42]/30 bg-slate-100">
                      <img
                        src="/gurvinder-singh.jpg"
                        alt="CA Gurvinder Pal Singh - Lead CIA Tutor"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://media.licdn.com/dms/image/v2/D4D03AQFKN921POxWQQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1665576222272?e=1794441600&v=beta&t=7zjsxMAB5avCzv9T1LNMnGe9SwBaFHOSQOH9g89uiw8';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-700 to-[#b58b42] text-white text-[9px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap">
                      <ShieldCheck className="w-2.5 h-2.5 text-amber-200" />
                      <span>Lead Faculty</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      CA Gurvinder Pal Singh
                    </h3>
                    <div className="text-xs font-bold text-[#b58b42] mt-0.5 mb-1.5">
                      Co-Founder & Managing Director, BNC Global
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                      Gain direct personal mentorship from BNC Global's Co-Founder & Managing Director—bringing 21+ years of Big 4 consulting, enterprise risk management, and internal audit leadership straight into your classroom.
                    </p>
                  </div>
                </div>

                {/* 4 Quantifiable Badges with stylish glossy look */}
                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="p-2.5 rounded-xl bg-gradient-to-b from-sky-50 to-white border border-sky-200 shadow-2xs">
                    <div className="text-base font-black text-sky-950 tabular-nums">21+</div>
                    <div className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">Yrs Exp</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-2xs">
                    <div className="text-base font-black text-[#b58b42]">Big 4</div>
                    <div className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">Ex-KPMG</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-b from-sky-50 to-white border border-sky-200 shadow-2xs">
                    <div className="text-base font-black text-sky-950">Aon</div>
                    <div className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">Ex-AVP</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-2xs">
                    <div className="text-base font-black text-[#b58b42]">ICAI</div>
                    <div className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">SRSB</div>
                  </div>
                </div>

                {/* Professional Career Track Record */}
                <div className="space-y-2 mb-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-sky-800" />
                    <span>Leadership & Corporate Career:</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs flex justify-between items-start gap-2 hover:bg-sky-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">Special Invitee – Sustainability Standards Board (SRSB)</div>
                      <div className="text-[10px] text-slate-600">Institute of Chartered Accountants of India (ICAI)</div>
                    </div>
                    <span className="text-[9px] font-bold text-sky-950 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 shrink-0">
                      2025–Present
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex justify-between items-start gap-2 hover:bg-amber-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">Co-Founder & Managing Director</div>
                      <div className="text-[10px] text-slate-600">BNC Global Consultech</div>
                    </div>
                    <span className="text-[9px] font-bold text-[#b58b42] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 shrink-0">
                      2018–Present
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-start gap-2 hover:bg-slate-100/70 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">AVP – Internal Audit</div>
                      <div className="text-[10px] text-slate-600">Aon Global Risk Solutions</div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                      2016–2018
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-start gap-2 hover:bg-slate-100/70 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">Manager & Assistant Manager</div>
                      <div className="text-[10px] text-slate-600">KPMG Risk Consulting</div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                      2011–2015
                    </span>
                  </div>
                </div>

                {/* Academic & Professional Credentials */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50/80 to-amber-50/50 border border-sky-200 text-xs text-slate-800 flex items-center justify-between mb-4 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-800 shrink-0" />
                    <span className="text-[11px] font-bold">CA (ICAI) · B.Com (Hons.), Sri Guru Gobind Singh College of Commerce, DU</span>
                  </div>
                  <span className="text-[9px] font-black text-[#b58b42] bg-white px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                    Verified
                  </span>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-sky-100 flex gap-2">
                <button
                  onClick={() => onOpenCheckout('premium')}
                  className="btn-reflection flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenInquiry}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
                >
                  Consultation
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
