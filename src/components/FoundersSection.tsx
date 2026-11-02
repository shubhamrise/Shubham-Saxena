export const FoundersSection: React.FC = () => {
  return (
    <section id="founders" className="relative overflow-hidden py-16 lg:py-20 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC Founders Leadership Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Spotlight: Duo Cutout Banner */}
        <div className="relative mb-0 p-8 sm:p-10 lg:p-12 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0a1f38]/95 to-slate-900/90 border border-sky-800/60 shadow-2xl overflow-hidden">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-[#b58b42]/15 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Duo Picture Showcase */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative max-w-md w-full">
                {/* Specular backdrop halo */}
                <div className="absolute inset-0 bg-gradient-to-t from-sky-600/20 via-transparent to-amber-500/20 rounded-3xl filter blur-2xl"></div>
                <img
                  src="/assets/aistudio/founders-duo_862591ae.png"
                  alt="CA Gurvinder Pal Singh and CA Summit Goyal - BNC Global Co-Founders"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transform hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-950/90 border border-[#b58b42]/60 text-white text-[11px] font-bold shadow-xl whitespace-nowrap flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f1bd5b] animate-ping"></span>
                  <span>CA Gurvinder Pal Singh & CA Summit Goyal</span>
                </div>
              </div>
            </div>

            {/* Right Summary & The Founder Advantage */}
            <div className="lg:col-span-7 space-y-6 text-slate-200">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#f1bd5b] uppercase tracking-wider">
                  THE BNC ADVANTAGE
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  "We Built BNC to Bridge the Gap Between Textbook Theory and Enterprise Boardrooms."
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  Both founders actively lead multimillion-dollar risk consulting mandates across India, the GCC, and Europe. As active risk consulting partners with ongoing GCC and India client engagements, our founders personally refer top-performing CIA candidates to Big 4 firms, multinational shared services, and corporate audit teams.
                </p>
              </div>

              {/* Pillars of Leadership Value & Track Record */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                  <div className="text-xl font-extrabold text-sky-400 mb-0.5">39+ Yrs</div>
                  <div className="text-[11px] font-bold text-white uppercase">Combined Experience</div>
                  <div className="text-[10px] text-slate-400 mt-1">Ex-KPMG & Aon leaders</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                  <div className="text-xl font-extrabold text-[#f1bd5b] mb-0.5">AIR 50</div>
                  <div className="text-[11px] font-bold text-white uppercase">ICAI Merit Ranker</div>
                  <div className="text-[10px] text-slate-400 mt-1">Academic perfection</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                  <div className="text-xl font-extrabold text-sky-400 mb-0.5">ICAI SRSB</div>
                  <div className="text-[11px] font-bold text-white uppercase">Standard Board Invitee</div>
                  <div className="text-[10px] text-slate-400 mt-1">Global ESG & SDG policy</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                  <div className="text-xl font-extrabold text-[#f1bd5b] mb-0.5">3</div>
                  <div className="text-[11px] font-bold text-white uppercase">Ventures Co-Founded</div>
                  <div className="text-[10px] text-slate-400 mt-1">BNC Global, Sustaind & iEDGE</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left col-span-2 sm:col-span-1">
                  <div className="text-xl font-extrabold text-sky-400 mb-0.5">7+</div>
                  <div className="text-[11px] font-bold text-white uppercase">Industries Served</div>
                  <div className="text-[10px] text-slate-400 mt-1">From real estate to automobiles</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
