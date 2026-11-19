import React, { useState, useEffect, useMemo } from 'react';
import { EmailTemplate, EnquiryLead } from '../../types';
import {
  Mail,
  X,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Check,
  Send,
  FileText,
  Users,
  Eye,
  BookmarkPlus,
  ExternalLink
} from 'lucide-react';

export const DEFAULT_LEAD_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-cia-overview',
    name: 'CIA Program Overview & Counseling Call',
    category: 'Initial Outreach',
    subject: '[BNC ELEVATE] CIA® Coaching Guidance & 1-on-1 Counseling for {{name}}',
    body: `Dear {{name}},

Thank you for your interest in BNC ELEVATE — the learning arm of BNC Global Consultech.

We received your enquiry regarding {{program}}. Our Certified Internal Auditor (CIA®) Executive Accelerator combines 100+ hours of live weekend coaching, official Gleim CIA study resources & SmartAdapt™ test bank, practical AI audit workflows, and dedicated placement advisory.

I would be happy to schedule a brief 1-on-1 counseling call to review your eligibility, exam timeline, and upcoming batch schedule. Please reply with a convenient time slot or call us directly.

Warm regards,
{{adminName}}
Admissions & Academic Administration
BNC ELEVATE · BNC Global Consultech
info@bncglobal.in | +91 98213 75702`,
    updatedAt: 'Default'
  },
  {
    id: 'tpl-cohort-invite',
    name: 'Upcoming Live Weekend Cohort Invite',
    category: 'Cohort Invite',
    subject: '[BNC ELEVATE] Upcoming CIA® Live Weekend Cohort — Reserve Your Seat',
    body: `Dear {{name}},

We are pleased to invite you to our upcoming BNC ELEVATE Certified Internal Auditor (CIA®) Live Interactive Weekend Cohort aligned with the latest IIA Global Internal Audit Standards.

Program Highlights:
- Live weekend interactive classes with senior Big 4 & industry faculty
- Official Gleim CIA review materials & adaptive SmartAdapt™ MCQ bank
- End-to-end IIA CCMS registration, exam scheduling & placement support
- 18+ months cloud LMS access with HD session recordings

Let us know if you would like to attend an orientation session or speak with our academic team regarding {{program}}.

Warm regards,
{{adminName}}
BNC ELEVATE · BNC Global Consultech
info@bncglobal.in | +91 98213 75702`,
    updatedAt: 'Default'
  },
  {
    id: 'tpl-followup-brochure',
    name: 'Follow-Up After Brochure / Enquiry',
    category: 'Follow-Up',
    subject: 'Following Up on Your CIA® Syllabus & Study Plan — {{name}}',
    body: `Dear {{name}},

Hope you are doing well. I am following up regarding your recent request for {{program}} with BNC ELEVATE.

Have you had a chance to review the CIA® 3-part syllabus and eligibility pathways? Based on your background ({{qualification}}), we can map out a realistic 6–9 month preparation schedule tailored around your work commitments.

Simply reply to this email or reach us on WhatsApp / phone at +91 98213 75702 and we will arrange a quick call at your convenience.

Warm regards,
{{adminName}}
BNC ELEVATE · BNC Global Consultech
info@bncglobal.in | +91 98213 75702`,
    updatedAt: 'Default'
  },
  {
    id: 'tpl-iia-offer',
    name: 'IIA 20% Exam Booking Offer Reminder',
    category: 'Offer & Reminder',
    subject: '[Reminder] Save 20% on IIA CIA® Exam Bookings — Plan Your Attempt',
    body: `Dear {{name}},

A quick update for your Certified Internal Auditor (CIA®) planning: candidates can currently avail a 20% savings on IIA exam bookings through March 2027.

If you are planning to appear for Part 1 or start your complete 3-part CIA® journey ({{program}}), our team can guide you through IIA membership registration, CCMS documentation, and batch onboarding smoothly.

Reply here or call +91 98213 75702 so we can assist you with the next steps.

Warm regards,
{{adminName}}
BNC ELEVATE · BNC Global Consultech
info@bncglobal.in | +91 98213 75702`,
    updatedAt: 'Default'
  }
];

