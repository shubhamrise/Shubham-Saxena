import React, { useState } from 'react';
import { X, Send, CheckCircle2, Phone, Mail, User, GraduationCap, Building2, Clock } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  defaultPackage = 'Premium Live Package'
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeOrFirm, setCollegeOrFirm] = useState('');
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [packageInterest, setPackageInterest] = useState(defaultPackage);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store inquiry in local storage
    try {
      const existing = JSON.parse(localStorage.getItem('bnc_inquiries') || '[]');
      existing.unshift({
        name,
        email,
        phone,
        collegeOrFirm,
        qualification,
        packageInterest,
        targetEmail: 'elevate@bncglobal.in',
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('bnc_inquiries', JSON.stringify(existing));
    } catch (err) {
      console.log('Inquiry storage error', err);
    }

    try {
      await fetch('https://formsubmit.co/ajax/elevate@bncglobal.in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[BNC ELEVATE] Consultation Request: ${name}`,
          _template: 'table',
          _captcha: 'false',
          'Candidate Name': name,
          'Phone / WhatsApp': phone,
          'Email Address': email,
          'College or Current Firm': collegeOrFirm || 'Not provided',
          'Highest Qualification': qualification,
          'Program of Interest': packageInterest,
          'Submission Timestamp': new Date().toLocaleString(),
        }),
      });
    } catch (err) {
      console.warn('Inquiry dispatch error', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white border border-sky-100 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50/70 via-white to-amber-50/50 border-b border-sky-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#b58b42] text-[10px] font-bold tracking-wide mb-1">
              Direct Counselor Desk
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Speak with a Senior CIA® Faculty Counselor
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Get personalized syllabus guidance, eligibility review & fee breakdown
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 p-6 bg-white text-slate-900">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-[#b58b42] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Thank You, {name}!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your consultation request has been routed directly to <span className="font-bold text-[#b58b42] underline">elevate@bncglobal.in</span>. Our Lead Academic Counselor will reach out to you via WhatsApp / Phone at <span className="font-bold text-sky-700">{phone}</span> shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Rohit Verma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98105 75613"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Highest Qualification
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                    >
                      <option>Bachelor's Degree</option>
                      <option>Master's Degree</option>
                      <option>College Student</option>
                      <option>CA / CPA / CISA</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College or Current Employer
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={collegeOrFirm}
                      onChange={(e) => setCollegeOrFirm(e.target.value)}
                      placeholder="e.g., DU / Deloitte / PwC"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Package of Interest
                </label>
                <select
                  value={packageInterest}
                  onChange={(e) => setPackageInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                >
                  <option>Premium Live Interactive (₹60,000)</option>
                  <option>Premium Plus with AI Audit Lab (₹75,000)</option>
                  <option>Basic Self-Paced (₹40,000)</option>
                  <option>IAP Part 1 Student Fast Track</option>
                  <option>CA/CPA CIA Challenge Exam Prep</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-reflection w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-sm shadow-lg shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Callback & Free Syllabus PDF</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                We respect your privacy. No spam. You will only be contacted by BNC Global academic team at <span className="font-medium text-[#b58b42]">elevate@bncglobal.in</span>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
