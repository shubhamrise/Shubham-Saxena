import React, { useState } from 'react';
import { StudentDoubtItem } from '../../types';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Edit3,
  User,
  ShieldCheck,
  Sparkles,
  Filter
} from 'lucide-react';

interface StudentDoubtsEditorProps {
  doubts: StudentDoubtItem[];
  onUpdateDoubts: (updated: StudentDoubtItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const StudentDoubtsEditor: React.FC<StudentDoubtsEditorProps> = ({
  doubts,
  onUpdateDoubts,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleStartReply = (item: StudentDoubtItem) => {
    setActiveReplyId(item.id);
    setReplyText(item.reply || '');
  };

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) {
      alert('Please enter a response.');
      return;
    }

    const updated = doubts.map((d) =>
      d.id === id
        ? {
            ...d,
            reply: replyText.trim(),
            status: 'Answered by CA Gurvinder Pal Singh',
          }
        : d
    );
    onUpdateDoubts(updated);
    onShowToast('✓ Faculty reply published to student LMS portal.');
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this student doubt entry?')) return;
    const updated = doubts.filter((d) => d.id !== id);
    onUpdateDoubts(updated);
    onShowToast('✓ Doubt entry removed.');
  };

  const filtered = doubts.filter((d) => {
    const matchSearch =
      d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.studentName && d.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.reply && d.reply.toLowerCase().includes(searchTerm.toLowerCase()));

    const isAnswered = !!d.reply;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'answered'
        ? isAnswered
        : !isAnswered;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-700" />
            <span>Student Doubts & Faculty Advisory Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Questions asked by active students in their portal. Provide verified technical responses signed by CA Gurvinder Pal Singh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            {doubts.filter((d) => !d.reply).length} Unanswered
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
            {doubts.filter((d) => !!d.reply).length} Answered
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doubt questions or student names..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-600"
          >
            <option value="all">All Queries ({doubts.length})</option>
            <option value="pending">Pending Reply</option>
            <option value="answered">Answered</option>
          </select>
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const hasReply = !!item.reply;
          const isReplying = activeReplyId === item.id;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                hasReply
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-amber-50/40 border-amber-200 shadow-xs ring-1 ring-amber-200/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    {item.studentName || 'Enrolled Student'}
                  </span>
                  <span className="text-[10px] text-slate-400">· {item.time}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      hasReply
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                  >
                    {hasReply ? 'Answered' : 'Awaiting Faculty Response'}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Student Query Text */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-900 font-medium leading-relaxed mb-3">
                "{item.question}"
              </div>

              {/* Faculty Reply Area */}
              {hasReply && !isReplying && (
                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sky-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#b58b42]" />
                      <span>CA Gurvinder Pal Singh (Master Faculty):</span>
                    </div>
                    <button
                      onClick={() => handleStartReply(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 hover:text-sky-950 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Reply</span>
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-5 whitespace-pre-line">
                    {item.reply}
                  </p>
                </div>
              )}

              {/* Reply Input Form */}
              {(!hasReply || isReplying) && (
                <div className="mt-3 p-4 rounded-xl bg-white border border-sky-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#b58b42]" />
                      <span>Draft Response from CA Gurvinder Pal Singh</span>
                    </span>
                    {isReplying && hasReply && (
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="text-slate-500 hover:text-slate-700 font-normal"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={4}
                    value={isReplying ? replyText : ''}
                    onChange={(e) => {
                      if (!isReplying) setActiveReplyId(item.id);
                      setReplyText(e.target.value);
                    }}
                    onFocus={() => {
                      if (!isReplying) {
                        setActiveReplyId(item.id);
                        setReplyText(item.reply || '');
                      }
                    }}
                    placeholder="Type the comprehensive technical explanation citing relevant GIAS Domain and exam rationale..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-600 leading-relaxed"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSaveReply(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] text-white font-bold text-xs cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Verified Answer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No student doubts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
