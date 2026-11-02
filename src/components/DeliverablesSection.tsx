import React from 'react';
import { BookOpen, Video, FileCheck, Layers, HelpCircle, Laptop, Cpu, Award } from 'lucide-react';

export const DeliverablesSection: React.FC = () => {
  const deliverables = [
    {
      icon: Video,
      title: '150+ Hours Live Coaching',
      desc: 'Weekend live interactive sessions covering all 3 parts of the new Global Internal Audit Standards, led by veteran practicing auditors.',
      tag: 'Interactive'
    },
    {
      icon: Laptop,
      title: '18 Months LMS Access',
      desc: 'Cloud learning management portal with HD recordings uploaded after every class. Revise anytime from desktop or mobile devices.',
      tag: 'Flexible'
    },
    {
      icon: BookOpen,
      title: 'BNC CIA Test Bank & Books',
      desc: 'Physical textbooks and reference materials valued at $499 couriered to your address, with zero shipping charges for Premium cohorts.',
      tag: 'Valued at $499'
    },
    {
      icon: Layers,
      title: '5,000+ Practice MCQs',
      desc: 'Extensive question bank with conceptual breakdowns, cognitive analysis, and detailed rationale for correct and incorrect answer options.',
      tag: 'Comprehensive'
    },
    {
      icon: FileCheck,
      title: 'Real Computer Mocks',
      desc: 'Section-wise quizzes after every chapter plus 2 full-length simulated Pearson VUE mock exams per part to master timing and stamina.',
      tag: 'Simulated'
    },
    {
      icon: HelpCircle,
      title: 'IIA CCMS Concierge',
      desc: 'Dedicated assistance with IIA India membership registration, student verification, character reference verification, and exam scheduling.',
      tag: 'End-to-End'
    },
    {
      icon: Cpu,
      title: 'AI Audit Lab (Premium Plus)',
      desc: 'Practical exposure to generative AI tools for audit programs, sampling automation, fraud detection, and workpaper documentation.',
      tag: 'Cutting-Edge'
    },
    {
      icon: Award,
      title: 'Career & Placement Advisory',
      desc: 'Resume enhancement, audit interview prep with senior partners, and interview referrals to consulting firms, banks, and MNC shared services.',
      tag: 'Career Growth'
    }
  ];

  return (
    <section className="relative overflow-hidden py-20 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Deliverables Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            WHAT YOUR TUITION INCLUDES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Everything Required to Clear on Your First Attempt
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            We don’t just supply slides. You get an integrated, multi-layered preparation system designed by accounting and risk consulting practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliverables.map((item, idx) => {
            const Icon = item.icon;
            const isGoldAccent = idx % 2 === 1;
            return (
              <div
                key={idx}
                className="card-reflection p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl hover:border-[#b58b42] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isGoldAccent ? 'bg-amber-100 text-[#b58b42]' : 'bg-sky-100 text-sky-800'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
