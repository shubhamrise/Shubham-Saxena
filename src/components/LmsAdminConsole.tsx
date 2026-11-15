import React, { useState } from 'react';
import { ManagedLearner, LmsAdminUser, EnquiryLead, CrmCallLog } from '../types';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LogOut,
  Sparkles,
  BookOpen,
  Filter,
  X,
  AlertTriangle,
  Mail,
  Phone,
  PhoneCall,
  FileSpreadsheet,
  Download,
  MessageSquare,
  Sun,
  Moon,
  Video
} from 'lucide-react';
import { LmsModule } from '../data/lmsData';
import { CrmCallLogEditor } from './admin/CrmCallLogEditor';
import { CurriculumEditor } from './admin/CurriculumEditor';

const INITIAL_CRM_CALL_LOGS: CrmCallLog[] = [
  {
    id: 'crm-1',
    studentName: 'Shubham Saxena',
    phone: '+91 63960 18626',
    email: 'shubhamsaxena787787@gmail.com',
    direction: 'outbound',
    callStatus: 'Connected',
    callDateTime: '2026-11-14T16:30',
    durationSeconds: 512,
    responseSummary: 'Interested in Nov 2026 Live Interactive cohort; requested GIAS 2025 syllabus overview and batch timings.',
    interestLevel: 'Hot / Ready to Enroll',
    reconnectAgain: true,
    nextFollowUpDate: 'Nov 16, 4:00 PM IST',
    feedback: 'Candidate is a qualified CA exploring CIA Challenge / 3-Part options. Positive conversation; asked for a follow-up call after reviewing weekend schedule.',
    handledBy: 'CA Gurvinder Pal Singh (Lead Director)'
  },
  {
    id: 'crm-2',
    studentName: 'Rohit Verma',
    phone: '+91 98234 11223',
    email: 'rohit.verma@example.com',
    direction: 'inbound',
    callStatus: 'Connected',
    callDateTime: '2026-11-13T11:45',
    durationSeconds: 325,
    responseSummary: 'Confirmed LMS login credentials and inquired about Part 1 practice test bank target score.',
    interestLevel: 'Support / Existing Student',
    reconnectAgain: false,
    feedback: 'Guided student through the Readiness Index and video masterclasses section. Issue resolved on the call.',
    handledBy: 'CA Gurvinder Pal Singh (Lead Director)'
  },
  {
    id: 'crm-3',
    studentName: 'Ananya Iyer',
    phone: '+91 98450 67890',
    email: 'ananya.iyer@example.com',
    direction: 'outbound',
    callStatus: 'Callback Requested',
    callDateTime: '2026-11-12T18:10',
    durationSeconds: 138,
    responseSummary: 'Busy in office audit review; asked to reconnect tomorrow evening regarding enrollment confirmation.',
    interestLevel: 'Warm / Follow-up',
    reconnectAgain: true,
    nextFollowUpDate: 'Nov 16, 6:30 PM IST',
    feedback: 'Short call. Candidate requested an evening slot after 6:00 PM IST to finalize batch onboarding.',
    handledBy: 'BNC Admissions Desk'
  }
];

export type AdminConsoleTab =
  | 'learners'
  | 'videos'
  | 'leads'
  | 'crm';

interface LmsAdminConsoleProps {
  adminUser: LmsAdminUser;
  learners: ManagedLearner[];
  onUpdateLearners: (updated: ManagedLearner[]) => void;
  modules: LmsModule[];
  onUpdateModules: (updated: LmsModule[]) => void;
  onLogoutAdmin: () => void;
  onSwitchToStudentView: (learner?: ManagedLearner) => void;
  onBackToWebsite: () => void;
  onShowToast: (msg: string) => void;
}

