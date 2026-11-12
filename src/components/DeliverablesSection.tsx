import React from 'react';
import { BookOpen, Video, FileCheck, Layers, HelpCircle, Laptop, Cpu, Award, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface DeliverablesSectionProps {
  onOpenLms?: () => void;
}

interface DeliverableItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tag: string;
  isGleimFeatured?: boolean;
  highlights?: string[];
}

export const DeliverablesSection: React.FC<DeliverablesSectionProps> = ({ onOpenLms }) => {
  const deliverables: DeliverableItem[] = [
    {
      icon: Video,
      title: '100+ Hours Live Coaching',
      desc: 'Weekend live interactive sessions covering all 3 parts of the new Global Internal Audit Standards, led by veteran practicing auditors.',
      tag: 'Interactive',
      highlights: ['Weekend Live Classes', 'Class Repeat Privilege']
    },
    {
      icon: Laptop,
      title: '18 Months LMS Access',
      desc: 'Cloud learning management portal with HD recordings uploaded after every class. Revise anytime from desktop or mobile devices.',
      tag: 'Flexible',
      highlights: ['Instant HD Uploads', 'Mobile & Desktop App']
    },
    {
      icon: BookOpen,
      title: 'Gleim Premium CIA Study System',
      desc: 'Full access to the gold-standard Gleim CIA review materials, featuring SmartAdapt™ adaptive learning technology, the authoritative digital test bank with detailed answer explanations, and printed hardcopy textbook access couriered to your doorstep.',
      tag: 'Official Gleim Partner',
      isGleimFeatured: true,
      highlights: [
        'SmartAdapt™ Adaptive Learning',
        'Authoritative Digital Test Bank',
        'Hardcopy Printed Textbooks'
      ]
    },
    {
      icon: Layers,
      title: '5,000+ Practice MCQs',
      desc: 'Extensive digital question bank mirroring Pearson VUE exam formats, cognitive difficulty levels, and comprehensive answer rationales.',
      tag: 'Comprehensive',
      highlights: ['Detailed Answer Rationales', 'Cognitive Exam Traps']
    },
    {
      icon: FileCheck,
      title: 'Real Computer Mocks',
      desc: 'Section-wise quizzes after every chapter plus full-length simulated Pearson VUE mock exams per part to master timing and stamina.',
      tag: 'Simulated',
      highlights: ['Pearson VUE UI Emulation', 'Timing & Stamina Drills']
    },
    {
      icon: HelpCircle,
      title: 'IIA CCMS Concierge',
      desc: 'Dedicated assistance with IIA India membership registration, student verification, character reference verification, and exam scheduling.',
      tag: 'End-to-End',
      highlights: ['CCMS Registration Support', 'Experience Verification']
    },
    {
      icon: Cpu,
      title: 'AI Audit Lab (Premium Plus & Elite)',
      desc: 'Practical exposure to generative AI tools for audit programs, sampling automation, fraud detection, and workpaper documentation.',
      tag: 'Cutting-Edge',
      highlights: ['LLM Audit Workpapers', 'Risk Sampling Automation']
    },
    {
      icon: Award,
      title: 'Career & Placement Advisory',
      desc: 'Resume enhancement, audit interview prep with senior partners, and interview referrals to consulting firms, banks, and MNC shared services.',
      tag: 'Career Growth',
      highlights: ['Big 4 Interview Prep', 'Senior Partner Referral']
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
            We don’t just supply slides. You get an integrated, multi-layered preparation system combining official Gleim adaptive learning study materials with live BNC executive coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {deliverables.map((item, idx) => {
            const Icon = item.icon;
            const isGoldAccent = idx % 2 === 1 || item.isGleimFeatured;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between relative overflow-visible ${
                  item.isGleimFeatured
                    ? 'border-2 border-[#b58b42] shadow-2xl ring-4 ring-[#b58b42]/20 hover:-translate-y-1.5'
                    : 'border-slate-200/90 shadow-xl hover:border-[#b58b42] hover:shadow-2xl hover:-translate-y-1'
                }`}
              >
                {/* Dedicated internal reflection layer that clips to card shape without clipping external badge */}
                <div className="card-reflection-layer rounded-2xl z-0" />

                {/* Special Gleim Ribbon on the featured card */}
                {item.isGleimFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-800 via-[#b58b42] to-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap border border-white/80 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#f1bd5b]" />
                    <span>PREMIUM STUDY SYSTEM</span>
                  </div>
                )}

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.isGleimFeatured 
                        ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-[#b58b42] shadow-xs' 
                        : isGoldAccent 
                        ? 'bg-amber-100 text-[#b58b42]' 
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      item.isGleimFeatured
                        ? 'bg-amber-50 text-[#b58b42] border-[#b58b42]/40 font-extrabold'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold mb-2 ${item.isGleimFeatured ? 'text-slate-900 font-extrabold text-lg' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>

                  {/* Highlights Pill Tags */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {item.highlights.map((h, hIdx) => (
                        <span
                          key={hIdx}
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            item.isGleimFeatured
                              ? 'text-sky-950 bg-amber-50/80 border border-amber-200/90'
                              : 'text-slate-700 bg-slate-50 border border-slate-200/80'
                          }`}
                        >
                          <CheckCircle2 className={`w-3 h-3 shrink-0 ${item.isGleimFeatured ? 'text-[#b58b42]' : 'text-emerald-600'}`} />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {item.title.includes('LMS') && onOpenLms && (
                    <button
                      onClick={onOpenLms}
                      className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-[#b58b42] transition-colors cursor-pointer group"
                    >
                      <span>Explore Student LMS Portal</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
