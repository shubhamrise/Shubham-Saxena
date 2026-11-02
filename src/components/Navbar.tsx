import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import { Phone, Mail, ChevronRight, Menu, X, Sparkles, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenCheckout: (packageId?: string) => void;
  onOpenInquiry: () => void;
  onOpenChatbot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  onOpenCheckout,
  onOpenInquiry,
  onOpenChatbot,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['exam', 'curriculum', 'packages', 'fees', 'faq'];
      const scrollPosition = window.scrollY + 140;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'exam', label: 'The Exam' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'packages', label: 'Packages' },
    { id: 'fees', label: 'IIA Fees' },
    { id: 'faq', label: 'FAQ' },
  ];

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmailRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = 'elevate@bncglobal.in';
    const subject = encodeURIComponent('CIA Executive Accelerator Inquiry - BNC ELEVATE');
    const body = encodeURIComponent('Hello BNC ELEVATE Admissions Team,\n\nI would like more information on the CIA Executive Accelerator program.\n\nName:\nPhone:\nQualification:\n');
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      // Directly open Gmail web compose in a new tab
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
      const mailWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }
    }
  };

  return (
    <>
      {/* Top Professional Notice Bar - Solid Deep Corporate Navy with razor-sharp contrast */}
      <div className="relative z-50 bg-[#07172b] border-b border-sky-950 text-xs py-2.5 px-4 text-center text-white shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-slate-100 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f3bc53] shadow-[0_0_8px_#f3bc53]"></span>
            <span>IIA® Authorized Curriculum · Accounting & Risk Consulting Practice</span>
          </div>
          <div className="mx-auto sm:mx-0 flex items-center gap-3">
            <span className="font-semibold text-white">
              <span className="text-[#f3bc53] font-bold">Special Offer:</span> Save 20% on IIA exam bookings till March 2027
            </span>
            <button
              onClick={() => scrollTo('fees')}
              className="text-sky-300 hover:text-white underline font-bold cursor-pointer transition-colors"
            >
              View Fee Chart
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3.5 text-slate-100 font-medium">
            <a
              href="mailto:elevate@bncglobal.in?subject=CIA%20Executive%20Accelerator%20Inquiry%20-%20BNC%20ELEVATE"
              onClick={handleEmailRedirect}
              className="flex items-center gap-1.5 hover:text-[#f3bc53] transition-colors cursor-pointer"
              title="Compose email to elevate@bncglobal.in"
            >
              <Mail className="w-3.5 h-3.5 text-[#f3bc53]" />
              <span className="font-semibold tracking-wide">elevate@bncglobal.in</span>
            </a>
            <span className="text-slate-600">|</span>
            <a href="tel:+919810575613" className="flex items-center gap-1.5 hover:text-[#f3bc53] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#f3bc53]" />
              <span className="font-semibold tracking-wide">+91 98105 75613</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Light Mode Sticky Header - Solid Crisp White with zero blur or fading */}
      <header className="sticky top-0 z-40 bg-white border-b border-sky-100 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Zone 1: Brand Logo ONLY */}
            <div className="flex items-center shrink-0">
              <a href="#" className="inline-block group py-1" title="BNC ELEVATE - CIA Portal">
                <img
                  src="/assets/aistudio/image_ea32138a.png"
                  alt="BNC ELEVATE"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/bnc-elevate-logo.png';
                  }}
                />
              </a>
            </div>

            {/* Zone 2: Exactly 5 Central Navigation Links (User requested: "At the header, I want a text to win central, like all five texts.") */}
            <nav className="hidden lg:flex items-center justify-center flex-1 max-w-xl mx-auto">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50/70 border border-sky-100/80 shadow-xs">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-md shadow-sky-700/20'
                          : 'text-slate-600 hover:text-sky-800 hover:bg-white'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Zone 3: Currency Switcher, AI Advisor & Primary Action */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {/* Currency Selector */}
              <div className="flex items-center p-0.5 rounded-lg bg-sky-50/70 border border-sky-100 text-xs font-semibold">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    currency === 'INR'
                      ? 'bg-white text-sky-800 shadow-xs font-bold border border-sky-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Indian Rupee"
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-white text-sky-800 shadow-xs font-bold border border-sky-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="US Dollar"
                >
                  $ USD
                </button>
              </div>

              {/* AI Counselor Quick Button */}
              <button
                onClick={onOpenChatbot}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#b58b42] border border-sky-100 hover:border-amber-300 rounded-lg bg-white hover:bg-amber-50/50 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#b58b42]" />
                <span>AI Advisor</span>
              </button>

              {/* Primary Enrollment Button with Reflection Effect */}
              <button
                onClick={() => onOpenCheckout()}
                className="btn-reflection inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] rounded-xl shadow-md shadow-sky-800/25 hover:shadow-[#b58b42]/30 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <span>Enroll Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Currency
              </span>
              <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-lg border border-sky-100">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    currency === 'INR' ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    currency === 'USD' ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-left text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-950 transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCheckout();
                }}
                className="btn-reflection w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white shadow-md shadow-sky-800/25"
              >
                <span>Enroll Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChatbot();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-sky-50 border border-sky-200/80 hover:bg-amber-50"
              >
                <Sparkles className="w-4 h-4 text-[#b58b42]" />
                <span>Ask AI Advisor</span>
              </button>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600 px-1">
                <a
                  href="mailto:elevate@bncglobal.in?subject=CIA%20Executive%20Accelerator%20Inquiry%20-%20BNC%20ELEVATE"
                  onClick={handleEmailRedirect}
                  className="flex items-center gap-2 py-1 text-slate-700 hover:text-[#b58b42] cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#b58b42]" />
                  <span className="font-semibold">elevate@bncglobal.in</span>
                </a>
                <a href="tel:+919810575613" className="flex items-center gap-2 py-1 text-slate-700 hover:text-[#b58b42]">
                  <Phone className="w-3.5 h-3.5 text-[#b58b42]" />
                  <span className="font-semibold">+91 98105 75613</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
