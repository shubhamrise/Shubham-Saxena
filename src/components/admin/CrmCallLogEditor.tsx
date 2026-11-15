import React, { useState, useEffect } from 'react';
import { CrmCallLog, ManagedLearner, EnquiryLead } from '../../types';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneCall,
  Clock,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  X,
  Play,
  Square,
  User,
  Sparkles,
  Check
} from 'lucide-react';

interface CrmCallLogEditorProps {
  callLogs: CrmCallLog[];
  onUpdateCallLogs: (updated: CrmCallLog[]) => void;
  learners: ManagedLearner[];
  leads: EnquiryLead[];
  adminName: string;
  onShowToast: (msg: string) => void;
  theme?: 'light' | 'dark';
}

const formatDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const getCurrentLocalDateTimeInput = (): string => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
};

export const CrmCallLogEditor: React.FC<CrmCallLogEditorProps> = ({
  callLogs,
  onUpdateCallLogs,
  learners,
  leads,
  adminName,
  onShowToast,
  theme = 'light'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'outbound' | 'inbound'>('all');
  const [reconnectFilter, setReconnectFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CrmCallLog | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal Form State
  const [formStudentName, setFormStudentName] = useState('');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formEmail, setFormEmail] = useState('');
  const [formDirection, setFormDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [formCallStatus, setFormCallStatus] = useState<CrmCallLog['callStatus']>('Connected');
  const [formCallDateTime, setFormCallDateTime] = useState(getCurrentLocalDateTimeInput);
  const [formMinutes, setFormMinutes] = useState('04');
  const [formSeconds, setFormSeconds] = useState('30');
  const [formInterestLevel, setFormInterestLevel] = useState<CrmCallLog['interestLevel']>('Warm / Follow-up');
  const [formResponseSummary, setFormResponseSummary] = useState('');
  const [formReconnectAgain, setFormReconnectAgain] = useState<boolean>(true);
  const [formNextFollowUp, setFormNextFollowUp] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [formHandledBy, setFormHandledBy] = useState(adminName);

  // Live Call Stopwatch inside modal
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (!isTimerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        const next = prev + 1;
        setFormMinutes(String(Math.floor(next / 60)).padStart(2, '0'));
        setFormSeconds(String(next % 60).padStart(2, '0'));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const openAddModal = () => {
    setEditingLog(null);
    setFormStudentName('');
    setFormPhone('+91 ');
    setFormEmail('');
    setFormDirection('outbound');
    setFormCallStatus('Connected');
    setFormCallDateTime(getCurrentLocalDateTimeInput());
    setFormMinutes('05');
    setFormSeconds('00');
    setFormInterestLevel('Warm / Follow-up');
    setFormResponseSummary('');
    setFormReconnectAgain(true);
    setFormNextFollowUp('');
    setFormFeedback('');
    setFormHandledBy(adminName);
    setIsTimerActive(false);
    setTimerSeconds(0);
    setIsModalOpen(true);
  };

  const openEditModal = (log: CrmCallLog) => {
    setEditingLog(log);
    setFormStudentName(log.studentName);
    setFormPhone(log.phone);
    setFormEmail(log.email || '');
    setFormDirection(log.direction);
    setFormCallStatus(log.callStatus);
    setFormCallDateTime(log.callDateTime.includes('T') ? log.callDateTime.slice(0, 16) : getCurrentLocalDateTimeInput());
    const mins = Math.floor(log.durationSeconds / 60);
    const secs = log.durationSeconds % 60;
    setFormMinutes(String(mins).padStart(2, '0'));
    setFormSeconds(String(secs).padStart(2, '0'));
    setFormInterestLevel(log.interestLevel);
    setFormResponseSummary(log.responseSummary);
    setFormReconnectAgain(log.reconnectAgain);
    setFormNextFollowUp(log.nextFollowUpDate || '');
    setFormFeedback(log.feedback);
    setFormHandledBy(log.handledBy || adminName);
    setIsTimerActive(false);
    setTimerSeconds(log.durationSeconds);
    setIsModalOpen(true);
  };

  const handleQuickPickContact = (contactId: string) => {
    if (!contactId) return;
    if (contactId.startsWith('learner:')) {
      const id = contactId.replace('learner:', '');
      const l = learners.find((item) => item.id === id);
      if (l) {
        setFormStudentName(l.name);
        setFormPhone(l.phone || '+91 ');
        setFormEmail(l.email || '');
        setFormInterestLevel('Support / Existing Student');
      }
    } else if (contactId.startsWith('lead:')) {
      const id = contactId.replace('lead:', '');
      const lead = leads.find((item) => item.id === id);
      if (lead) {
        setFormStudentName(lead.name);
        setFormPhone(lead.phone || '+91 ');
        setFormEmail(lead.email || '');
        setFormInterestLevel('Warm / Follow-up');
      }
    }
  };

  const handleSaveCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim() || !formPhone.trim()) {
      onShowToast('Please provide both Student Name and Phone Number.');
      return;
    }

    setIsTimerActive(false);
    const parsedMins = Math.max(0, parseInt(formMinutes || '0', 10) || 0);
    const parsedSecs = Math.min(59, Math.max(0, parseInt(formSeconds || '0', 10) || 0));
    const totalDuration = parsedMins * 60 + parsedSecs;

    const record: CrmCallLog = {
      id: editingLog ? editingLog.id : `crm-${Date.now()}`,
      studentName: formStudentName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      direction: formDirection,
      callStatus: formCallStatus,
      callDateTime: formCallDateTime || getCurrentLocalDateTimeInput(),
      durationSeconds: totalDuration,
      responseSummary: formResponseSummary.trim() || 'General program discussion',
      interestLevel: formInterestLevel,
      reconnectAgain: formReconnectAgain,
      nextFollowUpDate: formReconnectAgain && formNextFollowUp.trim() ? formNextFollowUp.trim() : undefined,
      feedback: formFeedback.trim() || 'No additional remarks logged.',
      handledBy: formHandledBy.trim() || adminName
    };

    if (editingLog) {
      const updated = callLogs.map((c) => (c.id === editingLog.id ? record : c));
      onUpdateCallLogs(updated);
      onShowToast(`✓ Updated call record for ${record.studentName}`);
    } else {
      onUpdateCallLogs([record, ...callLogs]);
      onShowToast(`✓ Logged ${record.direction} call for ${record.studentName}`);
    }

    setIsModalOpen(false);
    setEditingLog(null);
  };

  const handleToggleReconnect = (id: string) => {
    const updated = callLogs.map((log) => {
      if (log.id !== id) return log;
      return {
        ...log,
        reconnectAgain: !log.reconnectAgain
      };
    });
    onUpdateCallLogs(updated);
    onShowToast('✓ Updated reconnect follow-up status');
  };

  const handleDeleteCallLog = (id: string) => {
    const updated = callLogs.filter((c) => c.id !== id);
    onUpdateCallLogs(updated);
    setConfirmDeleteId(null);
    onShowToast('Removed call log entry from CRM');
  };

  const handleExportCrmCsv = () => {
    try {
      const headers = [
        'Student Name',
        'Phone Number',
        'Email',
        'Direction',
        'Call Status',
        'Date & Time',
        'Duration',
        'Interest Level',
        'Student Response',
        'Reconnect Again',
        'Next Follow-Up',
        'Feedback',
        'Handled By'
      ];
      const rows = callLogs.map((c) => [
        `"${c.studentName.replace(/"/g, '""')}"`,
        `"${c.phone.replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${c.direction === 'outbound' ? 'Outbound (Made)' : 'Inbound (Received)'}"`,
        `"${c.callStatus}"`,
        `"${c.callDateTime}"`,
        `"${formatDuration(c.durationSeconds)}"`,
        `"${c.interestLevel}"`,
        `"${c.responseSummary.replace(/"/g, '""')}"`,
        `"${c.reconnectAgain ? 'Yes' : 'No'}"`,
        `"${c.nextFollowUpDate || ''}"`,
        `"${c.feedback.replace(/"/g, '""')}"`,
        `"${c.handledBy.replace(/"/g, '""')}"`
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BNC_Student_Call_CRM_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('✓ Exported Student CRM call logs to CSV!');
    } catch (e) {
      console.warn('CRM CSV export error', e);
    }
  };

  // Metrics
  const totalCalls = callLogs.length;
  const outboundCount = callLogs.filter((c) => c.direction === 'outbound').length;
  const inboundCount = callLogs.filter((c) => c.direction === 'inbound').length;
  const reconnectPendingCount = callLogs.filter((c) => c.reconnectAgain).length;
  const avgDurationSecs =
    totalCalls > 0
      ? Math.round(callLogs.reduce((sum, c) => sum + (c.durationSeconds || 0), 0) / totalCalls)
      : 0;

  // Filtering
  const filteredLogs = callLogs.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      c.studentName.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      c.responseSummary.toLowerCase().includes(term) ||
      c.feedback.toLowerCase().includes(term) ||
      c.handledBy.toLowerCase().includes(term);

    const matchesDirection =
      directionFilter === 'all' || c.direction === directionFilter;

    const matchesReconnect =
      reconnectFilter === 'all' ||
      (reconnectFilter === 'yes' && c.reconnectAgain) ||
      (reconnectFilter === 'no' && !c.reconnectAgain);

    return matchesSearch && matchesDirection && matchesReconnect;
  });

  const formatReadableDateTime = (dt: string) => {
    try {
      const date = new Date(dt);
      if (isNaN(date.getTime())) return dt;
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dt;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-xs transition-colors ${
          theme === 'light'
            ? 'bg-gradient-to-r from-white via-sky-50 to-white border-slate-200'
            : 'bg-gradient-to-r from-[#0b1d33] via-[#091b30] to-[#122338] border-sky-800/60 shadow-xl'
        }`}
      >
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-2 ${
              theme === 'light'
                ? 'bg-amber-50 text-[#b58b42] border-amber-200'
                : 'bg-[#b58b42]/20 text-[#f1bd5b] border-[#b58b42]/40'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#b58b42]" />
            <span>Student Tele-Counseling & Call Follow-Up CRM</span>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Student Phone Call CRM & Feedback Tracker
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Log every inbound and outbound phone call with students and prospects—track phone numbers, exact call durations, student responses, follow-up reconnect decisions, and counselor feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCrmCsv}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Export CRM CSV ({totalCalls})</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Phone Call</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#091729]/95 border-sky-900/60 shadow-lg text-white'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span>Total Calls Logged</span>
            <Phone className="w-4 h-4 text-sky-600" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            {totalCalls}
          </div>
          <div
            className={`text-[11px] mt-1 ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Complete student call directory
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            theme === 'light'
              ? 'bg-sky-50 border-sky-200'
              : 'bg-sky-950/40 border-sky-500/40 shadow-lg'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase ${
              theme === 'light' ? 'text-sky-800' : 'text-sky-300'
            }`}
          >
            <span>Outbound / Inbound</span>
            <PhoneOutgoing className="w-4 h-4 text-sky-600" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              theme === 'light' ? 'text-sky-800' : 'text-sky-200'
            }`}
          >
            {outboundCount} <span className="text-base font-semibold opacity-60">/</span> {inboundCount}
          </div>
          <div
            className={`text-[11px] mt-1 ${
              theme === 'light' ? 'text-sky-700' : 'text-sky-300/80'
            }`}
          >
            Calls made vs. calls received
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            theme === 'light'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-amber-950/40 border-amber-500/40 shadow-lg'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase ${
              theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]'
            }`}
          >
            <span>Reconnect Required</span>
            <RefreshCw className="w-4 h-4 text-[#b58b42]" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]'
            }`}
          >
            {reconnectPendingCount}
          </div>
          <div
            className={`text-[11px] mt-1 ${
              theme === 'light' ? 'text-amber-800' : 'text-[#f1bd5b]/80'
            }`}
          >
            Marked for follow-up reconnect
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            theme === 'light'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-emerald-950/40 border-emerald-500/40 shadow-lg'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase ${
              theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'
            }`}
          >
            <span>Avg Call Duration</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'
            }`}
          >
            {formatDuration(avgDurationSecs)}
          </div>
          <div
            className={`text-[11px] mt-1 ${
              theme === 'light' ? 'text-emerald-700' : 'text-emerald-300/80'
            }`}
          >
            Across all logged conversations
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200'
            : 'bg-[#091729]/90 border-sky-900/60 shadow-md'
        }`}
      >
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, phone number, response, or feedback..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-all border ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                : 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:border-[#f1bd5b]'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Direction Filter */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold flex items-center gap-1 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Direction:</span>
            </span>
            {(['all', 'outbound', 'inbound'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  directionFilter === dir
                    ? 'bg-gradient-to-r from-[#102a4e] to-[#b58b42] text-white shadow-xs'
                    : theme === 'light'
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>

          {/* Reconnect Filter */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Reconnect:
            </span>
            {([
              { id: 'all', label: 'All' },
              { id: 'yes', label: 'Yes (Follow-Up)' },
              { id: 'no', label: 'No (Closed)' }
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReconnectFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reconnectFilter === opt.id
                    ? 'bg-gradient-to-r from-[#102a4e] to-[#b58b42] text-white shadow-xs'
                    : theme === 'light'
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CRM Call Log Table */}
      <div
        className={`border rounded-3xl overflow-hidden shadow-xs transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200'
            : 'bg-[#091729]/95 border-sky-900/60 shadow-2xl'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-[#061220] border-sky-950 text-slate-400'
                }`}
              >
                <th className="py-4 px-5">Student & Phone</th>
                <th className="py-4 px-5">Call Direction & Duration</th>
                <th className="py-4 px-5">Student Response</th>
                <th className="py-4 px-5 text-center">Reconnect Again?</th>
                <th className="py-4 px-5">Feedback & Counselor Notes</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                theme === 'light'
                  ? 'divide-slate-100 text-slate-700'
                  : 'divide-sky-950/60 text-slate-300'
              }`}
            >
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`py-12 text-center ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    No call logs match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors group align-top ${
                      theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Student & Phone */}
                    <td className="py-4 px-5 min-w-[200px]">
                      <div
                        className={`font-bold text-sm ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {log.studentName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${log.phone}`}
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs hover:underline ${
                            theme === 'light' ? 'text-sky-700' : 'text-sky-300'
                          }`}
                          title="Call Phone Number"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{log.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${log.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1 rounded border text-[10px] font-semibold ${
                            theme === 'light'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60'
                          }`}
                          title="Message on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      </div>
                      {log.email && (
                        <div
                          className={`text-[11px] mt-0.5 truncate max-w-[190px] ${
                            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {log.email}
                        </div>
                      )}
                      <div
                        className={`text-[10px] mt-1 ${
                          theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Handled by: <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>{log.handledBy}</strong>
                      </div>
                    </td>

                    {/* Call Direction & Duration */}
                    <td className="py-4 px-5 min-w-[180px] space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          log.direction === 'outbound'
                            ? theme === 'light'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                            : theme === 'light'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        }`}
                      >
                        {log.direction === 'outbound' ? (
                          <PhoneOutgoing className="w-3 h-3" />
                        ) : (
                          <PhoneIncoming className="w-3 h-3" />
                        )}
                        <span>
                          {log.direction === 'outbound' ? 'Made (Outbound)' : 'Received (Inbound)'}
                        </span>
                      </span>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded border ${
                            theme === 'light'
                              ? 'bg-slate-100 border-slate-200 text-slate-800'
                              : 'bg-slate-900 border-slate-700 text-slate-200'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-[#b58b42]" />
                          {formatDuration(log.durationSeconds)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            log.callStatus === 'Connected'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {log.callStatus}
                        </span>
                      </div>

                      <div
                        className={`text-[10px] ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {formatReadableDateTime(log.callDateTime)}
                      </div>
                    </td>

                    {/* Student Response */}
                    <td className="py-4 px-5 min-w-[210px] max-w-[260px] space-y-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.interestLevel.startsWith('Hot')
                            ? theme === 'light'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                            : log.interestLevel.startsWith('Warm')
                            ? theme === 'light'
                              ? 'bg-amber-50 text-[#8d6928] border-amber-200'
                              : 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                            : log.interestLevel.startsWith('Support')
                            ? theme === 'light'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-sky-950/60 text-sky-300 border-sky-700/50'
                            : theme === 'light'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {log.interestLevel}
                      </span>
                      <p
                        className={`text-xs leading-relaxed ${
                          theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                        }`}
                      >
                        {log.responseSummary}
                      </p>
                    </td>

                    {/* Reconnect Again? */}
                    <td className="py-4 px-5 text-center min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => handleToggleReconnect(log.id)}
                        title="Click to toggle Reconnect status"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          log.reconnectAgain
                            ? theme === 'light'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                            : theme === 'light'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {log.reconnectAgain ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 text-[#b58b42]" />
                            <span>Yes — Reconnect</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>No — Closed</span>
                          </>
                        )}
                      </button>

                      {log.reconnectAgain && log.nextFollowUpDate && (
                        <div
                          className={`mt-1.5 text-[10px] font-semibold flex items-center justify-center gap-1 ${
                            theme === 'light' ? 'text-sky-700' : 'text-sky-300'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{log.nextFollowUpDate}</span>
                        </div>
                      )}
                    </td>

                    {/* Feedback */}
                    <td className="py-4 px-5 min-w-[220px] max-w-[280px]">
                      <div
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          theme === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300'
                        }`}
                      >
                        {log.feedback}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(log)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            theme === 'light'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-transparent'
                          }`}
                          title="Edit call log & feedback"
                        >
                          <Edit3 className="w-4 h-4 text-[#b58b42]" />
                        </button>

                        {confirmDeleteId === log.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteCallLog(log.id)}
                              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer ${
                                theme === 'light'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(log.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              theme === 'light'
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border-slate-200'
                                : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border-transparent'
                            }`}
                            title="Delete call log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* MODAL: Log / Edit Phone Call */}
      {isModalOpen && (
        <div
          onClick={() => {
            setIsTimerActive(false);
            setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-2xl my-8 border rounded-3xl shadow-2xl overflow-hidden ${
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
                  <PhoneCall className="w-5 h-5 text-[#f1bd5b]" />
                </div>
                <div>
                  <h3
                    className={`text-base font-black ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {editingLog ? 'Update Student Call Log' : 'Log New Student Phone Call'}
                  </h3>
                  <p
                    className={`text-[11px] ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Capture call direction, duration, student response, reconnect decision & feedback
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTimerActive(false);
                  setIsModalOpen(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'
                    : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <form onSubmit={handleSaveCallLog} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Quick Pick existing Student / Lead */}
              {!editingLog && (learners.length > 0 || leads.length > 0) && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    theme === 'light'
                      ? 'bg-sky-50 border-sky-200'
                      : 'bg-sky-950/30 border-sky-800/50'
                  }`}
                >
                  <label
                    className={`flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider ${
                      theme === 'light' ? 'text-sky-900' : 'text-sky-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#b58b42]" />
                    <span>Quick Fill from Existing Enrolled Learners or Enquiry Leads (Optional)</span>
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => handleQuickPickContact(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-white border-sky-200 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    <option value="">— Select a student/lead to auto-fill Name & Phone —</option>
                    {learners.length > 0 && (
                      <optgroup label="Enrolled Learners">
                        {learners.map((l) => (
                          <option key={l.id} value={`learner:${l.id}`}>
                            {l.name} ({l.phone || 'No phone'}) — {l.packageName}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {leads.length > 0 && (
                      <optgroup label="Enquiry Leads">
                        {leads.map((lead) => (
                          <option key={lead.id} value={`lead:${lead.id}`}>
                            {lead.name} ({lead.phone}) — {lead.program || 'Inquiry'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              {/* Student Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Student / Prospect Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      placeholder="e.g. Shubham Saxena"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:bg-white'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border font-mono focus:outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:bg-white'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Direction & Status & DateTime */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Call Type *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormDirection('outbound')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        formDirection === 'outbound'
                          ? 'bg-[#102a4e] text-white border-[#102a4e]'
                          : theme === 'light'
                          ? 'bg-slate-50 text-slate-700 border-slate-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      <PhoneOutgoing className="w-3 h-3" />
                      <span>Made</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDirection('inbound')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        formDirection === 'inbound'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : theme === 'light'
                          ? 'bg-slate-50 text-slate-700 border-slate-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      <PhoneIncoming className="w-3 h-3" />
                      <span>Received</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Call Outcome
                  </label>
                  <select
                    value={formCallStatus}
                    onChange={(e) => setFormCallStatus(e.target.value as CrmCallLog['callStatus'])}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  >
                    <option value="Connected">Connected</option>
                    <option value="Callback Requested">Callback Requested</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Busy">Busy</option>
                    <option value="Voicemail">Voicemail</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Call Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formCallDateTime}
                    onChange={(e) => setFormCallDateTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  />
                </div>
              </div>

              {/* Call Duration + Live Stopwatch + Interest Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Call Duration (Minutes : Seconds)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={240}
                      value={formMinutes}
                      onChange={(e) => setFormMinutes(e.target.value)}
                      className={`w-20 px-3 py-2 rounded-xl border font-mono text-center font-bold focus:outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <span className="font-bold">:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={formSeconds}
                      onChange={(e) => setFormSeconds(e.target.value)}
                      className={`w-20 px-3 py-2 rounded-xl border font-mono text-center font-bold focus:outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (isTimerActive) {
                          setIsTimerActive(false);
                        } else {
                          setTimerSeconds(0);
                          setFormMinutes('00');
                          setFormSeconds('00');
                          setIsTimerActive(true);
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isTimerActive
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                          : theme === 'light'
                          ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                          : 'bg-sky-950/70 hover:bg-sky-900 text-sky-300 border-sky-700'
                      }`}
                    >
                      {isTimerActive ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop ({formatDuration(timerSeconds)})</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Live Timer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Interest / Category
                  </label>
                  <select
                    value={formInterestLevel}
                    onChange={(e) =>
                      setFormInterestLevel(e.target.value as CrmCallLog['interestLevel'])
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                    }`}
                  >
                    <option value="Hot / Ready to Enroll">Hot / Ready to Enroll</option>
                    <option value="Warm / Follow-up">Warm / Follow-up</option>
                    <option value="Support / Existing Student">Support / Existing Student</option>
                    <option value="Cold / Not Interested">Cold / Not Interested</option>
                  </select>
                </div>
              </div>

              {/* Student Response Summary */}
              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Student Response Summary *
                </label>
                <input
                  type="text"
                  required
                  value={formResponseSummary}
                  onChange={(e) => setFormResponseSummary(e.target.value)}
                  placeholder="e.g. Asked about Nov 2026 live cohort timings & Challenge Exam eligibility"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:bg-white'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              {/* Reconnect Again or Not + Next Follow-up */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      Whether to Reconnect Again or Not? *
                    </div>
                    <div className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Mark "Yes" if a follow-up call or reminder is needed.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFormReconnectAgain(true)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        formReconnectAgain
                          ? 'bg-[#b58b42] text-white border-[#b58b42] shadow-xs'
                          : theme === 'light'
                          ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Yes, Reconnect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormReconnectAgain(false)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        !formReconnectAgain
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : theme === 'light'
                          ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>No Reconnect Needed</span>
                    </button>
                  </div>
                </div>

                {formReconnectAgain && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className={`block font-semibold mb-1 text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Planned Reconnect Date / Time (Optional)
                      </label>
                      <input
                        type="text"
                        value={formNextFollowUp}
                        onChange={(e) => setFormNextFollowUp(e.target.value)}
                        placeholder="e.g. Nov 18, 4:00 PM IST"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-600'
                            : 'bg-slate-950 border-slate-700 text-white focus:border-[#f1bd5b]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-1 text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Student Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="student@example.com"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-600'
                            : 'bg-slate-950 border-slate-700 text-white focus:border-[#f1bd5b]'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Feedback & Handled By */}
              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Detailed Call Feedback & Action Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formFeedback}
                  onChange={(e) => setFormFeedback(e.target.value)}
                  placeholder="Record student feedback, objections, key discussion points, or promised materials..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none resize-y ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:bg-white'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Logged By / Counselor Name
                </label>
                <input
                  type="text"
                  value={formHandledBy}
                  onChange={(e) => setFormHandledBy(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div
                className={`pt-3 flex items-center justify-end gap-3 border-t ${
                  theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerActive(false);
                    setIsModalOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-semibold cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLog ? 'Save Updated Call Log' : 'Save Call Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
