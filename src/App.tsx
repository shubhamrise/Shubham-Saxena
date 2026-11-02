import React, { useState } from 'react';
import { Currency, EnrollmentOrder } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FoundersSection } from './components/FoundersSection';
import { ExamBlueprintSection } from './components/ExamBlueprintSection';
import { EligibilityCalculator } from './components/EligibilityCalculator';
import { PackagesSection } from './components/PackagesSection';
import { DeliverablesSection } from './components/DeliverablesSection';
import { IiaFeeCalculator } from './components/IiaFeeCalculator';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { InquiryModal } from './components/InquiryModal';
import { InteractiveQuizModal } from './components/InteractiveQuizModal';
import { AiAdvisorChatbot } from './components/AiAdvisorChatbot';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPackageForCheckout, setSelectedPackageForCheckout] = useState('premium');
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const handleOpenCheckout = (packageId: string = 'premium') => {
    setSelectedPackageForCheckout(packageId);
    setCheckoutOpen(true);
  };

  const handleEnrollSuccess = (order: EnrollmentOrder) => {
    setActiveNotification(`Seat reserved for ${order.studentName}! Order #${order.orderId}`);
  };

  return (
    <div className="relative min-h-screen bg-[#071322] text-slate-100 flex flex-col font-sans selection:bg-[#b58b42] selection:text-white">
      {/* Global Corporate Architectural Backdrop Layer - Slightly dark, modern, premium, stylish */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.jpg"
          alt="BNC Global Architectural Background"
          className="w-full h-full object-cover object-center opacity-40 filter contrast-125 brightness-75 saturate-110"
        />
        {/* Slightly dark modern executive navy vignette & specular grading */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/85 via-[#0b1d33]/80 to-[#06101c]/90"></div>
        {/* Subtle modern cyber-finance micro grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07]"></div>
      </div>

      {/* Toast Notification upon Enrollment */}
      {activeNotification && (
        <div className="fixed bottom-24 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white font-bold text-xs shadow-2xl flex items-center gap-3 animate-bounce border border-white/30">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{activeNotification}</span>
          <button
            onClick={() => setActiveNotification(null)}
            className="ml-2 text-white hover:opacity-75 cursor-pointer font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        onOpenCheckout={handleOpenCheckout}
        onOpenInquiry={() => setInquiryOpen(true)}
        onOpenChatbot={() => setChatbotOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 flex-1">
        {/* 1. Master Opening Section: Hero + 4 Performance Metrics + 3 Pillars */}
        <HeroSection
          currency={currency}
          onOpenCheckout={handleOpenCheckout}
          onOpenQuiz={() => setQuizOpen(true)}
          onOpenInquiry={() => setInquiryOpen(true)}
        />

        {/* 2. Executive Leadership & Mentorship: Meet the Founders */}
        <FoundersSection />

        {/* 3. The 3-Part Exam Structure & Syllabus Blueprint */}
        <ExamBlueprintSection
          onOpenQuiz={() => setQuizOpen(true)}
          onOpenInquiry={() => setInquiryOpen(true)}
        />

        {/* 5. Interactive Eligibility & Pathway Guide */}
        <EligibilityCalculator
          onOpenCheckout={handleOpenCheckout}
          onOpenInquiry={() => setInquiryOpen(true)}
        />

        {/* 6. Pricing, Packages & Direct Enrollment (Core Purchase Center) */}
        <PackagesSection
          currency={currency}
          onOpenCheckout={handleOpenCheckout}
          onOpenInquiry={() => setInquiryOpen(true)}
        />

        {/* 7. What Course Fee Covers (The 8 Pillars) */}
        <DeliverablesSection />

        {/* 8. Official IIA India Fees & Transparent Calculator */}
        <IiaFeeCalculator />

        {/* 9. Verified Alumni Reviews */}
        <TestimonialsSection />

        {/* 10. Frequently Asked Questions */}
        <FaqSection onOpenInquiry={() => setInquiryOpen(true)} />

        {/* Final Conversion Banner with Atmospheric Architectural Backdrop */}
        <section className="py-20 bg-gradient-to-r from-sky-900 via-sky-800 to-[#846329] text-white text-center px-4 relative overflow-hidden border-t border-sky-800/60">
          {/* Architectural Background in Final Section */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/hero-bg.jpg"
              alt="BNC Architectural Motif"
              className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-950/85 via-sky-900/80 to-[#5a431c]/85"></div>
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -top-10 left-1/4 w-96 h-96 bg-white rounded-full blur-[140px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#b58b42] rounded-full blur-[120px]"></div>
          </div>
          <div className="relative max-w-4xl mx-auto space-y-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 text-white border border-white/30 backdrop-blur-md">
              NEXT LIVE COHORT COMMENCING SOON
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Earn the Certified Internal Auditor (CIA®) Designation?
            </h2>
            <p className="text-sm sm:text-base text-sky-50 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of successful auditors who passed with BNC Global. Secure your seat today with flexible no-cost 2-part installments.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleOpenCheckout('premium')}
                className="btn-reflection inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-sky-950 bg-white hover:bg-sky-50 shadow-xl shadow-sky-900/30 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4 text-[#b58b42]" />
              </button>
              <button
                onClick={() => setInquiryOpen(true)}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/15 hover:bg-white/25 border border-white/30 cursor-pointer transition-colors backdrop-blur-sm"
              >
                Request 1-on-1 Academic Counseling
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenCheckout={handleOpenCheckout}
        onOpenInquiry={() => setInquiryOpen(true)}
      />

      {/* Floating AI Advisor Chatbot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatbotOpen(true)}
          className="btn-reflection group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white shadow-2xl shadow-sky-800/30 hover:shadow-[#b58b42]/35 border border-white/30 hover:scale-105 transition-all duration-200 cursor-pointer"
          aria-label="Open AI Academic Advisor"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline-block">Ask AI Advisor</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b58b42]"></span>
          </span>
        </button>
      </div>

      {/* Interactive Modals */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedPackageId={selectedPackageForCheckout}
        currency={currency}
        onEnrollSuccess={handleEnrollSuccess}
      />

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />

      <InteractiveQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onOpenCheckout={() => {
          setQuizOpen(false);
          handleOpenCheckout('premium');
        }}
      />

      <AiAdvisorChatbot
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        onOpenCheckout={handleOpenCheckout}
      />
    </div>
  );
}
