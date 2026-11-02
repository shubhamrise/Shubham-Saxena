import React, { useState } from 'react';
import { EXAM_PARTS } from '../data/ciaData';
import { Clock, HelpCircle, CheckCircle2, Award, BarChart3 } from 'lucide-react';

interface ExamBlueprintSectionProps {
  onOpenQuiz: () => void;
  onOpenInquiry: () => void;
}

export const ExamBlueprintSection: React.FC<ExamBlueprintSectionProps> = ({
  onOpenQuiz,
  onOpenInquiry,
}) => {
  const [activePartId, setActivePartId] = useState<string>('part-1');

  const currentPart = EXAM_PARTS.find((p) => p.id === activePartId) || EXAM_PARTS[0];

  return (
    <section id="exam" className="relative overflow-hidden py-20 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Exam Blueprint Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            SYLLABUS & EXAM BLUEPRINT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            The 3-Part Modular CIA® Curriculum
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Aligned with the Global Internal Audit Standards (GIAS). Parts can be taken in any sequence with computer-based testing via Pearson VUE test centers or online proctoring.
          </p>
        </div>

        {/* Tab Navigation for Parts */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {EXAM_PARTS.map((part) => {
            const isActive = activePartId === part.id;
            return (
              <button
                key={part.id}
                onClick={() => setActivePartId(part.id)}
                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-lg shadow-sky-800/30'
                    : 'bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/80 backdrop-blur-sm'
                }`}
              >
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-sky-950 text-sky-300 border border-sky-800'}`}>
                  {part.partNumber}
                </span>
                <span>Part {part.partNumber}: {part.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Part Detailed Card in Light Mode */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Overview Column */}
            <div className="space-y-6 lg:border-r lg:border-sky-50 lg:pr-8">
              <div>
                <span className="text-xs font-bold text-[#b58b42] uppercase tracking-widest">
                  Part {currentPart.partNumber} Specification
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1 mb-3">
                  {currentPart.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentPart.description}
                </p>
              </div>

              {/* Exam Specs Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <HelpCircle className="w-4 h-4 text-sky-700" />
                    <span>Questions</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {currentPart.questions} MCQs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">No negative marks</div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Clock className="w-4 h-4 text-[#b58b42]" />
                    <span>Duration</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {currentPart.durationMinutes} Mins
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">~1.2 min / question</div>
                </div>
              </div>

              {/* Action Buttons with Reflection */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={onOpenQuiz}
                  className="btn-reflection w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Try Part {currentPart.partNumber} Sample MCQ</span>
                </button>
                <button
                  onClick={onOpenInquiry}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-semibold border border-sky-200 transition-colors cursor-pointer"
                >
                  Download Part {currentPart.partNumber} Syllabus PDF
                </button>
              </div>
            </div>

            {/* Right Domain & Topic Weightage Breakdown */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-sky-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-700" />
                  Tested Knowledge Domains & Weightages
                </span>
                <span className="text-xs text-[#b58b42] font-bold">Total 100%</span>
              </div>

              <div className="space-y-4">
                {currentPart.domains.map((domain, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {index + 1}. {domain.name}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-[#b58b42] border border-amber-200/50">
                        {domain.weightage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-sky-700 to-[#b58b42] rounded-full"
                        style={{ width: `${domain.weightage}%` }}
                      ></div>
                    </div>

                    {/* Subtopics */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      {domain.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#b58b42] shrink-0 mt-0.5" />
                          <span className="leading-snug">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