interface LeadEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipients: EnquiryLead[];
  allLeads: EnquiryLead[];
  templates: EmailTemplate[];
  onUpdateTemplates: (updated: EmailTemplate[]) => void;
  adminName: string;
  initialViewMode?: 'compose' | 'new-template';
  onMarkLeadsContacted: (leadIds: string[]) => void;
  onShowToast: (msg: string) => void;
  theme?: 'light' | 'dark';
}

const TEMPLATE_VARIABLES = [
  { token: '{{name}}', label: 'Candidate Name' },
  { token: '{{program}}', label: 'Program' },
  { token: '{{qualification}}', label: 'Qualification' },
  { token: '{{source}}', label: 'Lead Source' },
  { token: '{{adminName}}', label: 'Admin Name' }
];

const TEMPLATE_CATEGORIES = [
  'Initial Outreach',
  'Cohort Invite',
  'Follow-Up',
  'Offer & Reminder',
  'Brochure & Syllabus',
  'Custom'
];

export const LeadEmailModal: React.FC<LeadEmailModalProps> = ({
  isOpen,
  onClose,
  initialRecipients,
  allLeads,
  templates,
  onUpdateTemplates,
  adminName,
  initialViewMode = 'compose',
  onMarkLeadsContacted,
  onShowToast,
  theme = 'light'
}) => {
  const [recipients, setRecipients] = useState<EnquiryLead[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Template management state
  const [mode, setMode] = useState<'compose' | 'template-editor'>('compose');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplCategory, setTplCategory] = useState('Initial Outreach');
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplError, setTplError] = useState<string | null>(null);
  const [confirmDeleteTplId, setConfirmDeleteTplId] = useState<string | null>(null);

  // Quick "Save current email as template" inline form
  const [showSaveAsTpl, setShowSaveAsTpl] = useState(false);
  const [quickTplName, setQuickTplName] = useState('');
  const [quickTplCategory, setQuickTplCategory] = useState('Custom');

  const resolveVariables = (text: string, lead?: EnquiryLead): string => {
    const candidateName = lead?.name?.trim() || 'Candidate';
    const program = lead?.program?.trim() || 'our CIA® Executive Accelerator Program';
    const qualification = lead?.qualification?.trim() || 'your professional background';
    const source = lead?.source?.trim() || 'BNC ELEVATE';
    return text
      .replace(/\{\{name\}\}/g, candidateName)
      .replace(/\{\{program\}\}/g, program)
      .replace(/\{\{qualification\}\}/g, qualification)
      .replace(/\{\{source\}\}/g, source)
      .replace(/\{\{adminName\}\}/g, adminName || 'Neha Srivastava');
  };

  useEffect(() => {
    if (!isOpen) return;
    setRecipients(initialRecipients);
    setShowPreview(false);
    setCopied(false);
    setShowSaveAsTpl(false);
    setConfirmDeleteTplId(null);
    setTplError(null);

    if (initialViewMode === 'new-template') {
      setMode('template-editor');
      setEditingTemplateId(null);
      setTplName('');
      setTplCategory('Initial Outreach');
      setTplSubject('');
      setTplBody('');
    } else {
      setMode('compose');
      const firstTpl = templates[0];
      if (firstTpl) {
        setSelectedTemplateId(firstTpl.id);
        if (initialRecipients.length === 1) {
          setSubject(resolveVariables(firstTpl.subject, initialRecipients[0]));
          setBody(resolveVariables(firstTpl.body, initialRecipients[0]));
        } else {
          setSubject(firstTpl.subject);
          setBody(firstTpl.body);
        }
      } else {
        setSelectedTemplateId('');
        setSubject('[BNC ELEVATE] CIA® Coaching Guidance');
        setBody('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialRecipients, initialViewMode]);

  const validRecipients = useMemo(
    () =>
      recipients.filter(
        (r) =>
          r.email &&
          r.email.includes('@') &&
          r.email.trim().toLowerCase() !== 'no-email@campaign.local'
      ),
    [recipients]
  );

  const availableLeadsToAdd = useMemo(() => {
    const selectedSet = new Set(recipients.map((r) => r.id));
    return allLeads.filter(
      (l) =>
        !selectedSet.has(l.id) &&
        l.email &&
        l.email.includes('@') &&
        l.email.trim().toLowerCase() !== 'no-email@campaign.local'
    );
  }, [allLeads, recipients]);

  if (!isOpen) return null;

  const isSingleRecipient = validRecipients.length === 1;
  const previewLead = validRecipients[0] || recipients[0];
  const resolvedSubject = isSingleRecipient
    ? resolveVariables(subject, validRecipients[0])
    : resolveVariables(subject, {
        id: 'bulk',
        name: 'Candidate',
        email: '',
        phone: '',
        program: 'our CIA® Coaching Program',
        qualification: 'your professional background',
        source: 'BNC ELEVATE',
        status: 'New',
        submittedAt: '',
        brochureDownloaded: false
      });
  const resolvedBody = isSingleRecipient
    ? resolveVariables(body, validRecipients[0])
    : resolveVariables(body, {
        id: 'bulk',
        name: 'Candidate',
        email: '',
        phone: '',
        program: 'our CIA® Coaching Program',
        qualification: 'your professional background',
        source: 'BNC ELEVATE',
        status: 'New',
        submittedAt: '',
        brochureDownloaded: false
      });

  // Build real Gmail Web Compose link (BCC for multiple recipients for candidate privacy)
  const primaryTo = isSingleRecipient ? validRecipients[0].email.trim() : '';
  const bccEmails = validRecipients.length > 1
    ? validRecipients.map((r) => r.email.trim()).join(',')
    : '';

  const gmailHref = (() => {
    const params = new URLSearchParams();
    params.set('view', 'cm');
    params.set('fs', '1');
    if (primaryTo) params.set('to', primaryTo);
    if (bccEmails) params.set('bcc', bccEmails);
    if (resolvedSubject) params.set('su', resolvedSubject);
    if (resolvedBody) params.set('body', resolvedBody);
    return `https://mail.google.com/mail/?${params.toString()}`;
  })();

  const handleApplyTemplate = (tpl: EmailTemplate) => {
    setSelectedTemplateId(tpl.id);
    setMode('compose');
    if (recipients.length === 1) {
      setSubject(resolveVariables(tpl.subject, recipients[0]));
      setBody(resolveVariables(tpl.body, recipients[0]));
    } else {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
    onShowToast(`Applied template "${tpl.name}"`);
  };

  const handleStartNewTemplate = () => {
    setMode('template-editor');
    setEditingTemplateId(null);
    setTplName('');
    setTplCategory('Initial Outreach');
    setTplSubject('[BNC ELEVATE] ');
    setTplBody(
      `Dear {{name}},\n\n\n\nWarm regards,\n{{adminName}}\nBNC ELEVATE · BNC Global Consultech\ninfo@bncglobal.in | +91 98213 75702`
    );
    setTplError(null);
  };

  const handleStartEditTemplate = (tpl: EmailTemplate) => {
    setMode('template-editor');
    setEditingTemplateId(tpl.id);
    setTplName(tpl.name);
    setTplCategory(tpl.category);
    setTplSubject(tpl.subject);
    setTplBody(tpl.body);
    setTplError(null);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tplName.trim();
    const cleanSubject = tplSubject.trim();
    const cleanBody = tplBody.trim();
    if (!cleanName || !cleanSubject || !cleanBody) {
      setTplError('Please enter a template name, subject, and message body.');
      return;
    }

    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (editingTemplateId) {
      const updated = templates.map((t) =>
        t.id === editingTemplateId
          ? {
              ...t,
              name: cleanName,
              category: tplCategory,
              subject: cleanSubject,
              body: cleanBody,
              updatedAt: timestamp
            }
          : t
      );
      onUpdateTemplates(updated);
      if (selectedTemplateId === editingTemplateId) {
        if (recipients.length === 1) {
          setSubject(resolveVariables(cleanSubject, recipients[0]));
          setBody(resolveVariables(cleanBody, recipients[0]));
        } else {
          setSubject(cleanSubject);
          setBody(cleanBody);
        }
      }
      onShowToast(`Updated template "${cleanName}"`);
    } else {
      const created: EmailTemplate = {
        id: `tpl-${Date.now()}`,
        name: cleanName,
        category: tplCategory,
        subject: cleanSubject,
        body: cleanBody,
        updatedAt: timestamp
      };
      onUpdateTemplates([created, ...templates]);
      setSelectedTemplateId(created.id);
      if (recipients.length === 1) {
        setSubject(resolveVariables(created.subject, recipients[0]));
        setBody(resolveVariables(created.body, recipients[0]));
      } else {
        setSubject(created.subject);
        setBody(created.body);
      }
      onShowToast(`Saved new template "${cleanName}"`);
    }

    setMode('compose');
    setEditingTemplateId(null);
    setTplError(null);
  };

  const handleQuickSaveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = quickTplName.trim();
    if (!cleanName || !subject.trim() || !body.trim()) {
      onShowToast('Enter a template name, subject, and body first');
      return;
    }
    const created: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      name: cleanName,
      category: quickTplCategory,
      subject: subject.trim(),
      body: body.trim(),
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    onUpdateTemplates([created, ...templates]);
    setSelectedTemplateId(created.id);
    setShowSaveAsTpl(false);
    setQuickTplName('');
    onShowToast(`Saved "${cleanName}" to Email Templates`);
  };

  const handleDeleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    const updated = templates.filter((t) => t.id !== id);
    onUpdateTemplates(updated);
    if (selectedTemplateId === id) {
      setSelectedTemplateId('');
    }
    setConfirmDeleteTplId(null);
    onShowToast(`Deleted template "${target?.name || 'Template'}"`);
  };

  const handleInsertVariable = (token: string, target: 'compose' | 'template') => {
    if (target === 'compose') {
      setBody((prev) => (prev ? `${prev}${prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' '}${token}` : token));
    } else {
      setTplBody((prev) => (prev ? `${prev}${prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' '}${token}` : token));
    }
  };

  const handleCopyEmail = () => {
    const fullText = `Subject: ${resolvedSubject}\n\n${resolvedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    onShowToast('Copied email subject & message to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatchTracking = (channel: string) => {
    if (validRecipients.length > 0) {
      onMarkLeadsContacted(validRecipients.map((r) => r.id));
    }
    onShowToast(
      `Opened ${channel} for ${validRecipients.length} candidate${validRecipients.length === 1 ? '' : 's'} · Marked as Contacted`
    );
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddRecipient = (leadId: string) => {
    const found = allLeads.find((l) => l.id === leadId);
    if (!found) return;
    setRecipients((prev) => [...prev, found]);
  };

  const isLight = theme === 'light';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col border rounded-xl shadow-2xl overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#071322] border-slate-800 text-slate-100'
        }`}
      >
        {/* Top Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-4 shrink-0 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a1829] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isLight ? 'bg-slate-100 text-[#102a4e]' : 'bg-slate-800 text-[#f1bd5b]'
              }`}
            >
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {mode === 'template-editor'
                  ? editingTemplateId
                    ? 'Edit Email Template'
                    : 'Create Email Template'
                  : 'Send Email to Candidates'}
              </h3>
              <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {mode === 'template-editor'
                  ? 'Save reusable outreach templates with dynamic candidate placeholders.'
                  : 'Pick a template or write a custom message and dispatch directly via Gmail.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`inline-flex p-0.5 rounded-lg border text-xs ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setMode('compose')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'compose'
                    ? 'bg-[#102a4e] text-white'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compose
              </button>
              <button
                type="button"
                onClick={handleStartNewTemplate}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'template-editor'
                    ? 'bg-[#102a4e] text-white'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {editingTemplateId ? 'Edit Template' : 'New Template'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Close email composer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Pane Body: Left Template Library + Right Workspace */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Rail: Saved Templates */}
          <aside
            className={`w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r flex flex-col max-h-56 md:max-h-none ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#081526] border-slate-800'
            }`}
          >
            <div
              className={`px-4 py-3 border-b flex items-center justify-between gap-2 shrink-0 ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#b58b42]" />
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Saved Templates
                </span>
                <span className={`text-xs tabular-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  ({templates.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartNewTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#102a4e] hover:bg-[#163a6b] text-white text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
              >
                <Plus className="w-3 h-3 text-[#f1bd5b]" />
                <span>New</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-800/80">
              {templates.length === 0 ? (
                <div className={`p-5 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  No templates yet. Click <strong>New</strong> to create your first reusable email template.
                </div>
              ) : (
                templates.map((tpl) => {
                  const isActive = mode === 'compose' && selectedTemplateId === tpl.id;
                  const isEditingThis = mode === 'template-editor' && editingTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className={`px-4 py-3 transition-colors ${
                        isActive || isEditingThis
                          ? isLight
                            ? 'bg-sky-50/80'
                            : 'bg-slate-800/70'
                          : isLight
                          ? 'hover:bg-white'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tpl)}
                          className="text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <div
                            className={`text-xs font-bold leading-snug truncate ${
                              isActive
                                ? isLight
                                  ? 'text-[#102a4e]'
                                  : 'text-[#f1bd5b]'
                                : isLight
                                ? 'text-slate-900'
                                : 'text-slate-100'
                            }`}
                          >
                            {tpl.name}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {tpl.category} · {tpl.updatedAt}
                          </div>
                          <div
                            className={`text-[11px] mt-1 line-clamp-1 ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}
                          >
                            {tpl.subject}
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditTemplate(tpl)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isLight
                                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/70'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                            title="Edit Template"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDeleteTplId(confirmDeleteTplId === tpl.id ? null : tpl.id)
                            }
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isLight
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/60'
                            }`}
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {confirmDeleteTplId === tpl.id && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTplId(null)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                              isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Pane: Compose or Template Editor */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {mode === 'template-editor' ? (
              <form onSubmit={handleSaveTemplate} className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                {tplError && (
                  <div
                    className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium ${
                      isLight
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-rose-950/50 border-rose-800 text-rose-200'
                    }`}
                  >
                    {tplError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={tplName}
                      onChange={(e) => setTplName(e.target.value)}
                      placeholder="e.g., Weekend Demo Class Invitation"
                      required
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-none'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-none'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Category
                    </label>
                    <select
                      value={tplCategory}
                      onChange={(e) => setTplCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-none'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-none'
                      }`}
                    >
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Default Email Subject *
                  </label>
                  <input
                    type="text"
                    value={tplSubject}
                    onChange={(e) => setTplSubject(e.target.value)}
                    placeholder="e.g., [BNC ELEVATE] Your CIA® Coaching Plan — {{name}}"
                    required
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-none'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Template Message Body *
                    </label>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className={`text-[11px] mr-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Insert:
                      </span>
                      {TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v.token}
                          type="button"
                          onClick={() => handleInsertVariable(v.token, 'template')}
                          className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title={`Insert ${v.token}`}
                        >
                          + {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={10}
                    value={tplBody}
                    onChange={(e) => setTplBody(e.target.value)}
                    placeholder="Write reusable message copy using {{name}}, {{program}}, {{qualification}}, or {{adminName}}..."
                    required
                    className={`w-full flex-1 px-3.5 py-2.5 rounded-lg border text-xs leading-relaxed resize-y ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-none'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-end gap-2 ${
                    isLight ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMode('compose');
                      setEditingTemplateId(null);
                      setTplError(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {editingTemplateId ? 'Save Template Changes' : 'Save New Template'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                {/* Recipients Area */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <Users className="w-3.5 h-3.5 text-[#b58b42]" />
                      <span>
                        Recipients ({validRecipients.length})
                        {validRecipients.length > 1 && (
                          <span className={`ml-1.5 font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            · Sent via BCC for candidate privacy
                          </span>
                        )}
                      </span>
                    </label>

                    {availableLeadsToAdd.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleAddRecipient(e.target.value);
                        }}
                        className={`px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-700'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        <option value="">+ Add another lead...</option>
                        {availableLeadsToAdd.map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.name} ({lead.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div
                    className={`min-h-[42px] px-3 py-2 rounded-lg border flex flex-wrap items-center gap-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    {recipients.length === 0 ? (
                      <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        No candidate selected. Use "+ Add another lead" above to pick recipients.
                      </span>
                    ) : (
                      recipients.map((rec) => {
                        const isPlaceholderEmail =
                          !rec.email ||
                          !rec.email.includes('@') ||
                          rec.email.trim().toLowerCase() === 'no-email@campaign.local';
                        return (
                          <span
                            key={rec.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${
                              isPlaceholderEmail
                                ? isLight
                                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
                                : isLight
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-slate-800 border-slate-700 text-slate-200'
                            }`}
                          >
                            <span className="font-semibold">{rec.name}</span>
                            <span className="opacity-70 font-mono text-[10px]">
                              {isPlaceholderEmail ? 'No email' : rec.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(rec.id)}
                              className="opacity-60 hover:opacity-100 cursor-pointer"
                              aria-label={`Remove ${rec.name}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Subject
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview((p) => !p)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                        showPreview
                          ? 'text-[#b58b42]'
                          : isLight
                          ? 'text-slate-500 hover:text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showPreview ? 'Back to Editor' : 'Preview Output'}</span>
                    </button>
                  </div>

                  {showPreview ? (
                    <div
                      className={`px-3.5 py-2 rounded-lg border text-xs font-semibold ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    >
                      {resolvedSubject || '(No subject)'}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className={`w-full px-3.5 py-2 rounded-lg border text-xs ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500 focus:outline-none'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-none'
                      }`}
                    />
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {showPreview
                        ? `Rendered Preview${previewLead ? ` (${isSingleRecipient ? previewLead.name : 'Generic Group Greeting'})` : ''}`
                        : 'Message Body'}
                    </label>
                    {!showPreview && (
                      <div className="flex flex-wrap items-center gap-1">
                        {TEMPLATE_VARIABLES.map((v) => (
                          <button
                            key={v.token}
                            type="button"
                            onClick={() => handleInsertVariable(v.token, 'compose')}
                            className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            + {v.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {showPreview ? (
                    <div
                      className={`flex-1 min-h-[210px] px-4 py-3 rounded-lg border text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      {resolvedBody || '(Empty message)'}
                    </div>
                  ) : (
                    <textarea
                      rows={9}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your email message or select a template on the left..."
                      className={`w-full flex-1 min-h-[210px] px-3.5 py-2.5 rounded-lg border text-xs leading-relaxed resize-y ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500 focus:outline-none'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-none'
                      }`}
                    />
                  )}
                </div>

                {/* Inline Save Current Draft as Template */}
                {showSaveAsTpl && (
                  <form
                    onSubmit={handleQuickSaveAsTemplate}
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <input
                      type="text"
                      value={quickTplName}
                      onChange={(e) => setQuickTplName(e.target.value)}
                      placeholder="Template name (e.g., Batch Reminder)..."
                      required
                      className={`flex-1 px-3 py-1.5 rounded-md border text-xs ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:outline-none'
                          : 'bg-slate-950 border-slate-700 text-white focus:outline-none'
                      }`}
                    />
                    <select
                      value={quickTplCategory}
                      onChange={(e) => setQuickTplCategory(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-md border text-xs ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-800'
                          : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      {TEMPLATE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Save Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSaveAsTpl(false)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                        isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Action Footer */}
                <div
                  className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 ${
                    isLight ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSaveAsTpl((s) => !s)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-[#b58b42]" />
                      <span>Save as Template</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {validRecipients.length > 0 ? (
                      <a
                        href={gmailHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleDispatchTracking('Gmail')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5 text-[#f1bd5b]" />
                        <span>
                          Send via Gmail{validRecipients.length > 1 ? ` (${validRecipients.length})` : ''}
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </a>
                    ) : (
                      <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Add at least 1 valid candidate email to send
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
