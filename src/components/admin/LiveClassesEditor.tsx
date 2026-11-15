import React, { useState } from 'react';
import { LiveClassItem } from '../../types';
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';

interface LiveClassesEditorProps {
  liveClasses: LiveClassItem[];
  onUpdateLiveClasses: (updated: LiveClassItem[]) => void;
  onShowToast: (msg: string) => void;
  theme?: 'light' | 'dark';
}

export const LiveClassesEditor: React.FC<LiveClassesEditorProps> = ({
  liveClasses,
  onUpdateLiveClasses,
  onShowToast,
  theme = 'light'
}) => {
  const [editingClass, setEditingClass] = useState<LiveClassItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formInstructor, setFormInstructor] = useState('CA Gurvinder Pal Singh');
  const [formDate, setFormDate] = useState('Saturday, Nov 15, 2026');
  const [formTime, setFormTime] = useState('7:00 PM - 9:30 PM IST');
  const [formMeetingId, setFormMeetingId] = useState('849-2910-3841');
  const [formPasscode, setFormPasscode] = useState('BNC-CIA-LIVE');
  const [formTopics, setFormTopics] = useState('GIAS board oversight\nCharter mandatory clauses\nSpeed MCQ drill');

  const openEditModal = (c: LiveClassItem) => {
    setEditingClass(c);
    setFormTitle(c.title);
    setFormInstructor(c.instructor);
    setFormDate(c.date);
    setFormTime(c.time);
    setFormMeetingId(c.meetingId);
    setFormPasscode(c.passcode);
    setFormTopics(c.topics.join('\n'));
  };

  const openAddModal = () => {
    setEditingClass(null);
    setFormTitle('');
    setFormInstructor('CA Gurvinder Pal Singh');
    setFormDate('Saturday, Nov 15, 2026');
    setFormTime('7:00 PM - 9:30 PM IST');
    setFormMeetingId('892-1049-7721');
    setFormPasscode('BNC-CIA-LIVE');
    setFormTopics('GIAS standard requirements\nSample questions analysis\nLive interactive doubt clearing');
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const updated = liveClasses.map((c) => {
      if (c.id !== editingClass.id) return c;
      return {
        ...c,
        title: formTitle.trim(),
        instructor: formInstructor.trim(),
        date: formDate.trim(),
        time: formTime.trim(),
        meetingId: formMeetingId.trim(),
        passcode: formPasscode.trim(),
        topics: formTopics.split('\n').filter((t) => t.trim().length > 0)
      };
    });

    onUpdateLiveClasses(updated);
    setEditingClass(null);
    onShowToast(`✓ Updated live class schedule: "${formTitle}"`);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please provide class topic title');
      return;
    }

    const newClass: LiveClassItem = {
      id: `live-${Date.now()}`,
      title: formTitle.trim(),
      instructor: formInstructor.trim(),
      date: formDate.trim(),
      time: formTime.trim(),
      meetingId: formMeetingId.trim(),
      passcode: formPasscode.trim(),
      topics: formTopics.split('\n').filter((t) => t.trim().length > 0)
    };

    onUpdateLiveClasses([...liveClasses, newClass]);
    setIsAddModalOpen(false);
    onShowToast(`✓ Scheduled new live masterclass: "${newClass.title}"`);
  };

  const handleDeleteClass = (id: string, title: string) => {
    if (confirm(`Are you sure you want to cancel and remove live class "${title}"?`)) {
      const updated = liveClasses.filter((c) => c.id !== id);
      onUpdateLiveClasses(updated);
      onShowToast(`Removed live class "${title}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-xs transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
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
            <Calendar className="w-3.5 h-3.5" />
            <span>Interactive Cohort Scheduler · Master Faculty</span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Live Weekend Classes & Zoom Links Manager
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Schedule live weekend cohorts, update session times, Zoom credentials, faculty assignments, and core agenda topics. All changes sync to the student LMS schedule in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Live Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveClasses.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
              theme === 'light'
                ? 'bg-white/92 backdrop-blur-md border-slate-200/90 hover:border-slate-300'
                : 'bg-[#091729]/95 border-sky-900/60 shadow-lg hover:border-sky-700'
            }`}
          >
            <div>
              {/* Top status */}
              <div className={`flex items-center justify-between pb-3 border-b ${
                theme === 'light' ? 'border-slate-100' : 'border-sky-950'
              }`}>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  theme === 'light'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Upcoming Live Cohort</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-[#b58b42] text-slate-300 hover:text-white border-slate-700'
                    }`}
                    title="Edit session details"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#b58b42]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(item.id, item.title)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-300'
                        : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border-slate-700'
                    }`}
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Instructor */}
              <h3 className={`text-base font-bold mt-3 leading-snug ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {item.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#b58b42] font-semibold mt-1">
                <User className="w-3.5 h-3.5" />
                <span className={theme === 'light' ? 'text-slate-800 font-bold' : 'text-[#f1bd5b]'}>{item.instructor}</span>
              </div>

              {/* Date & Time */}
              <div className={`mt-3 p-3 rounded-2xl border space-y-1.5 text-xs ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-900/80 border-sky-950 text-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{item.time}</span>
                </div>
              </div>

              {/* Zoom Credentials */}
              <div className={`mt-3 p-3 rounded-2xl border text-xs space-y-1 font-mono ${
                theme === 'light'
                  ? 'bg-slate-50/80 border-slate-200'
                  : 'bg-[#061220] border-sky-950'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Meeting ID:</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-sky-800' : 'text-sky-300'}`}>{item.meetingId}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Passcode:</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-[#b58b42]' : 'text-[#f1bd5b]'}`}>{item.passcode}</span>
                </div>
              </div>

              {/* Topics */}
              <div className="mt-3">
                <div className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Agenda Covered:
                </div>
                <ul className={`space-y-1 text-xs ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {item.topics.map((t, tIdx) => (
                    <li key={tIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openEditModal(item)}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border text-center ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              Modify Session Details
            </button>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(editingClass || isAddModalOpen) && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto ${
          theme === 'light' ? 'bg-slate-900/50' : 'bg-slate-950/85'
        }`}>
          <div className={`relative w-full max-w-xl my-8 border rounded-3xl shadow-2xl overflow-hidden ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#091729] border-sky-800/80 text-slate-100'
          }`}>
            <div className="h-1.5 bg-gradient-to-r from-sky-600 via-[#b58b42] to-amber-500" />

            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1d33] border-sky-950'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center text-white shadow-xs">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {editingClass ? 'Edit Live Masterclass' : 'Schedule New Live Class'}
                  </h3>
                  <div className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Live updates to student calendar and zoom credentials
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingClass(null);
                  setIsAddModalOpen(false);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-300'
                    : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingClass ? handleSaveEdit : handleCreateClass}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Class Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. GIAS Domain III Deep-Dive: Board Governance"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>Date</label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="e.g. Saturday, Nov 8, 2026"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>Time</label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 7:00 PM - 9:30 PM IST"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Meeting ID / Platform URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formMeetingId}
                    onChange={(e) => setFormMeetingId(e.target.value)}
                    placeholder="e.g. 849-2910-3841"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Passcode
                  </label>
                  <input
                    type="text"
                    required
                    value={formPasscode}
                    onChange={(e) => setFormPasscode(e.target.value)}
                    placeholder="BNC-CIA-LIVE"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Master Faculty
                </label>
                <input
                  type="text"
                  required
                  value={formInstructor}
                  onChange={(e) => setFormInstructor(e.target.value)}
                  placeholder="CA Gurvinder Pal Singh"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Topics Covered (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formTopics}
                  onChange={(e) => setFormTopics(e.target.value)}
                  placeholder="Audit Committee interactions&#10;Charter mandatory clauses&#10;Real Big 4 case studies"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className={`pt-3 border-t flex items-center justify-end gap-3 ${
                theme === 'light' ? 'border-slate-200' : 'border-sky-950'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingClass(null);
                    setIsAddModalOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingClass ? 'Save Session Changes' : 'Schedule Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
