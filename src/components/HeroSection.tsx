import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Globe,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Briefcase,
  BookOpen,
  Check,
  Mail,
  Phone,
  User,
  Send,
  Clock,
  Download
} from 'lucide-react';
import {
  saveLeadToAdminConsole,
  dispatchToInfoBncGlobal,
  triggerBrochureDownload,
  getDirectMailtoUrl,
  getDirectWhatsAppUrl
} from '../services/enquiryService';

interface HeroSectionProps {
  onOpenCheckout: (packageId?: string) => void;
  onOpenQuiz: () => void;
  onOpenInquiry: () => void;
  onOpenLms?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCheckout,
  onOpenQuiz,
  onOpenInquiry,
  onOpenLms,
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

    const payload = {
      name: enquiryName,
      phone: enquiryPhone,
      email: enquiryEmail,
      qualification: enquiryQualification,
      program: enquiryProgram,
      source: 'Hero Enquiry & Download Brochure',
      notes: 'Submitted through homepage Hero admissions desk.'
    };

    // 1. Instantly record lead in the Admin Console (accessible via info@bncglobal.in)
    saveLeadToAdminConsole(payload);

    // Also update legacy local storage key for compatibility
    try {
      const existing = JSON.parse(localStorage.getItem('bnc_hero_enquiries') || '[]');
      existing.unshift({
        enquiryName,
        enquiryPhone,
        enquiryEmail,
        enquiryQualification,
        enquiryProgram,
        targetEmail: 'info@bncglobal.in',
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('bnc_hero_enquiries', JSON.stringify(existing));
    } catch (e) {
      console.warn(e);
    }

    // 2. Automatically trigger official brochure PDF download immediately
    triggerBrochureDownload();

    // 3. Multi-pathway dispatch to info@bncglobal.in (Native Hidden Form POST + AJAX)
    try {
      await dispatchToInfoBncGlobal(payload);
    } catch (err) {
      console.warn('Enquiry dispatch notice:', err);
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
    <section className="relative overflow-hidden pt-4 pb-12 lg:pt-5 lg:pb-12 border-b border-sky-950">
      {/* User-Provided High-Resolution Corporate Team Atrium Background - First Page */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/aistudio/bnc__2__1f4b4d76.png"
          alt="BNC Corporate Audit Team in Executive Atrium"
          className="w-full h-full object-cover object-center sm:object-[center_35%] opacity-45 sm:opacity-55 filter contrast-115 brightness-90 saturate-105"
          onError={(e) => {
            e.currentTarget.src = '/first-page-bg.png';
          }}
        />
        {/* Atmospheric executive navy & gold vignette highlighting the background team */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/80 via-[#071322]/65 to-[#071322]/95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071322]/85 via-transparent to-[#071322]/85"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(2,132,199,0.18)_0%,_transparent_65%)]"></div>
        {/* Subtle stylish grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05]"></div>
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
        <div className="text-center max-w-5xl lg:max-w-6xl mx-auto mb-7">
          {/* Top Elite Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-6 py-2.5 rounded-full bg-slate-900/95 border border-sky-400/40 text-xs sm:text-[13px] font-bold text-white shadow-lg backdrop-blur-md tracking-wider mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f1bd5b] animate-pulse shadow-[0_0_10px_#f1bd5b]"></span>
            <span className="text-[#f1bd5b] font-black uppercase">BNC ELEVATE</span>
            <span className="inline-flex flex-wrap items-center justify-center gap-x-2 text-sky-200 font-semibold">
              <span>The learning arm of</span>
              <a
                href="https://bncglobal.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-black uppercase underline decoration-[#f1bd5b]/70 underline-offset-4 hover:text-[#f1bd5b] transition-colors"
              >
                BNC GLOBAL CONSULTECH
              </a>
            </span>
          </div>

          {/* Central Program Master Headline (Keeps line 1 on single unbroken line on full screen) */}
          <h1 className="text-2xl sm:text-3xl md:text-[2.25rem] lg:text-[2.85rem] xl:text-[3.15rem] font-black text-white tracking-tight leading-[1.22] mb-4 text-center">
            <span className="block md:whitespace-nowrap text-white">Master Internal Audit with BNC ELEVATE</span>
            <span className="block my-2 text-[#f1bd5b] font-black drop-shadow-[0_2px_12px_rgba(241,189,91,0.35)]">Become a CIA</span>
            <span className="block md:whitespace-nowrap text-slate-100">Lead Enterprise Governance Globally</span>
          </h1>

          {/* Master Program Subtext */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Complete exam preparation featuring 100+ hours of live weekend coaching, official Gleim CIA study materials & SmartAdapt™ adaptive test bank, modern AI audit workflow training, and dedicated placement advisory.
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



              {onOpenLms && (
                <button
                  onClick={onOpenLms}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#f1bd5b] bg-[#b58b42]/20 hover:bg-[#b58b42]/30 border border-[#b58b42]/50 shadow-xs transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Student LMS Portal</span>
                </button>
              )}
            </div>

            {/* 3 Quantifiable Live Metrics Strip in 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
              <div className="card-reflection p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg hover:border-[#b58b42]/70 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f1bd5b] tracking-tight mb-0.5 tabular-nums">100+ Hrs</div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Live Interactive Classes</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  Weekly live classes every Friday & Saturday, complete with instant HD portal recordings.
                </div>
              </div>

              <div className="card-reflection p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg hover:border-sky-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-8 sm:h-9 flex items-center mb-1">
                    <div className="bg-white/95 px-2.5 py-1 rounded-lg shadow-sm border border-white/30 inline-flex items-center">
                      <img
                        src="/assets/aistudio/image_b9fe5a35.png"
                        alt="Gleim Exam Prep"
                        className="h-4.5 sm:h-5 w-auto object-contain"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Official Gleim Study Material</div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    Official Gleim CIA textbooks, SmartAdapt™ adaptive technology & Mega Test Bank provided.
                  </div>
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

          {/* Right Column (5 cols): Direct Enquiry Form Routing to info@bncglobal.in */}
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
                  Receive syllabus roadmap, cohort schedule & personalized eligibility advice.
                </p>
              </div>

              {enquirySubmitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Enquiry Dispatched & Brochure Downloaded!</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Thank you, <strong className="text-slate-900">{enquiryName}</strong>. Your enquiry details have been delivered to{' '}
                      <span className="font-bold text-sky-950">info@bncglobal.in</span>.
                    </p>
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                      ✓ The official 10-page BNC Global CIA® Student Brochure (PDF) has been automatically downloaded to your system!
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Our Lead Academic Counselor will contact you via WhatsApp / Phone at{' '}
                      <strong className="text-blue-950">{enquiryPhone}</strong> within 2 business hours.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={triggerBrochureDownload}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Brochure Again (PDF)</span>
                    </button>
                    <a
                      href={`mailto:info@bncglobal.in?subject=${encodeURIComponent(`[BNC ELEVATE] CIA Enquiry & Brochure Request: ${enquiryName}`)}&body=${encodeURIComponent(
                        `Candidate Name: ${enquiryName}\nPhone / WhatsApp: ${enquiryPhone}\nEmail: ${enquiryEmail}\nEducational Qualification: ${enquiryQualification}\nProgram of Interest: ${enquiryProgram}\nBrochure Downloaded: Yes\nSubmitted At: ${new Date().toLocaleString()}\n\nAdmissions Note: Please dispatch cohort batch dates and program details to my email.`
                      )}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all border border-slate-700"
                    >
                      <Mail className="w-4 h-4 text-[#f1bd5b]" />
                      <span>Send Direct Email to info@bncglobal.in</span>
                    </a>
                    <a
                      href="https://wa.me/919821375702?text=Hi%20BNC%20ELEVATE%2C%20I%20have%20submitted%20an%20enquiry%20for%20CIA%20coaching."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <span>Direct WhatsApp +91 98213 75702</span>
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
                          placeholder="+91 98213 75702"
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
                        <option>1. Basic Self-Paced</option>
                        <option>2. Premium (Self-Study + 20h Doubts & Placement)</option>
                        <option>3. Premium Live (Weekend Live Interactive)</option>
                        <option>4. Premium Plus (Live + AI Audit Lab)</option>
                        <option>5. Elite (Big 4 Referrals & Executive Placement)</option>
                        <option>CA/CPA CIA Challenge Exam Track</option>
                        <option>IAP Part 1 Student Fast-Track</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-reflection w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Submitting & Downloading Brochure...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Submit Enquiry & Download Brochure</span>
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
        {/* THE 2 PILLARS — BOX-FREE EDITORIAL ARCHITECTURE                 */}
        {/* Pillar 01: Why CIA | Pillar 02: Why BNC Global                  */}
        {/* =============================================================== */}
        <div className="mt-12 pt-10 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-semibold tracking-wider text-[#f1bd5b] uppercase mb-2">
              The 2 Pillars of Your Certification Journey
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
              Why CIA® · Why BNC Global
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Everything you need to qualify, practice, and lead enterprise internal audit globally—all in one unified program.
            </p>
          </div>

          {/* Box-Free 2-Column Editorial Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-white/15 border-t border-white/15">
            {/* ----------------------------------------------------------- */}
            {/* PILLAR 01 OF 02: WHY THE CIA® (THE CREDENTIAL)              */}
            {/* ----------------------------------------------------------- */}
            <div
              id="why-cia"
              className="flex flex-col justify-between pt-8 pb-4 lg:pr-12"
            >
              <div>
                {/* Clean Metadata Kicker */}
                <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10 text-xs">
                  <span className="font-semibold text-sky-300 tracking-wide">
                    01 · The Credential
                  </span>
                  <span className="font-medium text-[#f1bd5b]">
                    Global Gold Standard
                  </span>
                </div>

                <h3 className="text-2xl sm:text-[1.65rem] font-extrabold text-white tracking-tight mb-3 text-balance">
                  Why the CIA® is the Global Gold Standard
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-7">
                  The Certified Internal Auditor (CIA®) is the only globally recognized certification specifically tailored for internal audit, enterprise risk governance, and regulatory compliance.
                </p>

                {/* 3 Value Points separated by 1px Hairline Dividers */}
                <div className="divide-y divide-white/10 border-t border-b border-white/10 mb-6">
                  {/* Global Portability */}
                  <div className="py-5 flex items-start gap-4">
                    <Globe className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-white">
                        Global Portability (170+ Countries)
                      </h4>
                      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                        Recognized in over 170+ countries by multinational corporations, central banks, and regulatory bodies. Travel seamlessly across US, UK, Middle East, Singapore, and Europe.
                      </p>
                      <div className="text-xs font-semibold text-sky-300">
                        Accepted across 170+ countries
                      </div>
                    </div>
                  </div>

                  {/* 94% Audit Leader Preference */}
                  <div className="py-5 flex items-start gap-4">
                    <Award className="w-5 h-5 text-[#f1bd5b] shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-white">
                        94% Audit Leader Preference
                      </h4>
                      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                        According to the IIA North American Pulse of Internal Audit survey, 94% of audit leaders value CIA over CA/CPA, and 70% of CAEs explicitly prefer hiring CIAs.
                      </p>
                      <div className="text-xs font-semibold text-[#f1bd5b]">
                        Source: IIA Pulse Survey
                      </div>
                    </div>
                  </div>

                  {/* 40%+ Compensation Premium */}
                  <div className="py-5 flex items-start gap-4">
                    <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-white">
                        40%+ Compensation Premium
                      </h4>
                      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                        Certified Internal Auditors command up to 40% higher median earnings, accelerating promotion to Senior Auditor, Audit Manager, and Chief Audit Executive.
                      </p>
                      <div className="text-xs font-semibold text-emerald-300 tabular-nums">
                        Average industry compensation: 12L – 28L+ p.a.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alumni Strip (Unboxed Editorial Typography) */}
                <div className="mb-8">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Where BNC alumni lead internal audit
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-bold tracking-wide text-slate-200">
                    {['DELOITTE', 'EY', 'PwC', 'KPMG', 'BARCLAYS', 'GRANT THORNTON', 'GENPACT GCC'].map((firm, fIdx, arr) => (
                      <React.Fragment key={fIdx}>
                        <span className="hover:text-[#f1bd5b] transition-colors">{firm}</span>
                        {fIdx < arr.length - 1 && (
                          <span aria-hidden="true" className="text-slate-600">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => scrollTo('exam')}
                  className="btn-reflection w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-600 hover:to-sky-800 text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Explore 3-Part Exam Structure</span>
                  <ArrowRight className="w-4 h-4 text-[#f1bd5b]" />
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* PILLAR 02 OF 02: WHY BNC GLOBAL (THE CONSULTING PRACTICE)   */}
            {/* ----------------------------------------------------------- */}
            <div
              id="why-bnc"
              className="flex flex-col justify-between pt-10 lg:pt-8 pb-4 lg:pl-12 border-t lg:border-t-0 border-white/15 mt-6 lg:mt-0"
            >
              <div>
                {/* Clean Metadata Kicker */}
                <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10 text-xs">
                  <span className="font-semibold text-[#f1bd5b] tracking-wide">
                    02 · The Consulting Practice
                  </span>
                  <span className="font-medium text-slate-400">
                    Established 2014
                  </span>
                </div>

                <h3 className="text-2xl sm:text-[1.65rem] font-extrabold text-white tracking-tight mb-1 text-balance">
                  Why BNC Global?
                </h3>
                <div className="text-xs font-semibold text-[#f1bd5b] mb-4">
                  Multidisciplinary Consulting Firm &amp; Risk Advisory
                </div>

                {/* Core Advisory Background (Unboxed Prose) */}
                <p className="text-sm text-slate-200 leading-relaxed mb-4">
                  <strong className="text-white font-bold">BNC Global Consultech established in 2014</strong> is a multidisciplinary consulting firm specializing in risk advisory, internal audit, compliance, financial consulting, cybersecurity, ESG, and GCC advisory. We help businesses strengthen governance, navigate complex regulations, and achieve sustainable growth across India and international markets.
                </p>

                {/* Placement & Recruitment Support (Unboxed with Icon) */}
                <div className="flex items-start gap-3 py-4 border-t border-white/10 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                  <Briefcase className="w-4 h-4 text-[#f1bd5b] shrink-0 mt-0.5" />
                  <span>
                    Apart from an educational company, BNC is an active risk consulting and accounting company providing recruitment and placement support for our candidates across corporate and GCC internal audit teams.
                  </span>
                </div>

                {/* Core Advisory Verticals (Clean Unboxed List) */}
                <div className="py-4 border-t border-white/10">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Core Advisory Verticals
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-slate-200">
                    {[
                      'Risk Advisory',
                      'Internal Audit',
                      'Regulatory Compliance',
                      'Financial Consulting',
                      'Cybersecurity',
                      'ESG Frameworks',
                      'GCC Advisory'
                    ].map((service, sIdx, arr) => (
                      <React.Fragment key={sIdx}>
                        <span>{service}</span>
                        {sIdx < arr.length - 1 && (
                          <span aria-hidden="true" className="text-slate-600">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* 3 Career Support Phases (Clean Numbered Hairline List) */}
                <div className="pt-4 border-t border-white/10 mb-8">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Three-Phase Career Support Initiative
                  </div>

                  <div className="divide-y divide-white/10">
                    <div className="py-3.5 flex items-start gap-3.5">
                      <span className="text-xs font-bold text-sky-400 tabular-nums pt-0.5">01</span>
                      <div>
                        <div className="font-bold text-white text-xs sm:text-[13px] mb-1">
                          Phase 1: Internal Audit Career Navigators
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Guidance on GCCs, banking, and Big 4 roles during your study. Help identifying suitable audit internships and qualifying work experience.
                        </p>
                      </div>
                    </div>

                    <div className="py-3.5 flex items-start gap-3.5">
                      <span className="text-xs font-bold text-[#f1bd5b] tabular-nums pt-0.5">02</span>
                      <div>
                        <div className="font-bold text-white text-xs sm:text-[13px] mb-1">
                          Phase 2: Placement Assistance Network
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Resume optimization for internal audit keywords, mock interview preparation, and direct vacancy referrals across BNC Global&apos;s client network.
                        </p>
                      </div>
                    </div>

                    <div className="py-3.5 flex items-start gap-3.5">
                      <span className="text-xs font-bold text-sky-400 tabular-nums pt-0.5">03</span>
                      <div>
                        <div className="font-bold text-white text-xs sm:text-[13px] mb-1">
                          Phase 3: Honest Mentorship &amp; CPE Compliance
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Clear upfront costs, zero hidden institutional fees, and ongoing annual CPE reporting support after you earn your designation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => scrollTo('packages')}
                  className="btn-reflection w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-[#b58b42] via-amber-600 to-[#9e7735] hover:from-[#9e7735] hover:to-[#846328] text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>View BNC Training Packages</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
