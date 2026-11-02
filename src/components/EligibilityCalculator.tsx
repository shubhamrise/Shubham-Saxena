import React, { useState } from 'react';
import { ELIGIBILITY_PATHWAYS } from '../data/ciaData';
import { GraduationCap, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

interface EligibilityCalculatorProps {
  onOpenCheckout: (packageId?: string) => void;
  onOpenInquiry: () => void;
}

export const EligibilityCalculator: React.FC<EligibilityCalculatorProps> = ({
  onOpenCheckout,
  onOpenInquiry,
}) => {
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('bachelor');

  const activePathway =
    ELIGIBILITY_PATHWAYS.find((p) => p.id === selectedPathwayId) || ELIGIBILITY_PATHWAYS[1];

  return (
    <section id="curriculum" className="relative overflow-hidden py-20 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Eligibility Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            IIA CERTIFICATION ELIGIBILITY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Interactive Eligibility & Pathway Guide
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Select your educational or professional qualification to calculate experience prerequisites, entry eligibility, and recommended preparation timeline.
          </p>
        </div>

        {/* 4 Profile Selectors in Light Mode with Reflection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {ELIGIBILITY_PATHWAYS.map((path) => {
            const isSelected = selectedPathwayId === path.id;
            return (
              <button
                key={path.id}
                onClick={() => setSelectedPathwayId(path.id)}
                className={`card-reflection p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer relative bg-white ${
                  isSelected
                    ? 'border-2 border-[#b58b42] ring-2 ring-[#b58b42]/25 shadow-xl -translate-y-0.5'
                    : 'border border-slate-200 hover:border-[#b58b42]/50 shadow-md'
                }`}
              >
                <span className="block text-[10px] font-black text-[#b58b42] uppercase tracking-wider mb-1">
                  {path.badge}
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{path.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{path.qualification}</p>
              </button>
            );
          })}
        </div>

        {/* Pathway Breakdown Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Entry & Requirements */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Eligibility At Exam Entry</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{activePathway.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activePathway.entryRequirement}
              </p>
              <div className="p-3.5 rounded-xl bg-white border border-sky-100 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block mb-1">Qualifying Education:</span>
                {activePathway.qualification}
              </div>
            </div>

            {/* Column 2: Certification Completion */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b58b42] uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>Work Experience Needed</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">For Final CIA® Credential</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activePathway.toCertify}
              </p>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/90 text-xs text-slate-800">
                <span className="font-semibold text-[#b58b42] block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#b58b42]" />
                  Experience Flexibility:
                </span>
                Experience can be acquired before, during, or after passing the exams. Internal audit, internal control, external audit, compliance, and risk roles all qualify!
              </div>
            </div>

            {/* Column 3: Recommended Preparation with Button Reflection */}
            <div className="space-y-4 flex flex-col justify-between p-6 rounded-2xl bg-white border border-sky-200 shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-[#b58b42] uppercase tracking-widest">
                  RECOMMENDED PREPARATION
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">
                  {activePathway.idealPlan}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {activePathway.savingsTip}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenCheckout('premium')}
                  className="btn-reflection w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all cursor-pointer"
                >
                  <span>Enroll for This Pathway</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenInquiry}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-semibold border border-sky-200 transition-colors cursor-pointer"
                >
                  Verify My Eligibility with Faculty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
