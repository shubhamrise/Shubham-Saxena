import React from 'react';
import { Award, Briefcase, CheckCircle2, MessageSquare, ArrowRight, Sparkles, Building2, Globe } from 'lucide-react';

interface FacultySectionProps {
  onOpenInquiry?: () => void;
}

export const FacultySection: React.FC<FacultySectionProps> = ({ onOpenInquiry }) => {
  const guestFaculty = [
    {
      name: 'Karandeep Singh',
      role: 'GCC & CFO Practice',
      badge: 'GUEST SPEAKER',
      image: '/faculty-karandeep.png',
      expertise: [
        'Consumer tech: Flipkart, Simplilearn, KPMG CFOs',
        'Retail & GCCs: Tesco Business Services CFO',
        'Gaming & Esports',
      ],
    },
    {
      name: 'Shailesh Dayal',
      role: 'Growth Strategist',
      badge: null,
      image: '/faculty-shailesh.png',
      expertise: [
        'Training: growth and leadership programs',
        'Podcasts: business and thought leadership',
        'Corporate workshops',
      ],
    },
    {
      name: 'Anurag Sikka',
      role: 'MD & Leader, Risk Advisory',
      badge: null,
      image: '/faculty-anurag.png',
      expertise: [
        'Internal audits including SOX, IFC/ICFR, special reviews, investigations, stock and distributor, CSR spend reviews',
      ],
    },
    {
      name: 'Pranav Bhardwaj',
      role: 'Sustainability & ESG',
      badge: null,
      image: '/faculty-pranav.png',
      expertise: [
        'ESG and sustainability expert',
        'Strategic leadership',
        'Impact-driven solutions',
      ],
    },
  ];

  return (
    <section id="faculty" className="relative overflow-hidden py-16 lg:py-24 border-b border-sky-950/80">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Faculty Architecture"
          className="w-full h-full object-cover object-center opacity-30 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322] via-[#09192d]/90 to-[#071322]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - World-Class Executive Typography */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#f1bd5b]" />
            <span>Academic Leadership · Practicing Industry Partners</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Meet our faculty
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Learn from the BNC Global leaders who work in audit, risk, finance and governance every day.
          </p>
        </div>

        {/* Lead Faculty Spotlight Banner - Gurvinder Singh */}
        <div className="relative mb-14 rounded-3xl bg-gradient-to-br from-[#0c223c] via-[#0a1b2f] to-[#071424] border border-sky-700/50 shadow-2xl overflow-hidden">
          {/* Top Gold Gradient Accent Rim */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-[#f1bd5b] to-amber-500" />
          
          {/* Radial Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#f1bd5b]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Portrait */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group w-full max-w-[340px] sm:max-w-[380px]">
                  {/* Outer Gold Ring Glow */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#f1bd5b]/40 via-sky-500/20 to-amber-600/40 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Portrait Card */}
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/95 border-2 border-[#f1bd5b]/80 shadow-2xl">
                    <img
                      src="/faculty-gurvinder.png"
                      alt="Gurvinder Singh - Lead Faculty & Co-Founder"
                      className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
                    />
                    {/* Floating badge inside portrait frame */}
                    <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-center">
                      <span className="text-xs font-bold text-white tracking-wide">
                        CA Gurvinder Pal Singh
                      </span>
                      <span className="block text-[11px] text-[#f1bd5b]">
                        Co-Founder & Senior Audit Partner
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Faculty Dossier */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Lead Faculty Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f1bd5b] to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md">
                  <Award className="w-3.5 h-3.5" />
                  <span>LEAD FACULTY</span>
                </div>

                {/* Name & Title */}
                <div className="space-y-1.5">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    Gurvinder Singh
                  </h3>
                  <div className="text-lg sm:text-xl font-bold text-[#f1bd5b]">
                    Co-Founder, BNC Global
                  </div>
                </div>

                {/* Profile Narrative */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Ex-KPMG and Aon senior risk leader with two decades directing enterprise governance, Internal Financial Controls (IFC), SOX 404 audits, and multi-country risk advisory mandates. As BNC Elevate’s lead faculty, he personally delivers live interactive weekend classes, mentors students through tricky IIA exam traps, and guides CIA® aspirants directly to Big 4 and GCC career placements.
                </p>

                {/* Expertise Section */}
                <div className="pt-2 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    EXPERTISE
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="px-4 py-2 rounded-xl bg-sky-950/90 border border-sky-600/50 text-sky-200 text-xs font-semibold shadow-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      Risk Consulting
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-sky-950/90 border border-sky-600/50 text-sky-200 text-xs font-semibold shadow-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f1bd5b]"></span>
                      Process Automation
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-sky-950/90 border border-sky-600/50 text-sky-200 text-xs font-semibold shadow-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Regulatory & Compliance
                    </span>
                  </div>
                </div>

                {/* Impact Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-sky-800/40">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-lg font-black text-sky-400">20+ Yrs</div>
                    <div className="text-[11px] text-slate-400 font-medium">Big 4 & Aon Leadership</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-lg font-black text-[#f1bd5b]">100% Live</div>
                    <div className="text-[11px] text-slate-400 font-medium">Instructor-Led Batches</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 col-span-2 sm:col-span-1">
                    <div className="text-lg font-black text-emerald-400">Direct Mentorship</div>
                    <div className="text-[11px] text-slate-400 font-medium">1-on-1 Student Clinic</div>
                  </div>
                </div>

                {/* Faculty Connect CTA */}
                {onOpenInquiry && (
                  <div className="pt-2">
                    <button
                      onClick={onOpenInquiry}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-[#b58b42] hover:from-sky-700 hover:to-[#9e7735] text-white text-xs font-bold tracking-wide shadow-lg shadow-sky-950/50 hover:shadow-sky-900/60 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#f1bd5b]" />
                      <span>Connect with Faculty & Schedule 1-on-1 Counseling</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 Header: Faculty and guest speaker */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Faculty and guest speaker
            </h3>
            <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-sky-800/80 to-transparent"></div>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl">
            CFOs, GCC executives, and risk advisory practice leaders bringing real-world governance and internal audit case studies straight from boardrooms to your prep sessions.
          </p>
        </div>

        {/* Faculty and Guest Speaker 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {guestFaculty.map((member, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-[#091a2e]/95 border border-sky-800/50 hover:border-[#f1bd5b]/60 p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-sky-950/70 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle accent hover glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#f1bd5b]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#f1bd5b]/10 transition-colors duration-300" />
              
              <div>
                {/* Top Section: Photo + Identification */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
                  {/* Portrait with Crisp Clean Frame */}
                  <div className="relative shrink-0 w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 border border-sky-700/60 shadow-md group-hover:border-[#f1bd5b]/80 transition-colors">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Header Details */}
                  <div className="space-y-1.5 text-left flex-1">
                    {member.badge && (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#f1bd5b]/20 border border-[#f1bd5b]/50 text-[#f1bd5b] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                        {member.badge}
                      </span>
                    )}
                    <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-sky-200 transition-colors">
                      {member.name}
                    </h4>
                    <div className="text-xs sm:text-sm font-semibold text-[#f1bd5b]">
                      {member.role}
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="h-px w-full bg-slate-800/80 mb-4" />

                {/* Expertise List */}
                <div className="text-left space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    EXPERTISE
                  </div>
                  <ul className="space-y-2">
                    {member.expertise.map((item, bulletIdx) => (
                      <li
                        key={bulletIdx}
                        className="text-xs sm:text-[13px] text-slate-300 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f1bd5b] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>BNC Global Executive Network</span>
                </span>
                <span className="text-sky-300 font-medium">Enterprise Practitioner</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
