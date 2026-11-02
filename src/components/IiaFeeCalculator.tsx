import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const IiaFeeCalculator: React.FC = () => {
  const [candidateType, setCandidateType] = useState<'member' | 'student' | 'non-member'>('member');

  let appFee = 72;
  let part1 = 186;
  let part2 = 168;
  let part3 = 168;

  if (candidateType === 'student') {
    appFee = 45;
    part1 = 165;
    part2 = 168;
    part3 = 168;
  } else if (candidateType === 'non-member') {
    appFee = 230;
    part1 = 395;
    part2 = 345;
    part3 = 345;
  }

  const subtotalUSD = appFee + part1 + part2 + part3;
  const gstUSD = Math.round(subtotalUSD * 0.18 * 100) / 100;
  const totalUSD = Math.round((subtotalUSD + gstUSD) * 100) / 100;
  const approxINR = Math.round(totalUSD * 86.5);

  return (
    <section id="fees" className="relative overflow-hidden py-24 border-b border-sky-950">
      {/* Corporate Architectural Background Layer - Slightly dark, modern, premium, stylish */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.jpg"
          alt="BNC IIA Fees Background"
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/88 via-[#0b1c31]/78 to-[#071322]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b58b42]/20 border border-[#b58b42]/40 text-xs font-bold text-[#f1bd5b] uppercase tracking-widest mb-3">
            <Calculator className="w-3.5 h-3.5 text-[#f1bd5b]" />
            <span>100% UPFRONT TRANSPARENCY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Official IIA® India Examination Fees (2026-27)
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Fees paid directly to the Institute of Internal Auditors (IIA) via the CCMS candidate management portal. We believe in 100% transparency with zero hidden markups.
          </p>
        </div>

        {/* Interactive Estimator Card in Light Mode */}
        <div className="card-reflection mb-14 p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sky-50">
            <div>
              <span className="text-xs font-bold text-[#b58b42] uppercase tracking-wider">
                Interactive Fee Estimator
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Calculate Your Total Exam Dues Payable to the IIA
              </h3>
            </div>

            {/* Candidate category toggle */}
            <div className="flex items-center p-1 rounded-xl bg-sky-50 border border-sky-100">
              <button
                onClick={() => setCandidateType('member')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  candidateType === 'member'
                    ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                IIA Member (Standard)
              </button>
              <button
                onClick={() => setCandidateType('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  candidateType === 'student'
                    ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student Member
              </button>
              <button
                onClick={() => setCandidateType('non-member')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  candidateType === 'non-member'
                    ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Non-Member
              </button>
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Fee Component Breakdown */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between p-2.5 rounded-xl bg-sky-50/40 border border-sky-100">
                <span>{candidateType === 'student' ? 'IAP / CIA Application Fee' : 'CIA Application Fee'}:</span>
                <span className="font-semibold text-slate-900">US$ {appFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-sky-50/40 border border-sky-100">
                <span>Part 1 Exam Registration (125 MCQs):</span>
                <span className="font-semibold text-slate-900">US$ {part1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-sky-50/40 border border-sky-100">
                <span>Part 2 Exam Registration (100 MCQs):</span>
                <span className="font-semibold text-slate-900">US$ {part2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-sky-50/40 border border-sky-100">
                <span>Part 3 Exam Registration (100 MCQs):</span>
                <span className="font-semibold text-slate-900">US$ {part3.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 text-slate-600">
                <span>Goods & Services Tax (GST 18%):</span>
                <span className="font-semibold text-[#b58b42]">US$ {gstUSD.toFixed(2)}</span>
              </div>
            </div>

            {/* Right Total Highlight Box with Reflection */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-amber-50/60 border border-amber-200 text-center shadow-xs">
              <span className="text-xs font-bold text-[#b58b42] uppercase tracking-widest">
                TOTAL IIA EXAM COST
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 my-2">
                US$ {totalUSD.toFixed(2)}
              </div>
              <div className="text-xs text-sky-700 font-bold mb-3">
                ≈ ₹{approxINR.toLocaleString('en-IN')} (inc. 18% GST)
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {candidateType === 'student'
                  ? 'Student members save over US$ 56 via the IAP subsidized track.'
                  : candidateType === 'member'
                  ? 'IIA India members save US$ 850+ compared to non-member fees.'
                  : 'We strongly recommend activating IIA India membership first to unlock lower exam fees.'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Fee Tables in Light Mode */}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>IIA India Member Examination Price Schedule</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-[#b58b42] font-bold uppercase">
                Offer Rates Active Till March 31, 2027
              </span>
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                    <th className="p-4 font-bold">Item Description</th>
                    <th className="p-4 font-bold">Standard Price</th>
                    <th className="p-4 font-bold text-blue-900">Special Offer Price</th>
                    <th className="p-4 font-bold text-emerald-700">Total with 18% GST</th>
                    <th className="p-4 font-bold">Validity / Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-4 font-semibold text-slate-900">CIA Application Fee</td>
                    <td className="p-4">US$ 90.00</td>
                    <td className="p-4 font-bold text-blue-900">US$ 72.00</td>
                    <td className="p-4 font-bold text-emerald-700">US$ 84.96</td>
                    <td className="p-4 text-slate-500">Valid for 3 years</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-900">Part 1: Fundamentals Exam</td>
                    <td className="p-4">US$ 232.50</td>
                    <td className="p-4 font-bold text-blue-900">US$ 186.00</td>
                    <td className="p-4 font-bold text-emerald-700">US$ 219.48</td>
                    <td className="p-4 text-slate-500">125 questions, 150 min</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-900">Part 2: Engagement Exam</td>
                    <td className="p-4">US$ 210.00</td>
                    <td className="p-4 font-bold text-blue-900">US$ 168.00</td>
                    <td className="p-4 font-bold text-emerald-700">US$ 198.24</td>
                    <td className="p-4 text-slate-500">100 questions, 120 min</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-900">Part 3: Function Exam</td>
                    <td className="p-4">US$ 210.00</td>
                    <td className="p-4 font-bold text-blue-900">US$ 168.00</td>
                    <td className="p-4 font-bold text-emerald-700">US$ 198.24</td>
                    <td className="p-4 text-slate-500">100 questions, 120 min</td>
                  </tr>
                  <tr className="bg-blue-50/40">
                    <td className="p-4 font-black text-slate-900">Full CIA Program (App + 3 Parts)</td>
                    <td className="p-4 font-bold">US$ 742.50</td>
                    <td className="p-4 font-black text-blue-900">US$ 594.00</td>
                    <td className="p-4 font-black text-emerald-700">US$ 700.92</td>
                    <td className="p-4 font-semibold text-slate-700">Save US$ 148.50 with offer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Incidental / Operational Fees Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1">IIA India Annual Membership</h4>
              <p className="text-xs text-slate-500 mb-3">
                Required to unlock subsidized member pricing:
              </p>
              <div className="text-xs text-slate-700 space-y-1">
                <div>• Professional: ₹4,500/yr + ₹2,000 entrance fee</div>
                <div>• Student: ₹2,500/yr + ₹500 entrance fee</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Rescheduling Policy</h4>
              <p className="text-xs text-slate-500 mb-3">
                Administered by Pearson VUE testing centers:
              </p>
              <div className="text-xs text-slate-700 space-y-1">
                <div>• Reschedule fee: US$ 75 per occurrence</div>
                <div>• Zero charge if center closes due to emergency</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Employer Reimbursements</h4>
              <p className="text-xs text-slate-500 mb-3">
                Corporate sponsor claim support:
              </p>
              <div className="text-xs text-slate-700 space-y-1">
                <div>• Big 4, BDO, GT & MNCs offer 100% exam reimbursement</div>
                <div>• BNC Global issues GST tax receipts for claims</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
