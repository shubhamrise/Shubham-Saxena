import React, { useState } from 'react';
import { FAQS } from '../data/ciaData';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FaqSectionProps {
  onOpenInquiry: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenInquiry }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="relative overflow-hidden py-24 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC FAQ Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#f1bd5b]" />
            <span>COMMONLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-sm text-slate-300">
            Clear, straightforward answers regarding exam scheduling, IIA policies, and package delivery.
          </p>

          {/* Quick Search Filter */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic (e.g. negative marking, EMI, IAP...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-lg"
            />
          </div>
        </div>

        {/* Accordion List in Light Mode */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-sky-100 bg-white overflow-hidden transition-all duration-200 shadow-2xs hover:border-[#b58b42]/30"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-sky-50/40 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                    {faq.q}
                  </span>
                  <span className="p-1 rounded-lg text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#b58b42]" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-sky-50 bg-sky-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner with reflection */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-sky-50/60 via-white to-amber-50/40 border border-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Have a unique educational background or corporate query?</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Contact our IIA Member Services advisory team directly for a free consultation.
            </p>
          </div>
          <button
            onClick={onOpenInquiry}
            className="btn-reflection px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs whitespace-nowrap shadow-md shadow-sky-800/20 hover:shadow-[#b58b42]/30 cursor-pointer"
          >
            Ask a Faculty Advisor
          </button>
        </div>
      </div>
    </section>
  );
};
