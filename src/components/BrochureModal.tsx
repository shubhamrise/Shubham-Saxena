import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle2, FileText, Sparkles, Phone, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: string;
  onOpenCheckout?: (pkgId: string) => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({
  isOpen,
  onClose,
  defaultPackage = 'all',
  onOpenCheckout
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPkg] = useState(defaultPackage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDownloadSuccess(false);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Trigger official BNC Global CIA Student Brochure PDF download
  const triggerBrochureDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = '/assets/aistudio/BNC_Global_CIA_Student_Brochure_60003cf7.pdf';
      link.download = 'BNC_Global_CIA_Student_Brochure.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Brochure download error', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead in localStorage
      const existing = JSON.parse(localStorage.getItem('bnc_brochure_downloads') || '[]');
      existing.unshift({
        name,
        email,
        phone,
        packageInterest: selectedPkg,
        downloadedAt: new Date().toISOString()
      });
      localStorage.setItem('bnc_brochure_downloads', JSON.stringify(existing));

      // Also persist to unified bnc_all_leads
      const allLeads = JSON.parse(localStorage.getItem('bnc_all_leads') || '[]');
      allLeads.unshift({
        id: `lead-br-${Date.now()}`,
        name,
        email,
        phone,
        qualification: "Bachelor's Degree",
        program: selectedPkg,
        source: 'Brochure Modal Download',
        status: 'New',
        submittedAt: new Date().toLocaleString(),
        brochureDownloaded: true,
        notes: 'Downloaded 10-page BNC Global CIA Student Brochure.'
      });
      localStorage.setItem('bnc_all_leads', JSON.stringify(allLeads));

      // Attempt notification dispatch
      fetch('https://formsubmit.co/ajax/info@bncglobal.in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `[BNC ELEVATE] Brochure Download: ${name} (${selectedPkg})`,
          Name: name,
          Email: email,
          Phone: phone,
          Package: selectedPkg,
          Timestamp: new Date().toLocaleString()
        })
      }).catch((err) => console.warn('Dispatch failed', err));
    } catch (err) {
      console.warn('Storage failed', err);
    }

    // Trigger official PDF download
    setTimeout(() => {
      triggerBrochureDownload();
      setIsSubmitting(false);
      setDownloadSuccess(true);
    }, 400);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Floating high-contrast exit button always visible on any viewport size */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close modal window"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-rose-900/90 text-slate-200 hover:text-white border border-slate-700 hover:border-rose-500 shadow-2xl transition-all cursor-pointer font-bold text-xs"
        title="Close Window (Esc)"
      >
        <X className="w-4 h-4 pointer-events-none text-rose-400" />
        <span>Close</span>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl my-8 bg-[#091729] border border-sky-800/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Top Gradient Rim */}
        <div className="h-1.5 bg-gradient-to-r from-sky-600 via-[#f1bd5b] to-sky-700" />

        {/* Header Bar - Sticky so it never scrolls off screen */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 sm:py-5 bg-[#0b1d33] border-b border-sky-950 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center text-white shadow-md shrink-0">
              <FileText className="w-5 h-5 text-[#f1bd5b]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#f1bd5b] uppercase tracking-wider">
                Official Curriculum & Fee Guide
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Download BNC ELEVATE Brochure
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-rose-900/80 active:bg-rose-950 border border-slate-700 hover:border-rose-500 transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {downloadSuccess ? (
            <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">
                  Brochure Downloaded Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your comprehensive 2026-27 CIA® syllabus and fee structure has been saved to your device.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Admissions Contact:</span>
                  <a href="mailto:info@bncglobal.in" className="text-sky-300 hover:underline font-semibold">
                    info@bncglobal.in
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Phone / WhatsApp:</span>
                  <a href="tel:+916396018626" className="text-[#f1bd5b] hover:underline font-bold">
                    +91 63960 18626
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Target Cohort:</span>
                  <span className="text-white font-medium">Batch 2026-27 (Weekend Classes)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Close Window</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerBrochureDownload()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#f1bd5b]" />
                  <span>Download Again</span>
                </button>

                {onOpenCheckout && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onOpenCheckout(selectedPkg === 'all' ? 'premium' : selectedPkg);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Reserve Cohort Seat →</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Receive the detailed 3-part CIA curriculum breakdown, full fee schedule, installment options, faculty credentials, and Pearson VUE exam prep roadmap.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name <span className="text-[#f1bd5b]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ankit Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#f1bd5b] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-[#f1bd5b]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ankit@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#f1bd5b] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp / Phone <span className="text-[#f1bd5b]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#f1bd5b] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-sm shadow-lg shadow-sky-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Enquiry & Downloading Brochure...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#f1bd5b]" />
                        <span>Submit Enquiry & Download Brochure</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer text-center"
                  >
                    Cancel / Close
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3 bg-[#071322] border-t border-sky-950 text-center text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official BNC Global Prospectus</span>
          </span>
          <span>Inquiries: info@bncglobal.in</span>
        </div>
      </div>
    </div>
  );
};
