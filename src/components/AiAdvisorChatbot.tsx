import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { PACKAGES, EXAM_PARTS, ELIGIBILITY_PATHWAYS, IIA_FEES } from '../data/ciaData';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  action?: {
    label: string;
    targetId: string;
  };
  options?: string[];
}

interface AiAdvisorChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: (pkgId?: string) => void;
}

export const AiAdvisorChatbot: React.FC<AiAdvisorChatbotProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am your BNC Global CIA® Academic Advisor. How can I assist your internal audit career and certification journey today?",
      options: [
        "Check my eligibility for CIA",
        "Compare Premium vs Premium Plus",
        "What are the official IIA exam fees?",
        "How does the IAP Part 1 pathway work?"
      ]
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Contextual AI Knowledge-based Response Simulator
    setTimeout(() => {
      let aiReply = "Thank you for asking. Our academic counseling team can provide complete guidance on this.";
      let action: { label: string; targetId: string } | undefined;
      const lower = query.toLowerCase();

      if (lower.includes('eligib') || lower.includes('degree') || lower.includes('bachelor') || lower.includes('master') || lower.includes('experience')) {
        aiReply = "Under the IIA Global Internal Audit Standards:\n\n• Master's Degree holders need 1 year of audit/control experience to certify.\n• Bachelor's Degree holders need 2 years of experience.\n• University/College Students can start immediately without a degree via the IAP Part 1 route.\n• Chartered Accountants (CA) & CPAs can qualify through 1 single Challenge Exam sitting!\n\nZero prior experience is needed to enroll in our classes and sit for the exams.";
        action = { label: "View Full Eligibility Guide", targetId: "curriculum" };
      } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('iia') || lower.includes('tax') || lower.includes('gst')) {
        aiReply = "Official IIA India Exam Fees for 2026-27 (with 18% GST):\n\n• CIA Application Fee: US$ 84.96\n• Part 1 Exam: US$ 219.48\n• Part 2 Exam: US$ 198.24\n• Part 3 Exam: US$ 198.24\n• Full Program Total: US$ 700.92 (approx. ₹60,600).\n\nIIA India student members can start with the IAP route for just US$ 247.80 total!";
        action = { label: "Open IIA Fee Calculator", targetId: "fees" };
      } else if (lower.includes('premium') || lower.includes('package') || lower.includes('price') || lower.includes('emi') || lower.includes('ai tool')) {
        aiReply = "We offer 3 tailored tuition tiers:\n\n1. Basic (₹40,000 / $490): 18-month LMS, recorded classes, 5,000+ test bank, mock exams.\n2. Premium Live (₹60,000 / $735) [Most Popular]: Live interactive weekend classes (Fri/Sat), hardcopy books couriered home, doubt solving.\n3. Premium Plus (₹75,000 / $915): Live classes + 30-hour AI Audit Tools Lab for automated workpapers & data analytics.\n\nAll packages have 2-part zero-cost EMI options!";
        action = { label: "Compare Package Features", targetId: "packages" };
      } else if (lower.includes('iap') || lower.includes('practitioner') || lower.includes('part 1') || lower.includes('student')) {
        aiReply = "The Internal Audit Practitioner (IAP) is a permanent international designation awarded by the IIA upon clearing Part 1 alone. No university degree is required! Your Part 1 pass remains valid credit toward the full CIA for 4 years, and the IIA waives your CIA application fee.";
        action = { label: "View IAP Details", targetId: "packages" };
      } else if (lower.includes('negative') || lower.includes('marking') || lower.includes('pass mark') || lower.includes('questions')) {
        aiReply = "There is NO negative marking on any part of the CIA exam! You should answer every single question. You need a scaled score of 600 points (out of 750) to pass. Part 1 has 125 questions (150 mins); Parts 2 and 3 each have 100 questions (120 mins).";
        action = { label: "Read Syllabus Breakdown", targetId: "exam" };
      } else if (lower.includes('tutor') || lower.includes('faculty') || lower.includes('instructor') || lower.includes('teacher') || lower.includes('gurvinder') || lower.includes('who teaches')) {
        aiReply = "Your master tutor and lead instructor is CA Gurvinder Pal Singh, Co-Founder & Managing Director of BNC Global.\n\n• 21+ years of experience in Big 4 (KPMG), Aon, and global risk consulting\n• Special Invitee to the ICAI Sustainability Reporting Standards Board (SRSB)\n• Chartered Accountant (ICAI) & B.Com (Hons.) from Delhi University\n• Personally conducts the 150+ hours of live weekend coaching and doubt clearing!";
        action = { label: "Meet Tutor: CA Gurvinder Pal Singh", targetId: "tutor" };
      } else if (lower.includes('reimburse') || lower.includes('employer') || lower.includes('company')) {
        aiReply = "Yes! Major accounting firms (Deloitte, PwC, EY, KPMG, BDO, Grant Thornton) and multinational banks actively reimburse CIA training and exam registration fees upon passing. BNC Global provides tax invoices with GST for your employer claims.";
      } else {
        aiReply = `I understand you're inquiring about "${query}". At BNC Global, we provide complete 150+ hours live training, physical test banks, and placement assistance for the CIA®. Would you like to check out our upcoming cohort dates or speak with a senior counselor?`;
        action = { label: "View Live Cohorts", targetId: "packages" };
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        action,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (targetId: string) => {
    onClose();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: "Hello! I am your BNC Global CIA® Academic Advisor. How can I assist your internal audit career and certification journey today?",
        options: [
          "Check my eligibility for CIA",
          "Compare Premium vs Premium Plus",
          "What are the official IIA exam fees?",
          "How does the IAP Part 1 pathway work?"
        ]
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm pointer-events-auto">
      <div className="w-full sm:w-[420px] max-h-[85vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-300">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-sky-800 via-sky-700 to-[#b58b42] text-white border-b border-sky-600/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>BNC CIA Academic Advisor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-sky-100 font-medium">
                Trained on IIA 2026-27 Standards & Curriculum
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-1 rounded-md text-sky-100 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-sky-100 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white rounded-br-none shadow-md font-medium'
                    : 'bg-white text-slate-800 border border-sky-100 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line text-xs font-normal">{m.text}</p>
              </div>

              {/* Action Button inside AI message */}
              {m.action && (
                <button
                  onClick={() => handleActionClick(m.action!.targetId)}
                  className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-bold text-[11px] hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  <span>{m.action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#b58b42]" />
                </button>
              )}

              {/* Quick option cushions */}
              {m.options && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSend(opt)}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#b58b42] hover:text-[#b58b42] hover:bg-amber-50/50 transition-all text-left shadow-xs cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-sky-100 text-slate-400 w-16">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b58b42] animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b58b42] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b58b42] animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-sky-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about CIA, eligibility, fees..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] disabled:opacity-40 text-white transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span>Powered by BNC Global IA Knowledge Engine</span>
            <button
              onClick={() => {
                onClose();
                onOpenCheckout('premium');
              }}
              className="text-[#b58b42] hover:text-[#9e7735] hover:underline font-bold"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