export const LmsAdminConsole: React.FC<LmsAdminConsoleProps> = ({
  adminUser,
  learners,
  onUpdateLearners,
  modules,
  onUpdateModules,
  onLogoutAdmin,
  onSwitchToStudentView,
  onBackToWebsite,
  onShowToast,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('bnc_admin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('bnc_admin_theme', next);
    } catch {}
    onShowToast(`Admin Console switched to ${next === 'light' ? 'Executive Light' : 'Dark'} mode`);
  };

  const [consoleTab, setConsoleTab] = useState<AdminConsoleTab>('crm');
  const [searchTerm, setSearchTerm] = useState('');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<ManagedLearner | null>(null);
  const [confirmDeleteLearnerId, setConfirmDeleteLearnerId] = useState<string | null>(null);
  const [confirmDeleteLeadId, setConfirmDeleteLeadId] = useState<string | null>(null);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // CRM Phone Call Logs state
  const [crmCallLogs, setCrmCallLogs] = useState<CrmCallLog[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_crm_call_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CRM_CALL_LOGS;
  });

  const handleUpdateCallLogs = (updated: CrmCallLog[]) => {
    setCrmCallLogs(updated);
    try {
      localStorage.setItem('bnc_crm_call_logs', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Unified leads state populated from website inquiries
  const [leads, setLeads] = useState<EnquiryLead[]>(() => {
    try {
      const stored = localStorage.getItem('bnc_all_leads');
      if (stored) return JSON.parse(stored);
      const hero = JSON.parse(localStorage.getItem('bnc_hero_enquiries') || '[]');
      const brochure = JSON.parse(localStorage.getItem('bnc_brochure_downloads') || '[]');
      const consult = JSON.parse(localStorage.getItem('bnc_inquiries') || '[]');
      const merged: EnquiryLead[] = [];
      hero.forEach((h: any, i: number) => {
        merged.push({
          id: `lead-h-${i}`,
          name: h.enquiryName || 'Enquired Candidate',
          email: h.enquiryEmail || 'candidate@example.com',
          phone: h.enquiryPhone || '+91 63960 18626',
          qualification: h.enquiryQualification || "Bachelor's Degree",
          program: h.enquiryProgram || 'All Packages',
          source: 'Hero Enquiry & Download Brochure',
          status: 'New',
          submittedAt: h.submittedAt ? new Date(h.submittedAt).toLocaleString() : 'Recent',
          brochureDownloaded: true,
          notes: 'Submitted via Hero consultation desk.'
        });
      });
      brochure.forEach((b: any, i: number) => {
        merged.push({
          id: `lead-b-${i}`,
          name: b.name || 'Brochure Candidate',
          email: b.email || 'candidate@example.com',
          phone: b.phone || '+91 63960 18626',
          qualification: "Bachelor's Degree",
          program: b.packageInterest || 'Complete Syllabus',
          source: 'Brochure Modal Download',
          status: 'New',
          submittedAt: b.downloadedAt ? new Date(b.downloadedAt).toLocaleString() : 'Recent',
          brochureDownloaded: true,
          notes: 'Downloaded 10-page syllabus brochure.'
        });
      });
      consult.forEach((c: any, i: number) => {
        merged.push({
          id: `lead-c-${i}`,
          name: c.name || 'Counseling Candidate',
          email: c.email || 'candidate@example.com',
          phone: c.phone || '+91 63960 18626',
          qualification: c.qualification || "Bachelor's Degree",
          program: c.packageInterest || 'Consultation Request',
          source: 'Faculty Consultation Desk',
          status: 'New',
          submittedAt: c.submittedAt ? new Date(c.submittedAt).toLocaleString() : 'Recent',
          brochureDownloaded: false,
          notes: 'Requested senior faculty callback.'
        });
      });
      if (merged.length > 0) return merged;
      return [
        {
          id: 'lead-sample-1',
          name: 'Shubham Saxena',
          email: 'shubhamsaxena787787@gmail.com',
          phone: '+91 63960 18626',
          qualification: 'Chartered Accountant (CA)',
          program: 'Premium Live Interactive',
          source: 'Hero Enquiry & Download Brochure',
          status: 'New',
          submittedAt: 'Just now',
          brochureDownloaded: true,
          notes: 'Interested in Nov cohort and GIAS 2025 updates.'
        },
        {
          id: 'lead-sample-2',
          name: 'Rohit Verma',
          email: 'rohit.verma@example.com',
          phone: '+91 98234 11223',
          qualification: 'CMA / Cost Accountant',
          program: 'Premium Plus with AI Audit',
          source: 'Hero Enquiry & Download Brochure',
          status: 'Enrolled',
          submittedAt: 'Oct 24, 2026',
          brochureDownloaded: true,
          notes: 'Enrolled in Batch 2026-A. Full fee cleared.'
        }
      ];
    } catch {
      return [];
    }
  });

  const handleDeleteLead = (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);
    try {
      localStorage.setItem('bnc_all_leads', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    onShowToast('Lead removed from inquiries log');
  };

  const handleExportLeadsCsv = () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Qualification', 'Program', 'Source', 'Brochure Downloaded', 'Submitted At'];
      const rows = leads.map((l) => [
        `"${l.name}"`,
        `"${l.email}"`,
        `"${l.phone}"`,
        `"${l.qualification || ''}"`,
        `"${l.program || ''}"`,
        `"${l.source}"`,
        `"${l.brochureDownloaded ? 'Yes' : 'No'}"`,
        `"${l.submittedAt}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BNC_Global_Enquiries_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('✓ Exported leads to CSV successfully!');
    } catch (e) {
      console.warn('CSV export error', e);
    }
  };

  const handleConvertLeadToLearner = (lead: EnquiryLead) => {
    setNewName(lead.name);
    setNewEmail(lead.email);
    setNewPhone(lead.phone || '+91 ');
    setNewPackage(lead.program || 'Premium Live Interactive');
    setNewNotes(`Converted from inquiry lead (${lead.source})`);
    setAddFormError(null);
    setIsAddModalOpen(true);
  };

  // New learner form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('bnc2026');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newOrderId, setNewOrderId] = useState(() => {
    const highest = learners.reduce((max, l) => {
      const num = parseInt(l.orderId || '0', 10);
      return !isNaN(num) && num > max ? num : max;
    }, 2026000);
    return String(highest + 1);
  });
  const [newPackage, setNewPackage] = useState('Premium Plus with AI Audit Lab');
  const [newFeeStatus, setNewFeeStatus] = useState('Full Tuition Paid & Verified');
  const [newStatus, setNewStatus] = useState<'active' | 'revoked' | 'pending'>('active');
  const [newNotes, setNewNotes] = useState('');

  // Filtering
  const filteredLearners = learners.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.orderId && l.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.password && l.password.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.packageName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && l.status === filterStatus;
  });

  // Leads Filtering
  const filteredLeads = leads.filter((l) => {
    const term = leadSearchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term) ||
      (l.program || '').toLowerCase().includes(term) ||
      (l.qualification || '').toLowerCase().includes(term) ||
      l.source.toLowerCase().includes(term)
    );
  });

  // KPI counts
  const totalCount = learners.length;
  const activeCount = learners.filter((l) => l.status === 'active').length;
  const revokedCount = learners.filter((l) => l.status === 'revoked').length;
  const pendingCount = learners.filter((l) => l.status === 'pending').length;

  // Toggle access handler
  const handleToggleAccess = (id: string) => {
    const updated = learners.map((l) => {
      if (l.id === id) {
        const nextStatus: 'active' | 'revoked' = l.status === 'active' ? 'revoked' : 'active';
        return {
          ...l,
          status: nextStatus,
          feeStatus:
            nextStatus === 'active'
              ? 'Tuition Clearance Verified'
              : 'Access Suspended by Academic Administration'
        };
      }
      return l;
    });
    onUpdateLearners(updated);
    const target = learners.find((l) => l.id === id);
    if (target) {
      if (target.status === 'active') {
        onShowToast(`🔒 Access revoked for ${target.name}`);
      } else {
        onShowToast(`✓ Access granted for ${target.name}`);
      }
    }
  };

  // Add learner
  const handleAddLearner = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);
    if (!newName.trim() || !newEmail.trim()) {
      setAddFormError('Please provide both student name and email.');
      return;
    }

    const assignedOrderId = newOrderId.trim() || String(Date.now()).slice(-7);

    // Check duplicate email
    if (learners.some((l) => l.email.trim().toLowerCase() === newEmail.trim().toLowerCase())) {
      setAddFormError(`Student email "${newEmail}" is already registered in the learner roster.`);
      return;
    }

    const newLearner: ManagedLearner = {
      id: `learner-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword.trim() || 'bnc2026',
      phone: newPhone.trim(),
      orderId: assignedOrderId,
      packageName: newPackage,
      feeStatus: newFeeStatus,
      status: newStatus,
      enrollmentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      accessDuration: '18 Months Active Access',
      notes: newNotes.trim() || 'Admin-authorized enrollment'
    };

    const updated = [newLearner, ...learners];
    onUpdateLearners(updated);
    setIsAddModalOpen(false);
    onShowToast(`✓ Successfully authorized ${newLearner.name} with password "${newLearner.password}"!`);

    // Reset fields
    setNewName('');
    setNewEmail('');
    setNewPassword('bnc2026');
    setNewPhone('+91 ');
    setNewNotes('');
  };

  // Save edit learner
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLearner) return;

    const updated = learners.map((l) => (l.id === editingLearner.id ? editingLearner : l));
    onUpdateLearners(updated);
    setEditingLearner(null);
    onShowToast(`Updated student profile for ${editingLearner.name}`);
  };

  // Delete learner (triggered after inline confirmation)
  const handleDeleteLearner = (id: string, name: string) => {
    const updated = learners.filter((l) => l.id !== id);
    onUpdateLearners(updated);
    setConfirmDeleteLearnerId(null);
    onShowToast(`Removed ${name} from learner roster.`);
  };

  // Sync latest checkout orders from localStorage
  const handleSyncFromCheckout = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('bnc_enrollment_requests') || '[]');
      if (!Array.isArray(stored) || stored.length === 0) {
        onShowToast('No external checkout enrollments found in session memory.');
        return;
      }

      let addedCount = 0;
      const updated = [...learners];

      stored.forEach((ord: any) => {
        const orderIdStr = String(ord.orderId || '').trim();
        const emailStr = String(ord.studentEmail || '').trim().toLowerCase();

        if (orderIdStr && !updated.some((l) => l.orderId === orderIdStr || l.email === emailStr)) {
          updated.push({
            id: `ord-${ord.orderId}-${Date.now()}`,
            name: ord.studentName || 'Candidate',
            email: emailStr,
            phone: ord.studentPhone || '',
            orderId: orderIdStr,
            packageName: ord.packageName || 'Premium Live Interactive',
            feeStatus: 'Admissions Desk Enrollment · Confirmed',
            status: 'active',
            enrollmentDate: ord.createdAt || 'Recent',
            accessDuration: '18 Months Active Access',
            notes: 'Synced from checkout enrollment'
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        onUpdateLearners(updated);
        onShowToast(`✓ Synced ${addedCount} new learner(s) from website admissions!`);
      } else {
        onShowToast('All website enrollments are already present in roster.');
      }
    } catch (e) {
      console.warn('Sync failed', e);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-200 ${
      theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#071322] text-slate-100'
    }`}>
      {/* Background Wallpaper - Clearly Visible & Slightly Lightened Outside Boxes in Light Theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.jpg"
          alt="BNC Architectural Backdrop"
          className={`w-full h-full object-cover object-center ${
            theme === 'light' ? 'opacity-75 brightness-105' : 'filter contrast-125 opacity-30 brightness-75 saturate-110'
          }`}
        />
        {theme === 'dark' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/95 via-[#0b1d33]/90 to-[#06101c]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06]" />
          </>
        )}
      </div>

      {/* Top Admin Header Bar */}
      <header className={`relative z-10 border-b px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs transition-colors ${
        theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-[#07172b]/95 border-sky-950 shadow-md backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-sky-950/80 hover:bg-sky-900 border-sky-800/60 text-slate-200'
              }`}
              title="Return to Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#b58b42]" />
              <span>Public Website</span>
            </button>

            <div className={`h-6 w-px hidden sm:block ${theme === 'light' ? 'bg-slate-200' : 'bg-sky-900'}`} />

            <div className="flex items-center gap-2">
              <span className={`p-1 rounded border ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-200 text-[#b58b42]'
                  : 'bg-[#b58b42]/20 border-[#b58b42]/40 text-[#f1bd5b]'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <span className={`text-sm font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>BNC ELEVATE</span>
                <span className={`mx-2 font-light ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>|</span>
                <span className="text-xs uppercase tracking-wider text-[#b58b42] font-bold">
                  Academic Admin Console
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={theme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-300 font-medium'}>Logged in:</span>
              <span className={theme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{adminUser.name}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => onSwitchToStudentView()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all border border-sky-900/20"
              title="Preview LMS Curriculum as Student"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#f1bd5b]" />
              <span>Student LMS View</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-300 hover:border-rose-300'
                  : 'bg-slate-800/90 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border-slate-700 hover:border-rose-500/50'
              }`}
              title="Log out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Console Tab Switcher: Full LMS Administration */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2.5 rounded-3xl border w-full transition-colors ${
            theme === 'light'
              ? 'bg-white border-slate-200 shadow-md'
              : 'bg-[#091729] border-sky-800/80 shadow-xl'
          }`}
        >
          {/* 1. Student Call CRM */}
          <button
            type="button"
            onClick={() => setConsoleTab('crm')}
            className={`group px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-extrabold tracking-tight transition-all cursor-pointer flex items-center justify-between gap-3 whitespace-nowrap ${
              consoleTab === 'crm'
                ? 'bg-gradient-to-r from-[#0e2444] via-[#163a6b] to-[#b58b42] text-white shadow-lg ring-1 ring-[#f1bd5b]/40'
                : theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-slate-300'
                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-sky-900/60 hover:border-sky-700'
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  consoleTab === 'crm'
                    ? 'bg-white/15 text-emerald-300'
                    : theme === 'light'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                <PhoneCall className="w-[18px] h-[18px]" />
              </span>
              <span className="truncate">Student Call CRM</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black tabular-nums shrink-0 ${
                consoleTab === 'crm'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-white text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {crmCallLogs.length}
            </span>
          </button>

          {/* 2. Enquiries & Leads */}
          <button
            type="button"
            onClick={() => setConsoleTab('leads')}
            className={`group px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-extrabold tracking-tight transition-all cursor-pointer flex items-center justify-between gap-3 whitespace-nowrap ${
              consoleTab === 'leads'
                ? 'bg-gradient-to-r from-[#0e2444] via-[#163a6b] to-[#b58b42] text-white shadow-lg ring-1 ring-[#f1bd5b]/40'
                : theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-slate-300'
                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-sky-900/60 hover:border-sky-700'
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  consoleTab === 'leads'
                    ? 'bg-white/15 text-sky-200'
                    : theme === 'light'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-sky-500/15 text-sky-300'
                }`}
              >
                <Mail className="w-[18px] h-[18px]" />
              </span>
              <span className="truncate">Enquiries & Leads</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black tabular-nums shrink-0 ${
                consoleTab === 'leads'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-white text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {leads.length}
            </span>
          </button>

          {/* 3. Learners & Access */}
          <button
            type="button"
            onClick={() => setConsoleTab('learners')}
            className={`group px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-extrabold tracking-tight transition-all cursor-pointer flex items-center justify-between gap-3 whitespace-nowrap ${
              consoleTab === 'learners'
                ? 'bg-gradient-to-r from-[#0e2444] via-[#163a6b] to-[#b58b42] text-white shadow-lg ring-1 ring-[#f1bd5b]/40'
                : theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-slate-300'
                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-sky-900/60 hover:border-sky-700'
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  consoleTab === 'learners'
                    ? 'bg-white/15 text-[#f7cd76]'
                    : theme === 'light'
                    ? 'bg-amber-100/90 text-[#9c742e]'
                    : 'bg-amber-500/15 text-[#f1bd5b]'
                }`}
              >
                <UserCheck className="w-[18px] h-[18px]" />
              </span>
              <span className="truncate">Learners & Access</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black tabular-nums shrink-0 ${
                consoleTab === 'learners'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-white text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {learners.length}
            </span>
          </button>

          {/* 4. Video Uploads */}
          <button
            type="button"
            onClick={() => setConsoleTab('videos')}
            className={`group px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-extrabold tracking-tight transition-all cursor-pointer flex items-center justify-between gap-3 whitespace-nowrap ${
              consoleTab === 'videos'
                ? 'bg-gradient-to-r from-[#0e2444] via-[#163a6b] to-[#b58b42] text-white shadow-lg ring-1 ring-[#f1bd5b]/40'
                : theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-slate-300'
                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-sky-900/60 hover:border-sky-700'
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  consoleTab === 'videos'
                    ? 'bg-white/15 text-[#f7cd76]'
                    : theme === 'light'
                    ? 'bg-amber-100/90 text-[#9c742e]'
                    : 'bg-amber-500/15 text-[#f1bd5b]'
                }`}
              >
                <Video className="w-[18px] h-[18px]" />
              </span>
              <span className="truncate">Video Uploads</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black tabular-nums shrink-0 ${
                consoleTab === 'videos'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-white text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {modules.reduce((acc, m) => acc + m.lessons.length, 0)}
            </span>
          </button>
        </div>

        {consoleTab === 'learners' && (
          <>
            {/* Banner */}
            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-xs transition-colors ${
              theme === 'light'
                ? 'bg-gradient-to-r from-white via-sky-50 to-white border-slate-200'
                : 'bg-gradient-to-r from-[#0b1d33] via-[#091b30] to-[#122338] border-sky-800/60 shadow-xl'
            }`}>
              <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  theme === 'light'
                    ? 'bg-amber-50 text-[#b58b42] border-amber-200'
                    : 'bg-[#b58b42]/20 text-[#f1bd5b] border-[#b58b42]/40'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-[#b58b42]" />
                  <span>Access Authorization & Fee Clearance Management</span>
                </div>
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Learner Access & Enrollment Controller
                </h1>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  Grant or revoke individual student access to video masterclasses, official Gleim CIA test banks & SmartAdapt™, and AI audit tools in real-time. Students with <strong className="text-rose-600 font-bold">Revoked</strong> status cannot log in until administrative clearance.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleSyncFromCheckout}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
                    theme === 'light'
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="Sync latest enrollment orders from checkout"
                >
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                  <span>Sync Web Orders</span>
                </button>

                <button
                  onClick={() => {
                    setAddFormError(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Grant New Learner Access</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border shadow-xs ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#091729]/95 border-sky-900/60 shadow-lg text-white'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Total Learners</span>
                  <BookOpen className="w-4 h-4 text-sky-600" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Enrolled candidate accounts</div>
              </div>

              <div className={`p-5 rounded-2xl border shadow-xs ${
                theme === 'light'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'}`}>
                  <span>Access Granted</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>{activeCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300/80'}`}>Active paid learners authorized</div>
              </div>

              <div className={`p-5 rounded-2xl border shadow-xs ${
                theme === 'light'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-rose-950/40 border-rose-500/40 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-rose-800' : 'text-rose-400'}`}>
                  <span>Access Revoked</span>
                  <UserX className="w-4 h-4 text-rose-600" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>{revokedCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-rose-700' : 'text-rose-300/80'}`}>Suspended / fee pending accounts</div>
              </div>

              <div className={`p-5 rounded-2xl border shadow-xs ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-amber-950/40 border-amber-500/40 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]'}`}>
                  <span>Under Clearance</span>
                  <Clock className="w-4 h-4 text-[#b58b42]" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]'}`}>{pendingCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]/80'}`}>Pending finance approval</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-[#091729]/90 border-sky-900/60 shadow-md'
            }`}>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, email, or order ID..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-all border ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className={`text-xs font-semibold mr-1 flex items-center gap-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  <Filter className="w-3.5 h-3.5" />
                  <span>Status:</span>
                </span>
                {(['all', 'active', 'revoked', 'pending'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-gradient-to-r from-[#102a4e] to-[#b58b42] text-white shadow-xs'
                        : theme === 'light'
                        ? 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Roster Table */}
            <div className={`border rounded-3xl overflow-hidden shadow-xs transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-[#091729]/95 border-sky-900/60 shadow-2xl'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-[#061220] border-sky-950 text-slate-400'
                    }`}>
                      <th className="py-3.5 pl-5 pr-3">Learner Profile</th>
                      <th className="py-3.5 px-3">Student Email & Password</th>
                      <th className="py-3.5 px-3">Program / Package</th>
                      <th className="py-3.5 px-3">Tuition Fee Clearance</th>
                      <th className="py-3.5 px-3 text-center">LMS Access Status</th>
                      <th className="py-3.5 pl-3 pr-5 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${
                    theme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-sky-950/60 text-slate-300'
                  }`}>
                    {filteredLearners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`py-12 text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          No learners match the current search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLearners.map((learner) => {
                        const isActive = learner.status === 'active';
                        const isRevoked = learner.status === 'revoked';
                        const isPending = learner.status === 'pending';

                        return (
                          <tr
                            key={learner.id}
                            className={`transition-colors group ${
                              theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
                            }`}
                          >
                            {/* Learner Profile */}
                            <td className="py-3.5 pl-5 pr-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#102a4e] to-[#b58b42] flex items-center justify-center text-white font-extrabold text-[11px] shadow-xs shrink-0">
                                  {learner.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className={`font-bold transition-colors truncate max-w-[140px] ${
                                    theme === 'light' ? 'text-slate-900 group-hover:text-[#b58b42]' : 'text-white group-hover:text-[#f1bd5b]'
                                  }`}>
                                    {learner.name}
                                  </div>
                                  {learner.phone && (
                                    <div className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{learner.phone}</div>
                                  )}
                                  <div className={`text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Enrolled: {learner.enrollmentDate}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Student Email & Password */}
                            <td className="py-3.5 px-3">
                              <div className={`font-semibold text-xs break-all max-w-[190px] ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                {learner.email}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Pass:</span>
                                <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                                  theme === 'light'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                }`}>
                                  {learner.password || 'bnc2026'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(learner.password || 'bnc2026');
                                    onShowToast(`Copied password for ${learner.name}`);
                                  }}
                                  className={`text-[10px] font-semibold underline cursor-pointer ml-0.5 ${
                                    theme === 'light' ? 'text-sky-700 hover:text-sky-900' : 'text-sky-400 hover:text-white'
                                  }`}
                                  title="Copy student password"
                                >
                                  Copy
                                </button>
                              </div>
                              {learner.orderId && (
                                <div className={`text-[10px] mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Ref: #{learner.orderId}
                                </div>
                              )}
                            </td>

                            {/* Package */}
                            <td className="py-3.5 px-3 max-w-[175px]">
                              <div className={`font-semibold leading-snug ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{learner.packageName}</div>
                              <div className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{learner.accessDuration}</div>
                            </td>

                            {/* Fee Status */}
                            <td className="py-3.5 px-3">
                              <div
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                                  isActive
                                    ? theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                    : isPending
                                    ? theme === 'light' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                    : theme === 'light' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {isActive ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : isPending ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                )}
                                <span>{learner.feeStatus}</span>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-3 text-center">
                              {isActive ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                                  theme === 'light'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active Access</span>
                                </span>
                              ) : isRevoked ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                                  theme === 'light'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}>
                                  <UserX className="w-3 h-3 text-rose-600" />
                                  <span>Access Revoked</span>
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                                  theme === 'light'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-amber-500/20 text-[#f1bd5b] border-amber-500/40'
                                }`}>
                                  <Clock className="w-3 h-3 text-[#b58b42]" />
                                  <span>Pending Clearance</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 pl-3 pr-5 text-right">
                              <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                {confirmDeleteLearnerId === learner.id ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLearner(learner.id, learner.name)}
                                      className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                                    >
                                      Confirm Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteLearnerId(null)}
                                      className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                                        theme === 'light'
                                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                      }`}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {/* Toggle Grant / Revoke */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleAccess(learner.id)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border whitespace-nowrap ${
                                        isActive
                                          ? theme === 'light'
                                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shadow-xs'
                                            : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-700/60 shadow-xs'
                                          : theme === 'light'
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-xs'
                                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border-emerald-700/60 shadow-xs'
                                      }`}
                                      title={isActive ? 'Click to revoke LMS access' : 'Click to grant LMS access'}
                                    >
                                      {isActive ? 'Revoke Access' : 'Grant Access'}
                                    </button>

                                    {/* Login As Student (Preview) */}
                                    <button
                                      type="button"
                                      onClick={() => onSwitchToStudentView(learner)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        theme === 'light'
                                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-transparent'
                                      }`}
                                      title="Preview LMS as this student"
                                    >
                                      <BookOpen className="w-4 h-4 text-sky-600" />
                                    </button>

                                    {/* Edit Details */}
                                    <button
                                      type="button"
                                      onClick={() => setEditingLearner(learner)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        theme === 'light'
                                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-transparent'
                                      }`}
                                      title="Edit student package & notes"
                                    >
                                      <Edit3 className="w-4 h-4 text-[#b58b42]" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteLearnerId(learner.id)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        theme === 'light'
                                          ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border-slate-200'
                                          : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border-transparent'
                                      }`}
                                      title="Remove from roster"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

    {consoleTab === 'videos' && (
      <CurriculumEditor
        modules={modules}
        onUpdateModules={onUpdateModules}
        onShowToast={onShowToast}
        theme={theme}
      />
    )}

    {consoleTab === 'crm' && (
      <CrmCallLogEditor
        callLogs={crmCallLogs}
        onUpdateCallLogs={handleUpdateCallLogs}
        learners={learners}
        leads={leads}
        adminName={adminUser.name}
        onShowToast={onShowToast}
        theme={theme}
      />
    )}

    {consoleTab === 'leads' && (
      /* ================= ENQUIRIES & BROCHURE LEADS VIEW ================= */
      <div className="space-y-6">
        {/* Leads Overview Banner */}
        <div className={`p-6 rounded-3xl border shadow-xs transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-white via-sky-50 to-white border-slate-200'
            : 'bg-gradient-to-r from-[#0b1d33] via-[#091b30] to-[#122338] border-sky-800/60 shadow-xl'
        }`}>
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-2 ${
              theme === 'light'
                ? 'bg-amber-50 text-[#b58b42] border-amber-200'
                : 'bg-[#b58b42]/20 text-[#f1bd5b] border-[#b58b42]/40'
            }`}>
              <Mail className="w-3.5 h-3.5" />
              <span>Incoming Leads Desk · Target: info@bncglobal.in</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              Enquiries & Brochure Download Leads
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Real-time directory of candidates who submitted inquiries or downloaded the 10-page BNC Global CIA® Student Brochure.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportLeadsCsv}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV ({leads.length})</span>
            </button>
          </div>
        </div>

        {/* Search Input for Leads */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={leadSearchTerm}
            onChange={(e) => setLeadSearchTerm(e.target.value)}
            placeholder="Search leads by candidate name, email, phone, or program of interest..."
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-xs sm:text-sm transition-all shadow-xs ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                : 'bg-[#091729]/95 border-sky-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b] shadow-md'
            }`}
          />
        </div>

        {/* Leads Table */}
        <div className={`border rounded-3xl overflow-hidden transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-xs'
            : 'bg-[#091729]/95 border-sky-900/60 shadow-xl'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  theme === 'light'
                    ? 'border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-sky-950 bg-slate-900/90 text-slate-400'
                }`}>
                  <th className="py-3.5 pl-5 pr-3">Candidate</th>
                  <th className="py-3.5 px-3">Contact Channels</th>
                  <th className="py-3.5 px-3">Qualification & Program</th>
                  <th className="py-3.5 px-3">Source / Brochure</th>
                  <th className="py-3.5 px-3">Submitted</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${
                theme === 'light' ? 'divide-slate-100' : 'divide-sky-950/60'
              }`}>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-12 text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      No candidate inquiries match the current search.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className={`transition-colors group ${
                      theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
                    }`}>
                      {/* Name */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className={`font-bold transition-colors ${
                          theme === 'light'
                            ? 'text-slate-900 group-hover:text-sky-800'
                            : 'text-white group-hover:text-[#f1bd5b]'
                        }`}>
                          {lead.name}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          theme === 'light'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-sky-950 text-sky-300 border-sky-800/40'
                        }`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3 space-y-1">
                        <div className={`flex items-center gap-1.5 font-mono break-all max-w-[200px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-[#b58b42] transition-colors">
                            {lead.email}
                          </a>
                        </div>
                        <div className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${lead.phone}`} className="hover:text-emerald-700 font-semibold">
                            {lead.phone}
                          </a>
                        </div>
                      </td>

                      {/* Qualification & Program */}
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <div className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>{lead.program || 'All Packages'}</div>
                        <div className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{lead.qualification || "Bachelor's Degree"}</div>
                      </td>

                      {/* Source & Brochure */}
                      <td className="py-3.5 px-3">
                        <div className={`text-[11px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{lead.source}</div>
                        {lead.brochureDownloaded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Brochure Downloaded</span>
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className={`py-3.5 px-3 text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {lead.submittedAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {confirmDeleteLeadId === lead.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteLead(lead.id);
                                  setConfirmDeleteLeadId(null);
                                }}
                                className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteLeadId(null)}
                                className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                                  theme === 'light'
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <a
                                href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${lead.name}, thank you for your enquiry with BNC ELEVATE CIA coaching! CA Gurvinder Pal Singh's admissions desk is reaching out regarding your syllabus and cohort options.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex p-1.5 rounded-lg border transition-colors ${
                                  theme === 'light'
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700/50'
                                }`}
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                              <a
                                href={`mailto:${lead.email}?subject=${encodeURIComponent(`[BNC ELEVATE] CIA Coaching Guidance for ${lead.name}`)}&body=${encodeURIComponent(
                                  `Dear ${lead.name},\n\nThank you for reaching out to BNC ELEVATE.\n\nWe have received your enquiry regarding ${lead.program || 'our CIA Coaching Program'}.\n\nPlease let us know your preferred time for a 1-on-1 counseling call with CA Gurvinder Pal Singh.\n\nWarm regards,\nCA Gurvinder Pal Singh\nDirector & Senior Faculty, BNC Global\ninfo@bncglobal.in | +91 63960 18626`
                                )}`}
                                className={`inline-flex p-1.5 rounded-lg border transition-colors ${
                                  theme === 'light'
                                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                                    : 'bg-sky-950 hover:bg-sky-900 text-sky-300 border-sky-700/50'
                                }`}
                                title="Email Candidate"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleConvertLeadToLearner(lead)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-[#8d6928] border-amber-300'
                                    : 'bg-[#b58b42]/20 hover:bg-[#b58b42]/30 text-[#f1bd5b] border-[#b58b42]/50'
                                }`}
                                title="Convert to Enrolled Learner"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Enroll</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteLeadId(lead.id)}
                                className={`inline-flex p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                                    : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400'
                                }`}
                                title="Delete Lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </main>

      {/* MODAL: Grant New Learner Access */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-xl my-8 border rounded-3xl shadow-2xl overflow-hidden ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#091729] border-sky-800/80 text-slate-100'
            }`}
          >
            <div className="h-1.5 bg-gradient-to-r from-[#102a4e] via-[#b58b42] to-sky-700" />

            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#0b1d33] border-sky-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#102a4e] to-[#b58b42] flex items-center justify-center text-white shadow-md">
                  <UserCheck className="w-5 h-5 text-[#f1bd5b]" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Grant New Learner Access
                  </h3>
                  <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Authorize a student with tuition verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'
                    : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <form onSubmit={handleAddLearner} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {addFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addFormError}</span>
                </div>
              )}
              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#f1bd5b]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#f1bd5b]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Student Access Password *{' '}
                    <span className={`font-normal ${theme === 'light' ? 'text-[#8d6928]' : 'text-amber-400'}`}>
                      (Login key)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. bnc2026"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-[#8d6928] placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-amber-300 placeholder-slate-500 focus:border-[#f1bd5b]'
                    }`}
                  />
                  <p className={`text-[10px] mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Student will sign in using their email and this password.
                  </p>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Enrolled Package *
                  </label>
                  <select
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  >
                    <option>Premium Plus with AI Audit Lab</option>
                    <option>Premium Live Interactive</option>
                    <option>Basic Self-Paced Recorded Prep</option>
                    <option>CA/CPA CIA Challenge Exam Prep</option>
                    <option>IAP Part 1 Student Fast-Track</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Assigned Reference / Order ID{' '}
                  <span className={`font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    (Optional internal tracking)
                  </span>
                </label>
                <input
                  type="text"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="e.g. 2026005"
                  className={`w-full px-3.5 py-2 rounded-xl border font-mono text-xs focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-sky-700 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-sky-300 placeholder-slate-500 focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tuition Fee Status
                  </label>
                  <select
                    value={newFeeStatus}
                    onChange={(e) => setNewFeeStatus(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  >
                    <option>Full Tuition Paid & Verified</option>
                    <option>Installment 1/2 Received (Active)</option>
                    <option>Corporate Sponsorship Cleared</option>
                    <option>Scholarship Approved</option>
                    <option>Pending Verification</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Initial Access Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  >
                    <option value="active">Active (Access Granted Immediately)</option>
                    <option value="pending">Pending Clearance (Awaiting Check)</option>
                    <option value="revoked">Revoked / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Administrative Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bank transfer reference UTR-98234, verified by finance desk"
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl font-semibold cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white font-bold cursor-pointer shadow-sm"
                >
                  Authorize Learner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Learner Details */}
      {editingLearner && (
        <div
          onClick={() => setEditingLearner(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-lg my-8 border rounded-3xl shadow-2xl overflow-hidden ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#091729] border-sky-800/80 text-slate-100'
            }`}
          >
            <div className="h-1.5 bg-gradient-to-r from-[#102a4e] via-[#b58b42] to-sky-700" />

            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#0b1d33] border-sky-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#102a4e] to-[#b58b42] flex items-center justify-center text-white shadow-md">
                  <Edit3 className="w-4 h-4 text-[#f1bd5b]" />
                </div>
                <h3 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Edit Learner Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLearner(null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'
                    : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLearner.name}
                    onChange={(e) => setEditingLearner({ ...editingLearner, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingLearner.email}
                    onChange={(e) => setEditingLearner({ ...editingLearner, email: e.target.value.toLowerCase() })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Student Access Password <span className="text-[#b58b42]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingLearner.password || 'bnc2026'}
                  onChange={(e) =>
                    setEditingLearner({ ...editingLearner, password: e.target.value })
                  }
                  placeholder="e.g. bnc2026"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-[#8d6928] focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-amber-300 focus:border-[#f1bd5b]'
                  }`}
                />
                <p className={`text-[10px] mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Admin-managed access password. Student uses their email and this password to sign in.
                </p>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Enrolled Package
                </label>
                <select
                  value={editingLearner.packageName}
                  onChange={(e) =>
                    setEditingLearner({ ...editingLearner, packageName: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                  }`}
                >
                  <option>Premium Plus with AI Audit Lab</option>
                  <option>Premium Live Interactive</option>
                  <option>Basic Self-Paced Recorded Prep</option>
                  <option>CA/CPA CIA Challenge Exam Prep</option>
                  <option>IAP Part 1 Student Fast-Track</option>
                </select>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Tuition Fee Status
                </label>
                <input
                  type="text"
                  value={editingLearner.feeStatus}
                  onChange={(e) =>
                    setEditingLearner({ ...editingLearner, feeStatus: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  LMS Access Status
                </label>
                <select
                  value={editingLearner.status}
                  onChange={(e) =>
                    setEditingLearner({
                      ...editingLearner,
                      status: e.target.value as 'active' | 'revoked' | 'pending'
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                  }`}
                >
                  <option value="active">Active (Access Granted)</option>
                  <option value="revoked">Revoked (Access Blocked)</option>
                  <option value="pending">Pending Clearance</option>
                </select>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setEditingLearner(null)}
                  className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
