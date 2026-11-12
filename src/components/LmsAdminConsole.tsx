import React, { useState } from 'react';
import { ManagedLearner, LmsAdminUser, EnquiryLead, LiveClassItem, StudentDoubtItem } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LogOut,
  Sparkles,
  BookOpen,
  Filter,
  X,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  FileSpreadsheet,
  Download,
  ExternalLink,
  MessageSquare,
  User,
  Send,
  Calendar,
  Layers,
  FileText,
  FileQuestion,
  Video,
  Sun,
  Moon
} from 'lucide-react';
import {
  triggerFormSubmitActivation,
  sendTestEnquiryToAdmin,
  getWeb3FormsKey,
  setWeb3FormsKey,
  getFormspreeId,
  setFormspreeId
} from '../services/enquiryService';
import {
  LmsModule,
  LmsMcqQuestion,
  LmsResource,
  LMS_MODULES,
  LMS_TEST_BANK_QUESTIONS,
  LMS_RESOURCES,
  UPCOMING_LIVE_CLASSES
} from '../data/lmsData';
import { CurriculumEditor } from './admin/CurriculumEditor';
import { TestBankEditor } from './admin/TestBankEditor';
import { LiveClassesEditor } from './admin/LiveClassesEditor';
import { ResourcesEditor } from './admin/ResourcesEditor';
import { StudentDoubtsEditor } from './admin/StudentDoubtsEditor';

export type AdminConsoleTab =
  | 'learners'
  | 'curriculum'
  | 'testbank'
  | 'liveclasses'
  | 'resources'
  | 'doubts'
  | 'leads';

interface LmsAdminConsoleProps {
  adminUser: LmsAdminUser;
  learners: ManagedLearner[];
  onUpdateLearners: (updated: ManagedLearner[]) => void;
  onLogoutAdmin: () => void;
  onSwitchToStudentView: (learner?: ManagedLearner) => void;
  onBackToWebsite: () => void;
  onShowToast: (msg: string) => void;
  modules?: LmsModule[];
  onUpdateModules?: (updated: LmsModule[]) => void;
  testBank?: LmsMcqQuestion[];
  onUpdateTestBank?: (updated: LmsMcqQuestion[]) => void;
  liveClasses?: LiveClassItem[];
  onUpdateLiveClasses?: (updated: LiveClassItem[]) => void;
  resources?: LmsResource[];
  onUpdateResources?: (updated: LmsResource[]) => void;
  doubts?: StudentDoubtItem[];
  onUpdateDoubts?: (updated: StudentDoubtItem[]) => void;
}

