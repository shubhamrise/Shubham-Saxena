import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Download, Calendar, User, BookOpen, Trash2, Shield, RefreshCw } from 'lucide-react';

interface AdmissionsDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeadRecord {
  id: string;
  type: 'Enrollment' | 'Consultation' | 'Quick Callback';
  name: string;
  phone: string;
  email: string;
  programOrInterest?: string;
  qualification?: string;
  date: string;
  amount?: string;
}

export const AdmissionsDeskModal: React.FC<AdmissionsDeskModalProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'Enrollment' | 'Consultation' | 'Quick Callback'>('all');

  const loadLeads = () => {
    const records: LeadRecord[] = [];

    // 1. Orders
    try {
      const orders = JSON.parse(localStorage.getItem('bnc_orders') || '[]');
      orders.forEach((o: any, idx: number) => {
        records.push({
          id: o.orderId || `ord-${idx}`,
          type: 'Enrollment',
          name: o.studentName || 'Student',
          phone: o.studentPhone || '',
          email: o.studentEmail || '',
          programOrInterest: o.packageName || 'CIA Coaching',
          date: o.orderDate || new Date().toISOString(),
          amount: o.totalPrice ? `${o.currency || '₹'} ${o.totalPrice}` : undefined,
        });
      });
    } catch (e) {
      console.warn(e);
    }

    // 2. Inquiries
    try {
      const inquiries = JSON.parse(localStorage.getItem('bnc_inquiries') || '[]');
      inquiries.forEach((inq: any, idx: number) => {
        records.push({
          id: `inq-${idx}`,
          type: 'Consultation',
          name: inq.name || 'Candidate',
          phone: inq.phone || '',
          email: inq.email || '',
          programOrInterest: inq.packageInterest || inq.qualification || 'General Inquiry',
          qualification: inq.qualification,
          date: inq.submittedAt || new Date().toISOString(),
        });
      });
    } catch (e) {
      console.warn(e);
    }

    // 3. Hero Quick Enquiries
    try {
      const heroEnquiries = JSON.parse(localStorage.getItem('bnc_hero_enquiries') || '[]');
      heroEnquiries.forEach((h: any, idx: number) => {
        records.push({
          id: `hero-${idx}`,
          type: 'Quick Callback',
          name: h.enquiryName || 'Candidate',
          phone: h.enquiryPhone || '',
          email: h.enquiryEmail || '',
          programOrInterest: h.enquiryProgram || 'CIA Accelerator',
          qualification: h.enquiryQualification,
          date: h.submittedAt || new Date().toISOString(),
        });
      });
    } catch (e) {
      console.warn(e);
    }

    // Sort newest first
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLeads(records);
  };

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen]);

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Type', 'Name', 'Phone', 'Email', 'Program / Interest', 'Qualification', 'Date', 'Amount'];
    const rows = leads.map((l) => [
      l.type,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${(l.programOrInterest || '').replace(/"/g, '""')}"`,
      `"${(l.qualification || '').replace(/"/g, '""')}"`,
      `"${new Date(l.date).toLocaleString('en-IN')}"`,
      `"${l.amount || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BNC_ELEVATE_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear stored lead history from this browser?')) {
      localStorage.removeItem('bnc_orders');
      localStorage.removeItem('bnc_inquiries');
      localStorage.removeItem('bnc_hero_enquiries');
      setLeads([]);
    }
  };

  if (!isOpen) return null;

  const filteredLeads = filter === 'all' ? leads : leads.filter((l) => l.type === filter);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-[#f3bc53]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Admissions Desk Vault</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#b58b42] text-white">
                  {leads.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live candidate lead dossiers and enrollment requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b58b42] hover:bg-[#9e7735] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              title="Download CSV for Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={loadLeads}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              title="Refresh leads"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1">Filter:</span>
            {(['all', 'Enrollment', 'Consultation', 'Quick Callback'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  filter === t
                    ? 'bg-sky-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t === 'all' ? 'All Leads' : t}
              </button>
            ))}
          </div>

          {leads.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <User className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No student leads recorded yet in this browser.</p>
              <p className="text-xs text-slate-400">
                Whenever a candidate submits an enrollment form or callback inquiry, their dossier is recorded here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

                return (
                  <div
                    key={lead.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.type === 'Enrollment'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : lead.type === 'Consultation'
                              ? 'bg-amber-100 text-[#b58b42] border border-amber-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {lead.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                        {lead.amount && (
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {lead.amount}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        {lead.phone && (
                          <div className="flex items-center gap-1 font-mono text-slate-900 font-semibold">
                            <Phone className="w-3 h-3 text-[#b58b42]" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1 font-mono text-slate-700">
                            <Mail className="w-3 h-3 text-sky-700" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        {lead.programOrInterest && (
                          <div className="flex items-center gap-1 text-slate-700">
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            <span>{lead.programOrInterest}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(lead.date).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Connect Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {lead.phone && (
                        <>
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `Hi ${lead.name}, thank you for reaching out to BNC ELEVATE regarding the CIA Executive Accelerator.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Call candidate"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </>
                      )}

                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(
                            'BNC ELEVATE - CIA Program Consultation'
                          )}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                          title="Email candidate"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Official Dispatch Target: <strong className="text-slate-800">info@bncglobal.in</strong></span>
          <span>Lead Hotline: <strong className="text-slate-800">+91 63960 18626</strong></span>
        </div>
      </div>
    </div>
  );
};
