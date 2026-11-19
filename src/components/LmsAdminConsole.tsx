import React, { useState } from 'react';
import { ManagedLearner, LmsAdminUser, EnquiryLead, CrmCallLog, CampaignSpreadsheetBatch, EmailTemplate } from '../types';
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
  BookOpen,
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
  Video,
  Users,
  Send,
  FileText
} from 'lucide-react';
import { LmsModule } from '../data/lmsData';
import { CrmCallLogEditor } from './admin/CrmCallLogEditor';
import { CurriculumEditor } from './admin/CurriculumEditor';
import { CampaignFormsEditor } from './admin/CampaignFormsEditor';
import { LeadEmailModal, DEFAULT_LEAD_EMAIL_TEMPLATES } from './admin/LeadEmailModal';

const INITIAL_CRM_CALL_LOGS: CrmCallLog[] = [
  {
    id: 'crm-1',
    studentName: 'Shubham Saxena',
    phone: '+91 98213 75702',
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
    handledBy: 'Neha Srivastava'
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
    handledBy: 'Neha Srivastava'
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
  | 'enquiries'
  | 'leads'
  | 'crm'
  | 'campaigns';

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
  const [enquirySearchTerm, setEnquirySearchTerm] = useState('');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [leadSourceOption, setLeadSourceOption] = useState<'website' | 'campaigns'>('website');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<ManagedLearner | null>(null);
  const [confirmDeleteLearnerId, setConfirmDeleteLearnerId] = useState<string | null>(null);
  const [confirmDeleteEnquiryId, setConfirmDeleteEnquiryId] = useState<string | null>(null);
  const [confirmDeleteLeadId, setConfirmDeleteLeadId] = useState<string | null>(null);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Lead Email Composer & Reusable Templates state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lead_email_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_LEAD_EMAIL_TEMPLATES;
  });
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalRecipients, setEmailModalRecipients] = useState<EnquiryLead[]>([]);
  const [emailModalInitialMode, setEmailModalInitialMode] = useState<'compose' | 'new-template'>('compose');

  const handleUpdateEmailTemplates = (updated: EmailTemplate[]) => {
    setEmailTemplates(updated);
    try {
      localStorage.setItem('bnc_lead_email_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // CRM Phone Call Logs state
  const [crmCallLogs, setCrmCallLogs] = useState<CrmCallLog[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_crm_call_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((log: CrmCallLog) =>
            log.handledBy && log.handledBy.toLowerCase().includes('gurvinder')
              ? { ...log, handledBy: 'Neha Srivastava' }
              : log
          );
        }
      }
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

  // Campaign Google Forms Excel uploads state
  const [campaignBatches, setCampaignBatches] = useState<CampaignSpreadsheetBatch[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_campaign_form_uploads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleUpdateCampaignBatches = (updated: CampaignSpreadsheetBatch[]) => {
    setCampaignBatches(updated);
    try {
      localStorage.setItem('bnc_campaign_form_uploads', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const isCampaignSource = (item: EnquiryLead): boolean =>
    item.id.startsWith('lead-cmp-') || /^Email Campaign/i.test(item.source || '');

  // Website Enquiries ONLY (Hero, Brochure Modal, Faculty Consultation Desk, Website Inquiry forms)
  const [enquiries, setEnquiries] = useState<EnquiryLead[]>(() => {
    try {
      const stored = localStorage.getItem('bnc_all_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: EnquiryLead) => !isCampaignSource(item));
        }
      }
      const hero = JSON.parse(localStorage.getItem('bnc_hero_enquiries') || '[]');
      const brochure = JSON.parse(localStorage.getItem('bnc_brochure_downloads') || '[]');
      const consult = JSON.parse(localStorage.getItem('bnc_inquiries') || '[]');
      const merged: EnquiryLead[] = [];
      hero.forEach((h: any, i: number) => {
        merged.push({
          id: `lead-h-${i}`,
          name: h.enquiryName || 'Enquired Candidate',
          email: h.enquiryEmail || 'candidate@example.com',
          phone: h.enquiryPhone || '+91 98213 75702',
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
          phone: b.phone || '+91 98213 75702',
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
          phone: c.phone || '+91 98213 75702',
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
          phone: '+91 98213 75702',
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

  // Leads Directory ONLY (Email Campaign imports & Leads promoted from Website Enquiries)
  const [leads, setLeads] = useState<EnquiryLead[]>(() => {
    try {
      const savedDir = localStorage.getItem('bnc_leads_directory');
      if (savedDir) return JSON.parse(savedDir);

      // Migrate any previously stored campaign leads out of bnc_all_leads
      const oldAll = JSON.parse(localStorage.getItem('bnc_all_leads') || '[]');
      if (Array.isArray(oldAll)) {
        return oldAll.filter((item: EnquiryLead) => isCampaignSource(item));
      }
      return [];
    } catch {
      return [];
    }
  });

  const handleDeleteEnquiry = (id: string) => {
    const updated = enquiries.filter((e) => e.id !== id);
    setEnquiries(updated);
    try {
      localStorage.setItem('bnc_all_leads', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    onShowToast('Website enquiry removed from log');
  };

  const handleDeleteLead = (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);
    setSelectedLeadIds((prev) => prev.filter((itemId) => itemId !== id));
    try {
      localStorage.setItem('bnc_leads_directory', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    onShowToast('Lead removed from leads directory');
  };

  const handleMarkLeadsContacted = (leadIds: string[]) => {
    if (leadIds.length === 0) return;
    const idSet = new Set(leadIds);
    const updated: EnquiryLead[] = leads.map((l) =>
      idSet.has(l.id) && l.status === 'New' ? { ...l, status: 'Contacted' } : l
    );
    setLeads(updated);
    try {
      localStorage.setItem('bnc_leads_directory', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleOpenEmailForLead = (lead: EnquiryLead) => {
    setEmailModalRecipients([lead]);
    setEmailModalInitialMode('compose');
    setIsEmailModalOpen(true);
  };

  const handleOpenEmailForSelected = (pool: EnquiryLead[]) => {
    const chosen = pool.filter((l) => selectedLeadIds.includes(l.id));
    setEmailModalRecipients(chosen.length > 0 ? chosen : pool.slice(0, 1));
    setEmailModalInitialMode('compose');
    setIsEmailModalOpen(true);
  };

  const handleOpenEmailTemplatesManager = () => {
    setEmailModalRecipients([]);
    setEmailModalInitialMode('new-template');
    setIsEmailModalOpen(true);
  };

  const handleToggleLeadSelection = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddEnquiryToLeads = (enquiry: EnquiryLead) => {
    const emailKey = (enquiry.email || '').trim().toLowerCase();
    const phoneKey = (enquiry.phone || '').replace(/[^0-9]/g, '').slice(-10);
    const alreadyExists = leads.some((l) => {
      const eMatch = emailKey && l.email.trim().toLowerCase() === emailKey;
      const pMatch =
        phoneKey.length >= 8 &&
        (l.phone || '').replace(/[^0-9]/g, '').slice(-10) === phoneKey;
      return eMatch || pMatch;
    });

    if (alreadyExists) {
      onShowToast(`${enquiry.name} is already in Website Leads`);
      return;
    }

    const promotedLead: EnquiryLead = {
      ...enquiry,
      id: `lead-web-${Date.now()}`,
      source: `Website Enquiry · ${enquiry.source}`,
    };
    const updated = [promotedLead, ...leads];
    setLeads(updated);
    try {
      localStorage.setItem('bnc_leads_directory', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    onShowToast(`Added ${enquiry.name} to Website Leads`);
  };

  const handleImportCampaignLeads = (incomingLeads: EnquiryLead[]): number => {
    const existingEmails = new Set(
      leads.map((l) => l.email.trim().toLowerCase()).filter(Boolean)
    );
    const existingPhones = new Set(
      leads
        .map((l) => (l.phone || '').replace(/[^0-9]/g, '').slice(-10))
        .filter((p) => p.length >= 8)
    );

    const freshLeads: EnquiryLead[] = [];
    incomingLeads.forEach((candidate) => {
      const emailKey = candidate.email.trim().toLowerCase();
      const phoneKey = (candidate.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (emailKey && emailKey !== 'no-email@campaign.local' && existingEmails.has(emailKey)) {
        return;
      }
      if (phoneKey.length >= 8 && existingPhones.has(phoneKey)) {
        return;
      }
      if (emailKey) existingEmails.add(emailKey);
      if (phoneKey.length >= 8) existingPhones.add(phoneKey);
      freshLeads.push(candidate);
    });

    if (freshLeads.length > 0) {
      const updated = [...freshLeads, ...leads];
      setLeads(updated);
      try {
        localStorage.setItem('bnc_leads_directory', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
    }
    return freshLeads.length;
  };

  const handleExportEnquiriesCsv = () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Qualification', 'Program', 'Source', 'Brochure Downloaded', 'Submitted At'];
      const rows = enquiries.map((l) => [
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
      link.setAttribute('download', `BNC_Website_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Exported Website Enquiries to CSV successfully!');
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

  // Website Enquiries Filtering
  const filteredEnquiries = enquiries.filter((l) => {
    const term = enquirySearchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term) ||
      (l.program || '').toLowerCase().includes(term) ||
      (l.qualification || '').toLowerCase().includes(term) ||
      l.source.toLowerCase().includes(term)
    );
  });

  // Leads grouped into the two options: Website Enquiries (promoted) vs Email Campaigns
  const emailCampaignLeadsList = leads.filter((l) => isCampaignSource(l));
  const websiteLeadsList = leads.filter((l) => !isCampaignSource(l));

  const isEnquiryInWebsiteLeads = (enquiry: EnquiryLead): boolean => {
    const emailKey = (enquiry.email || '').trim().toLowerCase();
    const phoneKey = (enquiry.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return websiteLeadsList.some((l) => {
      const eMatch = emailKey && l.email.trim().toLowerCase() === emailKey;
      const pMatch =
        phoneKey.length >= 8 &&
        (l.phone || '').replace(/[^0-9]/g, '').slice(-10) === phoneKey;
      return eMatch || pMatch;
    });
  };

  const activeLeadsPool =
    leadSourceOption === 'website' ? websiteLeadsList : emailCampaignLeadsList;

  // Leads Filtering
  const filteredLeads = activeLeadsPool.filter((l) => {
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
          const isPending = ord.paymentStatus === 'Pending Verification';
          const durationMap: Record<string, string> = {
            basic: '18 Months Active Access',
            premium: '18 Months Active Access',
            'premium-live': '18 Months Active Access',
            'premium-plus': '24 Months Extended Access',
            elite: '36 Months + Lifetime Alumni',
          };
          updated.push({
            id: `ord-${ord.orderId}-${Date.now()}`,
            name: ord.studentName || 'Candidate',
            email: emailStr,
            phone: ord.studentPhone || '',
            orderId: orderIdStr,
            packageName: ord.packageName || 'Premium Live Interactive',
            feeStatus: ord.paymentMethod
              ? `${ord.paymentStatus || 'Paid'} · ${ord.paymentMethod}`
              : 'Admissions Desk Enrollment · Confirmed',
            status: isPending ? 'pending' : 'active',
            enrollmentDate: ord.createdAt || 'Recent',
            accessDuration: durationMap[ord.packageId] || '18 Months Active Access',
            notes: ord.transactionId
              ? `Invoice ${ord.invoiceNumber || ord.orderId} · Txn ${ord.transactionId}`
              : 'Synced from checkout enrollment',
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#07111e] text-slate-100'
    }`}>
      {/* Top Admin Header Bar — Full-Width Edge-to-Edge */}
      <header className={`sticky top-0 z-30 border-b px-4 sm:px-6 lg:px-8 py-3 transition-colors ${
        theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-[#07111e] border-slate-800/90'
      }`}>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWebsite}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
              title="Return to Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#b58b42]" />
              <span>Public Website</span>
            </button>

            <div className={`h-5 w-px hidden sm:block ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`} />

            <div className="flex items-center gap-2 whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 text-[#b58b42] shrink-0" />
              <span className={`text-sm font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                BNC ELEVATE
              </span>
              <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-700'}>·</span>
              <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Academic Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium mr-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span>Signed in as</span>
              <strong className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>{adminUser.name}</strong>
            </span>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              type="button"
              onClick={() => onSwitchToStudentView()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="Preview LMS Curriculum as Student"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#f1bd5b]" />
              <span>Student LMS View</span>
            </button>

            <button
              type="button"
              onClick={onLogoutAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                theme === 'light'
                  ? 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-200'
                  : 'bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border-slate-800 hover:border-rose-800'
              }`}
              title="Log out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Split Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Left Sidebar Navigation Rail — Edge-to-Edge */}
        <aside className={`w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r transition-colors ${
          theme === 'light'
            ? 'bg-slate-50/70 border-slate-200'
            : 'bg-[#081526] border-slate-800/90'
        }`}>
          <nav
            aria-label="Admin Console Sections"
            className="flex flex-col gap-1 p-3 lg:sticky lg:top-[57px]"
          >
            {/* 1. Student Call CRM */}
            <button
              type="button"
              onClick={() => setConsoleTab('crm')}
              className={`group w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap ${
                consoleTab === 'crm'
                  ? theme === 'light'
                    ? 'bg-[#102a4e] text-white'
                    : 'bg-sky-950 text-white border border-sky-800/70'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <PhoneCall className={`w-4 h-4 shrink-0 ${
                  consoleTab === 'crm'
                    ? 'text-[#f1bd5b]'
                    : theme === 'light'
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">Student Call CRM</span>
              </span>
              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  consoleTab === 'crm'
                    ? 'text-white/80'
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {crmCallLogs.length}
              </span>
            </button>

            {/* 2. Leads */}
            <button
              type="button"
              onClick={() => setConsoleTab('leads')}
              className={`group w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap ${
                consoleTab === 'leads'
                  ? theme === 'light'
                    ? 'bg-[#102a4e] text-white'
                    : 'bg-sky-950 text-white border border-sky-800/70'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Users className={`w-4 h-4 shrink-0 ${
                  consoleTab === 'leads'
                    ? 'text-[#f1bd5b]'
                    : theme === 'light'
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">Leads</span>
              </span>
              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  consoleTab === 'leads'
                    ? 'text-white/80'
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {websiteLeadsList.length + emailCampaignLeadsList.length}
              </span>
            </button>

            {/* 3. Enquiries (Website Enquiries Only) */}
            <button
              type="button"
              onClick={() => setConsoleTab('enquiries')}
              className={`group w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap ${
                consoleTab === 'enquiries'
                  ? theme === 'light'
                    ? 'bg-[#102a4e] text-white'
                    : 'bg-sky-950 text-white border border-sky-800/70'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Mail className={`w-4 h-4 shrink-0 ${
                  consoleTab === 'enquiries'
                    ? 'text-[#f1bd5b]'
                    : theme === 'light'
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">Enquiries</span>
              </span>
              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  consoleTab === 'enquiries'
                    ? 'text-white/80'
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {enquiries.length}
              </span>
            </button>

            {/* 4. Campaigns (Google Forms Excel Uploads) */}
            <button
              type="button"
              onClick={() => setConsoleTab('campaigns')}
              className={`group w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap ${
                consoleTab === 'campaigns'
                  ? theme === 'light'
                    ? 'bg-[#102a4e] text-white'
                    : 'bg-sky-950 text-white border border-sky-800/70'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className={`w-4 h-4 shrink-0 ${
                  consoleTab === 'campaigns'
                    ? 'text-[#f1bd5b]'
                    : theme === 'light'
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">Campaigns</span>
              </span>
              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  consoleTab === 'campaigns'
                    ? 'text-white/80'
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {campaignBatches.reduce((sum, b) => sum + b.rows.length, 0)}
              </span>
            </button>

            {/* 5. Learners & Access */}
            <button
              type="button"
              onClick={() => setConsoleTab('learners')}
              className={`group w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap ${
                consoleTab === 'learners'
                  ? theme === 'light'
                    ? 'bg-[#102a4e] text-white'
                    : 'bg-sky-950 text-white border border-sky-800/70'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <UserCheck className={`w-4 h-4 shrink-0 ${
                  consoleTab === 'learners'
                    ? 'text-[#f1bd5b]'
                    : theme === 'light'
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">Learners & Access</span>
              </span>
              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  consoleTab === 'learners'
                    ? 'text-white/80'
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {learners.length}
              </span>
            </button>

            {/* 6. Video Uploads */}
            <button
              type="button"
              onClick={() => setConsoleTab('videos')}
              className={`group w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2.5 whitespace-nowrap ${
                consoleTab === 'videos'
                  ? theme === 'light'
                    ? 'bg-[#102a4e] text-white'
                    : 'bg-sky-950 text-white border border-sky-800/70'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Video className={`w-4 h-4 shrink-0 ${
                  consoleTab === 'videos'
                    ? 'text-[#f1bd5b]'
                    : theme === 'light'
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">Video Uploads</span>
              </span>
              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  consoleTab === 'videos'
                    ? 'text-white/80'
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {modules.reduce((acc, m) => acc + m.lessons.length, 0)}
              </span>
            </button>
          </nav>
        </aside>

        {/* Right Full-Width Workspace Content */}
        <div className="flex-1 min-w-0 w-full flex flex-col">

        {consoleTab === 'learners' && (
          <div className="flex-1 flex flex-col">
            {/* Page Header */}
            <div className={`px-6 lg:px-8 py-5 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
            }`}>
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Learner Access &amp; Enrollment
                </h1>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Authorize or revoke student access to video masterclasses, Gleim CIA test banks &amp; SmartAdapt™, and AI audit tools.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncFromCheckout}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer whitespace-nowrap ${
                    theme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  }`}
                  title="Sync latest enrollment orders from checkout"
                >
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                  <span>Sync Web Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAddFormError(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-[#f1bd5b]" />
                  <span>Grant New Learner Access</span>
                </button>
              </div>
            </div>

            {/* Unified Horizontal Metric Strip (No Floating Boxes) */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x border-b ${
              theme === 'light'
                ? 'border-slate-200 divide-slate-200 bg-slate-50/40'
                : 'border-slate-800/90 divide-slate-800/90 bg-[#081526]/60'
            }`}>
              <div className="px-6 lg:px-8 py-4">
                <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Total Learners</span>
                  <BookOpen className="w-4 h-4 text-slate-400" />
                </div>
                <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalCount}</div>
                <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Enrolled candidate accounts</div>
              </div>

              <div className="px-6 lg:px-8 py-4">
                <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Access Granted</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>{activeCount}</div>
                <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Active paid learners</div>
              </div>

              <div className="px-6 lg:px-8 py-4">
                <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Access Revoked</span>
                  <UserX className="w-4 h-4 text-rose-600" />
                </div>
                <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>{revokedCount}</div>
                <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Suspended / fee pending</div>
              </div>

              <div className="px-6 lg:px-8 py-4">
                <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Under Clearance</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-amber-700' : 'text-[#f1bd5b]'}`}>{pendingCount}</div>
                <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Pending finance approval</div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className={`px-6 lg:px-8 py-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
            }`}>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, email, or order ID..."
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none transition-colors border ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                      : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-sky-600'
                  }`}
                />
              </div>

              <div className={`flex items-center gap-1 p-1 rounded-lg ${
                theme === 'light' ? 'bg-slate-100' : 'bg-slate-900 border border-slate-800'
              }`}>
                {(['all', 'active', 'revoked', 'pending'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                      filterStatus === st
                        ? theme === 'light'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'bg-slate-800 text-white'
                        : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Full-Width Roster Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                    theme === 'light'
                      ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                      : 'bg-[#081526] border-slate-800/90 text-slate-400'
                  }`}>
                    <th className="py-3 pl-6 lg:pl-8 pr-3">Learner Profile</th>
                    <th className="py-3 px-3">Student Email &amp; Password</th>
                    <th className="py-3 px-3">Program / Package</th>
                    <th className="py-3 px-3">Tuition Fee Clearance</th>
                    <th className="py-3 px-3 text-center">LMS Access Status</th>
                    <th className="py-3 pl-3 pr-6 lg:pr-8 text-right">Access Controls</th>
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
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
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
        leads={[...enquiries, ...leads]}
        adminName={adminUser.name}
        onShowToast={onShowToast}
        theme={theme}
      />
    )}

    {consoleTab === 'campaigns' && (
      <CampaignFormsEditor
        batches={campaignBatches}
        onUpdateBatches={handleUpdateCampaignBatches}
        existingLeads={leads}
        onImportLeads={handleImportCampaignLeads}
        onShowToast={onShowToast}
        theme={theme}
      />
    )}

    {consoleTab === 'enquiries' && (
      /* ================= WEBSITE ENQUIRIES VIEW (WEBSITE ONLY) ================= */
      <div className="flex-1 flex flex-col">
        {/* Page Header */}
        <div className={`px-6 lg:px-8 py-5 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
        }`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              Website Enquiries &amp; Brochure Requests
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Candidates who submitted website enquiry forms or downloaded the CIA® Student Brochure. Target inbox: info@bncglobal.in.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportEnquiriesCsv}
              className="px-4 py-2 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#f1bd5b]" />
              <span>Export CSV ({enquiries.length})</span>
            </button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className={`px-6 lg:px-8 py-3.5 border-b ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
        }`}>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={enquirySearchTerm}
              onChange={(e) => setEnquirySearchTerm(e.target.value)}
              placeholder="Search website enquiries by name, email, phone, or program..."
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400'
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-600'
              }`}
            />
          </div>
        </div>

        {/* Full-Width Enquiries Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                theme === 'light'
                  ? 'border-slate-200 bg-slate-50/70 text-slate-500'
                  : 'border-slate-800/90 bg-[#081526] text-slate-400'
              }`}>
                <th className="py-3 pl-6 lg:pl-8 pr-3">Candidate</th>
                <th className="py-3 px-3">Contact Channels</th>
                <th className="py-3 px-3">Qualification &amp; Program</th>
                <th className="py-3 px-3">Website Source / Brochure</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 pl-3 pr-6 lg:pr-8 text-right">Actions</th>
              </tr>
            </thead>
              <tbody className={`divide-y text-xs ${
                theme === 'light' ? 'divide-slate-100' : 'divide-sky-950/60'
              }`}>
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-12 text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      No website enquiries match the current search.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className={`transition-colors group ${
                      theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
                    }`}>
                      <td className="py-3.5 pl-5 pr-3">
                        <div className={`font-bold transition-colors ${
                          theme === 'light'
                            ? 'text-slate-900 group-hover:text-sky-800'
                            : 'text-white group-hover:text-[#f1bd5b]'
                        }`}>
                          {enquiry.name}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          theme === 'light'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-sky-950 text-sky-300 border-sky-800/40'
                        }`}>
                          {enquiry.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 space-y-1">
                        <div className={`flex items-center gap-1.5 font-mono break-all max-w-[200px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <a href={`mailto:${enquiry.email}`} className="hover:text-[#b58b42] transition-colors">
                            {enquiry.email}
                          </a>
                        </div>
                        <div className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${enquiry.phone}`} className="hover:text-emerald-700 font-semibold">
                            {enquiry.phone}
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 max-w-[180px]">
                        <div className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>{enquiry.program || 'All Packages'}</div>
                        <div className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{enquiry.qualification || "Bachelor's Degree"}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className={`text-[11px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{enquiry.source}</div>
                        {enquiry.brochureDownloaded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Brochure Downloaded</span>
                          </span>
                        )}
                      </td>

                      <td className={`py-3.5 px-3 text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {enquiry.submittedAt}
                      </td>

                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {confirmDeleteEnquiryId === enquiry.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteEnquiry(enquiry.id);
                                  setConfirmDeleteEnquiryId(null);
                                }}
                                className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEnquiryId(null)}
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
                                href={`https://wa.me/${(enquiry.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${enquiry.name}, thank you for your enquiry with BNC ELEVATE CIA coaching! CA Gurvinder Pal Singh's admissions desk is reaching out regarding your syllabus and cohort options.`
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
                                href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`[BNC ELEVATE] CIA Coaching Guidance for ${enquiry.name}`)}&body=${encodeURIComponent(
                                  `Dear ${enquiry.name},\n\nThank you for reaching out to BNC ELEVATE.\n\nWe have received your enquiry regarding ${enquiry.program || 'our CIA Coaching Program'}.\n\nPlease let us know your preferred time for a 1-on-1 counseling call with CA Gurvinder Pal Singh.\n\nWarm regards,\nCA Gurvinder Pal Singh\nDirector & Senior Faculty, BNC Global\ninfo@bncglobal.in | +91 98213 75702`
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
                              {isEnquiryInWebsiteLeads(enquiry) ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap ${
                                    theme === 'light'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                                  }`}
                                  title="Already added to Website Leads"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>In Website Leads</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddEnquiryToLeads(enquiry)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                    theme === 'light'
                                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                                      : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border-indigo-700/50'
                                  }`}
                                  title="Add this enquiry into Website Leads"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>Add to Website Leads</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleConvertLeadToLearner(enquiry)}
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
                                onClick={() => setConfirmDeleteEnquiryId(enquiry.id)}
                                className={`inline-flex p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                                    : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400'
                                }`}
                                title="Delete Website Enquiry"
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
    )}

    {consoleTab === 'leads' && (
      /* ================= LEADS DIRECTORY VIEW (2 OPTIONS: WEBSITE ENQUIRIES / EMAIL CAMPAIGNS) ================= */
      <div className="flex-1 flex flex-col">
        {/* Page Header + Left-Aligned Bold Source Options */}
        <div className={`px-6 lg:px-8 py-5 border-b flex flex-col md:flex-row items-start md:items-end justify-between gap-4 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
        }`}>
          <div className="flex flex-col items-start gap-4">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                Leads Directory
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Manage qualified prospects separated by Website Enquiries and Email Campaigns.
              </p>
            </div>

            <div className={`inline-flex items-center p-1 rounded-lg border ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setLeadSourceOption('website')}
                className={`px-4 py-2 rounded-md text-xs sm:text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  leadSourceOption === 'website'
                    ? 'bg-[#102a4e] text-white shadow-xs'
                    : theme === 'light'
                    ? 'text-slate-700 hover:text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Mail className={`w-4 h-4 shrink-0 ${leadSourceOption === 'website' ? 'text-[#f1bd5b]' : ''}`} />
                <span>Website Enquiries</span>
                <span className={`font-bold tabular-nums ${leadSourceOption === 'website' ? 'text-white/90' : 'opacity-75'}`}>
                  ({websiteLeadsList.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeadSourceOption('campaigns')}
                className={`px-4 py-2 rounded-md text-xs sm:text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  leadSourceOption === 'campaigns'
                    ? 'bg-[#102a4e] text-white shadow-xs'
                    : theme === 'light'
                    ? 'text-slate-700 hover:text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className={`w-4 h-4 shrink-0 ${leadSourceOption === 'campaigns' ? 'text-[#f1bd5b]' : ''}`} />
                <span>Email Campaigns</span>
                <span className={`font-bold tabular-nums ${leadSourceOption === 'campaigns' ? 'text-white/90' : 'opacity-75'}`}>
                  ({emailCampaignLeadsList.length})
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
            <div className="text-left md:text-right">
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Total Leads
              </div>
              <div className={`text-2xl sm:text-3xl font-bold tabular-nums leading-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {websiteLeadsList.length + emailCampaignLeadsList.length}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEmailTemplatesManager}
                className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
                title="Create and manage reusable candidate email templates"
              >
                <FileText className="w-3.5 h-3.5 text-[#b58b42]" />
                <span>Templates ({emailTemplates.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEmailForSelected(filteredLeads)}
                className="px-3.5 py-2 rounded-lg bg-[#b58b42] hover:bg-[#9e7735] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Compose and send email to selected candidates"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {filteredLeads.filter((l) => selectedLeadIds.includes(l.id)).length > 0
                    ? `Email Selected (${filteredLeads.filter((l) => selectedLeadIds.includes(l.id)).length})`
                    : 'Send Email'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    const headers = ['Name', 'Email', 'Phone', 'Qualification', 'Program', 'Source', 'Submitted At', 'Notes'];
                    const rows = activeLeadsPool.map((l) => [
                      `"${l.name}"`,
                      `"${l.email}"`,
                      `"${l.phone}"`,
                      `"${l.qualification || ''}"`,
                      `"${l.program || ''}"`,
                      `"${l.source}"`,
                      `"${l.submittedAt}"`,
                      `"${(l.notes || '').replace(/"/g, '""')}"`
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute(
                      'download',
                      `BNC_Leads_${leadSourceOption === 'website' ? 'Website_Enquiries' : 'Email_Campaigns'}_${new Date().toISOString().slice(0, 10)}.csv`
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    onShowToast(`Exported ${activeLeadsPool.length} lead(s) to CSV!`);
                  } catch (e) {
                    console.warn('CSV export error', e);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-[#f1bd5b]" />
                <span>Export CSV ({activeLeadsPool.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Input + Bulk Selection Bar for Leads */}
        <div className={`px-6 lg:px-8 py-3.5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
        }`}>
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={leadSearchTerm}
              onChange={(e) => setLeadSearchTerm(e.target.value)}
              placeholder={
                leadSourceOption === 'website'
                  ? 'Search website enquiry leads by name, email, phone, or program...'
                  : 'Search email campaign leads by name, email, phone, or campaign...'
              }
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400'
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-600'
              }`}
            />
          </div>

          {filteredLeads.filter((l) => selectedLeadIds.includes(l.id)).length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`font-semibold tabular-nums ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                {filteredLeads.filter((l) => selectedLeadIds.includes(l.id)).length} candidate(s) selected
              </span>
              <button
                type="button"
                onClick={() => handleOpenEmailForSelected(filteredLeads)}
                className="px-3 py-1.5 rounded-md bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5 text-[#f1bd5b]" />
                <span>Send Email</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLeadIds([])}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Full-Width Leads Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                theme === 'light'
                  ? 'border-slate-200 bg-slate-50/70 text-slate-500'
                  : 'border-slate-800/90 bg-[#081526] text-slate-400'
              }`}>
                <th className="py-3 pl-6 lg:pl-8 pr-2 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all visible leads"
                    checked={
                      filteredLeads.length > 0 &&
                      filteredLeads.every((l) => selectedLeadIds.includes(l.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeadIds(
                          Array.from(new Set([...selectedLeadIds, ...filteredLeads.map((l) => l.id)]))
                        );
                      } else {
                        const visibleSet = new Set(filteredLeads.map((l) => l.id));
                        setSelectedLeadIds((prev) => prev.filter((id) => !visibleSet.has(id)));
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#102a4e] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Candidate</th>
                <th className="py-3 px-3">Contact Channels</th>
                <th className="py-3 px-3">Qualification &amp; Program</th>
                <th className="py-3 px-3">Source / Brochure</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 pl-3 pr-6 lg:pr-8 text-right">Actions</th>
              </tr>
            </thead>
              <tbody className={`divide-y text-xs ${
                theme === 'light' ? 'divide-slate-100' : 'divide-sky-950/60'
              }`}>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`py-12 text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {leadSourceOption === 'campaigns'
                        ? 'No Email Campaign leads synced yet. Upload a Google Forms Excel sheet in the Campaigns tab and add respondents to Leads.'
                        : leadSearchTerm.trim()
                        ? 'No Website Leads match the current search.'
                        : 'No Website Leads added yet. Open the Enquiries tab and click "Add to Website Leads" on any enquiry.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className={`transition-colors group ${
                      selectedLeadIds.includes(lead.id)
                        ? theme === 'light'
                          ? 'bg-sky-50/60'
                          : 'bg-slate-900/80'
                        : theme === 'light'
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-900/50'
                    }`}>
                      {/* Checkbox */}
                      <td className="py-3.5 pl-6 lg:pl-8 pr-2">
                        <input
                          type="checkbox"
                          aria-label={`Select ${lead.name}`}
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={() => handleToggleLeadSelection(lead.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#102a4e] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-3">
                        <div className={`font-bold transition-colors ${
                          theme === 'light'
                            ? 'text-slate-900 group-hover:text-sky-800'
                            : 'text-white group-hover:text-[#f1bd5b]'
                        }`}>
                          {lead.name}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          lead.status === 'Contacted'
                            ? theme === 'light'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                            : theme === 'light'
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
                          <button
                            type="button"
                            onClick={() => handleOpenEmailForLead(lead)}
                            className="text-left hover:text-[#b58b42] transition-colors cursor-pointer"
                            title="Open email composer with templates"
                          >
                            {lead.email}
                          </button>
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
                              <button
                                type="button"
                                onClick={() => handleOpenEmailForLead(lead)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                  theme === 'light'
                                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                                    : 'bg-sky-950 hover:bg-sky-900 text-sky-300 border-sky-700/50'
                                }`}
                                title="Send Email with Templates"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Send Email</span>
                              </button>
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
    )}
        </div>
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

      {/* MODAL: Candidate Email Composer & Reusable Templates */}
      <LeadEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        initialRecipients={emailModalRecipients}
        allLeads={leads}
        templates={emailTemplates}
        onUpdateTemplates={handleUpdateEmailTemplates}
        adminName={adminUser.name}
        initialViewMode={emailModalInitialMode}
        onMarkLeadsContacted={handleMarkLeadsContacted}
        onShowToast={onShowToast}
        theme={theme}
      />
    </div>
  );
};
