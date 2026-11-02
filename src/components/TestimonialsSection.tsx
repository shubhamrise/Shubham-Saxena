import React from 'react';
import { TESTIMONIALS } from '../data/ciaData';
import { Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Alumni Testimonials Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            PROVEN TRACK RECORD
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Hear From Certified Internal Auditors Who Trained With Us
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Real stories from audit professionals at Deloitte, Barclays, and Grant Thornton who passed with BNC Global.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="card-reflection p-8 rounded-3xl bg-white border border-sky-100 hover:border-[#b58b42]/40 hover:shadow-md flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-1 text-[#b58b42] mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#b58b42] text-[#b58b42]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-sky-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                  <div className="text-xs text-sky-700 font-semibold">{t.role}</div>
                  <div className="text-[11px] text-slate-500">{t.company}</div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-[#b58b42] border border-amber-200">
                  {t.batch}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