export const LmsAdminConsole: React.FC<LmsAdminConsoleProps> = ({
  adminUser,
  learners,
  onUpdateLearners,
  onLogoutAdmin,
  onSwitchToStudentView,
  onBackToWebsite,
  onShowToast,
  modules,
  onUpdateModules,
  testBank,
  onUpdateTestBank,
  liveClasses,
  onUpdateLiveClasses,
  resources,
  onUpdateResources,
  doubts,
  onUpdateDoubts,
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

  const [consoleTab, setConsoleTab] = useState<AdminConsoleTab>('learners');
  const [searchTerm, setSearchTerm] = useState('');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<ManagedLearner | null>(null);

  // LMS Data States for Admin Editing
  const [modulesState, setModulesState] = useState<LmsModule[]>(() => {
    if (modules && modules.length > 0) return modules;
    try {
      const saved = localStorage.getItem('bnc_lms_modules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_MODULES;
  });

  const [testBankState, setTestBankState] = useState<LmsMcqQuestion[]>(() => {
    if (testBank && testBank.length > 0) return testBank;
    try {
      const saved = localStorage.getItem('bnc_lms_test_bank');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_TEST_BANK_QUESTIONS;
  });

  const [liveClassesState, setLiveClassesState] = useState<LiveClassItem[]>(() => {
    if (liveClasses && liveClasses.length > 0) return liveClasses;
    try {
      const saved = localStorage.getItem('bnc_lms_live_classes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return UPCOMING_LIVE_CLASSES;
  });

  const [resourcesState, setResourcesState] = useState<LmsResource[]>(() => {
    if (resources && resources.length > 0) return resources;
    try {
      const saved = localStorage.getItem('bnc_lms_resources');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_RESOURCES;
  });

  const [doubtsState, setDoubtsState] = useState<StudentDoubtItem[]>(() => {
    if (doubts && doubts.length > 0) return doubts;
    try {
      const saved = localStorage.getItem('bnc_lms_user_doubts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'd-1',
        question: 'In GIAS Standard 2.1, does consulting on an ERP migration immediately disqualify the team from conducting assurance on the same system later?',
        time: 'Yesterday at 4:15 PM',
        status: 'Answered by CA Gurvinder Pal Singh',
        reply: 'Yes, if the internal audit team designed or implemented operating controls during the migration, independence is impaired for a minimum of 1 year. If advisory was strictly limited to evaluating design without management decision-making, assurance can proceed with disclosure to the Audit Committee.',
        studentName: 'Rohit Verma'
      }
    ];
  });

  // Updaters for Admin
  const handleUpdateModules = (updated: LmsModule[]) => {
    setModulesState(updated);
    try {
      localStorage.setItem('bnc_lms_modules', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    if (onUpdateModules) onUpdateModules(updated);
  };

  const handleUpdateTestBank = (updated: LmsMcqQuestion[]) => {
    setTestBankState(updated);
    try {
      localStorage.setItem('bnc_lms_test_bank', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    if (onUpdateTestBank) onUpdateTestBank(updated);
  };

  const handleUpdateLiveClasses = (updated: LiveClassItem[]) => {
    setLiveClassesState(updated);
    try {
      localStorage.setItem('bnc_lms_live_classes', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    if (onUpdateLiveClasses) onUpdateLiveClasses(updated);
  };

  const handleUpdateResources = (updated: LmsResource[]) => {
    setResourcesState(updated);
    try {
      localStorage.setItem('bnc_lms_resources', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    if (onUpdateResources) onUpdateResources(updated);
  };

  const handleUpdateDoubts = (updated: StudentDoubtItem[]) => {
    setDoubtsState(updated);
    try {
      localStorage.setItem('bnc_lms_user_doubts', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    if (onUpdateDoubts) onUpdateDoubts(updated);
  };

  const totalLessonsCount = modulesState.reduce((acc, m) => acc + m.lessons.length, 0);

  // Email Delivery Integration Settings
  const [web3FormsInput, setWeb3FormsInput] = useState(getWeb3FormsKey);
  const [formspreeInput, setFormspreeInput] = useState(getFormspreeId);
  const [isSavedKeyFeedback, setIsSavedKeyFeedback] = useState(false);

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setWeb3FormsKey(web3FormsInput);
    setFormspreeId(formspreeInput);
    setIsSavedKeyFeedback(true);
    setTimeout(() => setIsSavedKeyFeedback(false), 3000);
    onShowToast('✓ Permanent email integration saved for info@bncglobal.in!');
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
    if (!newName.trim() || !newEmail.trim()) {
      alert('Please provide student name and email.');
      return;
    }

    const assignedOrderId = newOrderId.trim() || String(Date.now()).slice(-7);

    // Check duplicate email
    if (learners.some((l) => l.email.trim().toLowerCase() === newEmail.trim().toLowerCase())) {
      alert(`Student email "${newEmail}" is already registered in the learner roster.`);
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

  // Delete learner
  const handleDeleteLearner = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove learner "${name}" from the LMS database?`)) {
      const updated = learners.filter((l) => l.id !== id);
      onUpdateLearners(updated);
      onShowToast(`Removed ${name} from learner roster.`);
    }
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
      theme === 'light' ? 'bg-[#f8fafc]/50 text-slate-900' : 'bg-[#071322] text-slate-100'
    }`}>
      {/* Background Ambience - Prominently Visible in Light Theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.jpg"
          alt="BNC Architectural Backdrop"
          className={`w-full h-full object-cover object-center filter contrast-125 ${
            theme === 'light' ? 'opacity-45 brightness-100 saturate-125' : 'opacity-30 brightness-75 saturate-110'
          }`}
        />
        {theme === 'light' ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#f8fafc]/55 to-[#f1f5f9]/70" />
            <div className="absolute inset-0 bg-[radial-gradient(#102a4e_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/95 via-[#0b1d33]/90 to-[#06101c]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06]" />
          </>
        )}
      </div>

      {/* Top Admin Header Bar */}
      <header className={`relative z-10 backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs transition-colors ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200'
          : 'bg-[#07172b]/95 border-sky-950 shadow-md'
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
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border w-full overflow-x-auto shadow-xs scrollbar-none transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/90 border-sky-800/80 shadow-xl'
        }`}>
          <button
            type="button"
            onClick={() => setConsoleTab('learners')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'learners'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#b58b42]" />
            <span>Learners & Access ({learners.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setConsoleTab('curriculum')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'curriculum'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Curriculum Lessons ({totalLessonsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setConsoleTab('testbank')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'testbank'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileQuestion className="w-4 h-4 text-[#b58b42]" />
            <span>MCQ Test Banks ({testBankState.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setConsoleTab('liveclasses')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'liveclasses'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Live Masterclasses ({liveClassesState.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setConsoleTab('resources')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'resources'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Study Downloads ({resourcesState.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setConsoleTab('doubts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'doubts'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>Student Doubts ({doubtsState.filter((d) => !d.reply).length} pending)</span>
          </button>

          <button
            type="button"
            onClick={() => setConsoleTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              consoleTab === 'leads'
                ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-4 h-4 text-sky-600" />
            <span>Enquiries & Leads ({leads.length})</span>
          </button>
        </div>

        {consoleTab === 'learners' && (
          <>
            {/* Banner */}
            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-xs transition-colors ${
              theme === 'light'
                ? 'bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 border-slate-200'
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
                  onClick={() => setIsAddModalOpen(true)}
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
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'}`}>
                  <span>Access Granted</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>{activeCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-emerald-700/80' : 'text-emerald-300/80'}`}>Active paid learners authorized</div>
              </div>

              <div className={`p-5 rounded-2xl border shadow-xs ${
                theme === 'light'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-rose-950/40 border-rose-500/40 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-rose-800' : 'text-rose-400'}`}>
                  <span>Access Revoked</span>
                  <UserX className="w-4 h-4 text-rose-600" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>{revokedCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-rose-700/80' : 'text-rose-300/80'}`}>Suspended / fee pending accounts</div>
              </div>

              <div className={`p-5 rounded-2xl border shadow-xs ${
                theme === 'light'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-amber-950/40 border-amber-500/40 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]'}`}>
                  <span>Under Clearance</span>
                  <Clock className="w-4 h-4 text-[#b58b42]" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-2 ${theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]'}`}>{pendingCount}</div>
                <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-amber-800/80' : 'text-[#f1bd5b]/80'}`}>Pending finance approval</div>
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
                      <th className="py-4 px-6">Learner Profile</th>
                      <th className="py-4 px-6">Student Email & Password</th>
                      <th className="py-4 px-6">Program / Package</th>
                      <th className="py-4 px-6">Tuition Fee Clearance</th>
                      <th className="py-4 px-6 text-center">LMS Access Status</th>
                      <th className="py-4 px-6 text-right">Access Controls</th>
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
                              theme === 'light' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/50'
                            }`}
                          >
                            {/* Learner Profile */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#102a4e] to-[#b58b42] flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0">
                                  {learner.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <div className={`font-bold transition-colors ${
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
                            <td className="py-4 px-6">
                              <div className={`font-semibold text-xs ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                {learner.email}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Pass:</span>
                                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
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
                                  className={`text-[10px] font-semibold underline cursor-pointer ml-1 ${
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
                            <td className="py-4 px-6">
                              <div className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{learner.packageName}</div>
                              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{learner.accessDuration}</div>
                            </td>

                            {/* Fee Status */}
                            <td className="py-4 px-6">
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
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : isPending ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                )}
                                <span>{learner.feeStatus}</span>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-6 text-center">
                              {isActive ? (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                                  theme === 'light'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active Access</span>
                                </span>
                              ) : isRevoked ? (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                                  theme === 'light'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}>
                                  <UserX className="w-3 h-3 text-rose-600" />
                                  <span>Access Revoked</span>
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
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
                            <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                              {/* Toggle Grant / Revoke */}
                              <button
                                type="button"
                                onClick={() => handleToggleAccess(learner.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
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

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteLearner(learner.id, learner.name)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border-slate-200'
                                    : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border-transparent'
                                }`}
                                title="Remove from roster"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

    {consoleTab === 'curriculum' && (
      <CurriculumEditor
        modules={modulesState}
        onUpdateModules={handleUpdateModules}
        onShowToast={onShowToast}
      />
    )}

    {consoleTab === 'testbank' && (
      <TestBankEditor
        questions={testBankState}
        onUpdateQuestions={handleUpdateTestBank}
        onShowToast={onShowToast}
      />
    )}

    {consoleTab === 'liveclasses' && (
      <LiveClassesEditor
        liveClasses={liveClassesState}
        onUpdateLiveClasses={handleUpdateLiveClasses}
        onShowToast={onShowToast}
      />
    )}

    {consoleTab === 'resources' && (
      <ResourcesEditor
        resources={resourcesState}
        onUpdateResources={handleUpdateResources}
        onShowToast={onShowToast}
      />
    )}

    {consoleTab === 'doubts' && (
      <StudentDoubtsEditor
        doubts={doubtsState}
        onUpdateDoubts={handleUpdateDoubts}
        onShowToast={onShowToast}
      />
    )}

    {consoleTab === 'leads' && (
      /* ================= ENQUIRIES & BROCHURE LEADS VIEW ================= */
      <div className="space-y-6">
        {/* Leads Overview Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b1d33] via-[#091b30] to-[#122338] border border-sky-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b58b42]/20 text-[#f1bd5b] border border-[#b58b42]/40 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Incoming Leads Desk · Target: info@bncglobal.in</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Enquiries & Brochure Download Leads
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time directory of candidates who submitted inquiries or downloaded the 10-page BNC Global CIA® Student Brochure.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportLeadsCsv}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV ({leads.length})</span>
            </button>
          </div>
        </div>

        {/* Permanent Form Activation & Multi-Provider Hub for info@bncglobal.in */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071a30] via-[#0b2342] to-[#102c4e] border-2 border-[#b58b42]/80 shadow-2xl space-y-6">
          {/* Outage Diagnosis Banner for FormSubmit 522 */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-200">
                  Third-Party FormSubmit Outage Detected (Cloudflare Error 522)
                </div>
                <div className="text-amber-100/80 text-[11px] mt-0.5 leading-relaxed">
                  As shown in your browser, <strong>formsubmit.co's host servers are currently offline</strong> (Error 522 Connection Timed Out). To ensure you receive leads without relying on third-party server outages, you can activate our permanent <strong>Web3Forms</strong> integration below or use the 1-click mail links!
                </div>
              </div>
            </div>
            <a
              href="https://web3forms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#b58b42] text-slate-950 font-bold text-xs shadow-md hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Get Free Web3Forms Key</span>
            </a>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#b58b42] to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
                <Mail className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold uppercase tracking-wider">
                    Permanent Delivery Gateways
                  </span>
                  <span className="text-xs text-sky-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Target Recipient: info@bncglobal.in
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Permanent Email Forwarding Hub
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Connect a free <strong>Web3Forms Access Key</strong> or <strong>Formspree ID</strong> to deliver every candidate enquiry directly to <strong className="text-[#f1bd5b]">info@bncglobal.in</strong> forever with 99.99% uptime.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await sendTestEnquiryToAdmin();
                  onShowToast('✓ Dispatched test inquiry! Check console and inbox.');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md"
                title="Send a sample lead to test delivery"
              >
                <Sparkles className="w-4 h-4 text-[#f1bd5b]" />
                <span>Send Test Lead</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerFormSubmitActivation();
                  onShowToast('Opened FormSubmit activation window in new tab.');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Retry FormSubmit activation link"
              >
                Retry FormSubmit (If online)
              </button>

              <a
                href="mailto:info@bncglobal.in?subject=BNC%20ELEVATE%20Admissions%20Test&body=Admissions%20dispatch%20test"
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
              >
                Open Mail App
              </a>
            </div>
          </div>

          {/* Web3Forms & Formspree Configuration Card */}
          <form
            onSubmit={handleSaveEmailConfig}
            className="p-5 rounded-2xl bg-slate-950/80 border border-sky-900/80 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Permanent Free Access Keys (Zero Outages)</span>
                  {web3FormsInput ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      Web3Forms Active ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#f1bd5b] text-[10px] font-bold border border-amber-500/40">
                      Setup Recommended
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Web3Forms emails the key instantly to info@bncglobal.in and forwards submissions without Cloudflare errors.
                </div>
              </div>

              <a
                href="https://web3forms.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#f1bd5b] hover:text-amber-300 underline font-semibold flex items-center gap-1"
              >
                <span>Get Free Key at Web3Forms</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Web3Forms Access Key (Recommended)
                </label>
                <input
                  type="text"
                  value={web3FormsInput}
                  onChange={(e) => setWeb3FormsInput(e.target.value)}
                  placeholder="e.g. 1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#f1bd5b] transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter info@bncglobal.in at web3forms.com to receive your permanent free access key.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Formspree Form ID (Optional Backup)
                </label>
                <input
                  type="text"
                  value={formspreeInput}
                  onChange={(e) => setFormspreeInput(e.target.value)}
                  placeholder="e.g. xpzgvykl"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#f1bd5b] transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Optional Formspree endpoint ID from formspree.io.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-400 font-medium">
                {isSavedKeyFeedback && '✓ Configuration saved to browser storage! Ready for dispatch.'}
              </span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Email Gateway Key</span>
              </button>
            </div>
          </form>
        </div>


        {/* Search Input for Leads */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={leadSearchTerm}
            onChange={(e) => setLeadSearchTerm(e.target.value)}
            placeholder="Search leads by candidate name, email, phone, or program of interest..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#091729]/95 border border-sky-900/60 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#f1bd5b] transition-all shadow-md"
          />
        </div>

        {/* Leads Table */}
        <div className="bg-[#091729]/95 border border-sky-900/60 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-950 bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6">Contact Channels</th>
                  <th className="py-3.5 px-6">Qualification & Program</th>
                  <th className="py-3.5 px-6">Source / Brochure</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-950/60 text-xs">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No candidate inquiries match the current search.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-900/50 transition-colors group">
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white group-hover:text-[#f1bd5b] transition-colors">
                          {lead.name}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800/40">
                          {lead.status}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                          <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-[#f1bd5b] transition-colors">
                            {lead.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <a href={`tel:${lead.phone}`} className="hover:text-emerald-300 font-semibold">
                            {lead.phone}
                          </a>
                        </div>
                      </td>

                      {/* Qualification & Program */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{lead.program || 'All Packages'}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{lead.qualification || "Bachelor's Degree"}</div>
                      </td>

                      {/* Source & Brochure */}
                      <td className="py-4 px-6">
                        <div className="text-slate-300 text-[11px]">{lead.source}</div>
                        {lead.brochureDownloaded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Brochure Downloaded</span>
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-6 text-slate-400 text-[11px]">
                        {lead.submittedAt}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <a
                          href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${lead.name}, thank you for your enquiry with BNC ELEVATE CIA coaching! CA Gurvinder Pal Singh's admissions desk is reaching out regarding your syllabus and cohort options.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(`[BNC ELEVATE] CIA Coaching Guidance for ${lead.name}`)}&body=${encodeURIComponent(
                            `Dear ${lead.name},\n\nThank you for reaching out to BNC ELEVATE.\n\nWe have received your enquiry regarding ${lead.program || 'our CIA Coaching Program'}.\n\nPlease let us know your preferred time for a 1-on-1 counseling call with CA Gurvinder Pal Singh.\n\nWarm regards,\nCA Gurvinder Pal Singh\nDirector & Senior Faculty, BNC Global\ninfo@bncglobal.in | +91 63960 18626`
                          )}`}
                          className="inline-flex p-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/50 transition-colors"
                          title="Email Candidate"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleConvertLeadToLearner(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#b58b42]/20 hover:bg-[#b58b42]/30 text-[#f1bd5b] border border-[#b58b42]/50 text-xs font-bold transition-colors cursor-pointer"
                          title="Convert to Enrolled Learner"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Enroll</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl my-8 bg-[#091729] border border-sky-800/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="h-1.5 bg-gradient-to-r from-sky-600 via-[#f1bd5b] to-sky-700" />

            <div className="flex items-center justify-between px-6 py-4 bg-[#0b1d33] border-b border-sky-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center text-white shadow-md">
                  <UserCheck className="w-5 h-5 text-[#f1bd5b]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Grant New Learner Access</h3>
                  <p className="text-[11px] text-slate-400">
                    Authorize a student with tuition verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <form onSubmit={handleAddLearner} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Student Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Student Access Password * <span className="text-amber-400 font-normal">(Login key)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. bnc2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Student will sign in using their email and this password.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Enrolled Package *</label>
                  <select
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#f1bd5b]"
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
                <label className="block font-semibold text-slate-300 mb-1">
                  Assigned Reference / Order ID <span className="text-slate-400 font-normal">(Optional internal tracking)</span>
                </label>
                <input
                  type="text"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="e.g. 2026005"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tuition Fee Status</label>
                  <select
                    value={newFeeStatus}
                    onChange={(e) => setNewFeeStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#f1bd5b]"
                  >
                    <option>Full Tuition Paid & Verified</option>
                    <option>Installment 1/2 Received (Active)</option>
                    <option>Corporate Sponsorship Cleared</option>
                    <option>Scholarship Approved</option>
                    <option>Pending Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Initial Access Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#f1bd5b]"
                  >
                    <option value="active">Active (Access Granted Immediately)</option>
                    <option value="pending">Pending Clearance (Awaiting Check)</option>
                    <option value="revoked">Revoked / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Administrative Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bank transfer reference UTR-98234, verified by finance desk"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold cursor-pointer shadow-md"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg my-8 bg-[#091729] border border-sky-800/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="h-1.5 bg-gradient-to-r from-sky-600 via-[#f1bd5b] to-sky-700" />

            <div className="flex items-center justify-between px-6 py-4 bg-[#0b1d33] border-b border-sky-950">
              <h3 className="text-base font-black text-white">Edit Learner Profile</h3>
              <button
                type="button"
                onClick={() => setEditingLearner(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={editingLearner.name}
                    onChange={(e) => setEditingLearner({ ...editingLearner, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={editingLearner.email}
                    onChange={(e) => setEditingLearner({ ...editingLearner, email: e.target.value.toLowerCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Student Access Password <span className="text-[#f1bd5b]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingLearner.password || 'bnc2026'}
                  onChange={(e) =>
                    setEditingLearner({ ...editingLearner, password: e.target.value })
                  }
                  placeholder="e.g. bnc2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-[#f1bd5b]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Admin-managed access password. Student uses their email and this password to sign in.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Enrolled Package</label>
                <select
                  value={editingLearner.packageName}
                  onChange={(e) =>
                    setEditingLearner({ ...editingLearner, packageName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option>Premium Plus with AI Audit Lab</option>
                  <option>Premium Live Interactive</option>
                  <option>Basic Self-Paced Recorded Prep</option>
                  <option>CA/CPA CIA Challenge Exam Prep</option>
                  <option>IAP Part 1 Student Fast-Track</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tuition Fee Status</label>
                <input
                  type="text"
                  value={editingLearner.feeStatus}
                  onChange={(e) =>
                    setEditingLearner({ ...editingLearner, feeStatus: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">LMS Access Status</label>
                <select
                  value={editingLearner.status}
                  onChange={(e) =>
                    setEditingLearner({
                      ...editingLearner,
                      status: e.target.value as 'active' | 'revoked' | 'pending'
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="active">Active (Access Granted)</option>
                  <option value="revoked">Revoked (Access Blocked)</option>
                  <option value="pending">Pending Clearance</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLearner(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] text-white font-bold cursor-pointer"
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
