import React from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenCheckout: (packageId?: string) => void;
  onOpenInquiry: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCheckout, onOpenInquiry }) => {
  const handleEmailRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = 'elevate@bncglobal.in';
    const subject = encodeURIComponent('CIA Executive Accelerator Inquiry - BNC ELEVATE');
    const body = encodeURIComponent('Hello BNC ELEVATE Admissions Team,\n\nI would like more information on the CIA Executive Accelerator program.\n\nName:\nPhone:\nQualification:\n');
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
      const mailWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }
    }
  };

  return (
    <footer className="relative overflow-hidden bg-slate-950 border-t border-sky-950 text-slate-400 text-xs">
      {/* Corporate Architectural Background in Footer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Corporate Background"
          className="w-full h-full object-cover object-center opacity-[0.12] mix-blend-luminosity filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/92 to-slate-950/98"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-white/95 inline-block">
                <img
                  src="/assets/aistudio/image_ea32138a.png"
                  alt="BNC ELEVATE"
                  className="h-9 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/bnc-elevate-logo.png';
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leading accounting, internal audit, and risk consulting firm providing elite professional certification training, AI tools masterclasses, and corporate governance solutions.
            </p>
            <div className="pt-2 text-slate-300 space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#b58b42]" />
                <a
                  href="mailto:elevate@bncglobal.in?subject=CIA%20Executive%20Accelerator%20Inquiry%20-%20BNC%20ELEVATE"
                  onClick={handleEmailRedirect}
                  className="hover:text-[#b58b42] transition-colors cursor-pointer"
                  title="Compose email to elevate@bncglobal.in"
                >
                  elevate@bncglobal.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#b58b42]" />
                <a href="tel:+919810575613" className="hover:text-[#b58b42] transition-colors">
                  +91 98105 75613
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              CIA® Program
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#exam" className="hover:text-sky-300 transition-colors">
                  3-Part Exam Structure
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-sky-300 transition-colors">
                  Eligibility & Pathways
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-sky-300 transition-colors">
                  Coaching Packages & Pricing
                </a>
              </li>
              <li>
                <a href="#fees" className="hover:text-sky-300 transition-colors">
                  Official IIA Fee Chart
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-sky-300 transition-colors">
                  FAQ & Candidate Rules
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Certification Options */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Credentials
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-slate-200 font-semibold">Certified Internal Auditor (CIA®)</span>
                <span className="block text-[11px] text-slate-500">The premier global 3-part credential</span>
              </li>
              <li>
                <span className="text-slate-200 font-semibold">Internal Audit Practitioner (IAP)</span>
                <span className="block text-[11px] text-slate-500">Part 1 milestone for university students</span>
              </li>
              <li>
                <span className="text-slate-200 font-semibold">CIA Challenge Exam</span>
                <span className="block text-[11px] text-slate-500">Fast-track 1 sitting for CAs & CPAs</span>
              </li>
              <li>
                <span className="text-slate-200 font-semibold">AI in Internal Audit Masterclass</span>
                <span className="block text-[11px] text-slate-500">Automation & data analytics tools</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate Website & Enrolment */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Enrollment & Support
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Admissions for the upcoming weekend batch are open. Seats are limited to 35 candidates to ensure personalized faculty attention.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => onOpenCheckout('premium')}
                className="btn-reflection w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all cursor-pointer"
              >
                Enroll in Upcoming Cohort
              </button>
              <a
                href="https://bncglobal.in"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors backdrop-blur-xs"
              >
                <span>Visit bncglobal.in</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#b58b42]" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimers & Notes */}
        <div className="py-8 space-y-3 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-200">Tuition & Fee Policy:</strong> Package prices displayed are solely for BNC Global training, study materials, mock examinations, LMS access, and concierge support. Official IIA fees (including IIA India annual membership, certification application, and per-part exam registration fees) are levied directly by the Institute of Internal Auditors (IIA) and are paid separately by the candidate through the CCMS portal. IIA fees are subject to revision by the IIA.
          </p>
          <p>
            <strong className="text-slate-200">Career & Placement Advisory:</strong> Career assistance, vacancy notifications, and interview referrals are provided to support career progression and do not constitute an explicit legal guarantee of employment. Qualifying internal audit work experience is assessed and verified independently by the IIA upon submission of character references.
          </p>
          <p>
            <strong className="text-slate-200">Trademark Acknowledgment:</strong> CIA®, Certified Internal Auditor®, and IAP® are registered certification marks of The Institute of Internal Auditors, Inc. (IIA). BNC Global is an independent professional training and consulting organization preparing candidates for IIA examinations.
          </p>
        </div>

        {/* Copyright Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
          <div>
            © {new Date().getFullYear()} BNC Global. All rights reserved. | Learn. Certify. Build Your Internal Audit Career.
          </div>
          <div className="flex items-center gap-6">
            <a href="#exam" className="hover:text-[#b58b42] transition-colors">The Exam</a>
            <a href="#packages" className="hover:text-[#b58b42] transition-colors">Tuition Plans</a>
            <a href="#fees" className="hover:text-[#b58b42] transition-colors">IIA Dues</a>
            <a href="https://bncglobal.in" target="_blank" rel="noreferrer" className="hover:text-[#b58b42] transition-colors">bncglobal.in</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
