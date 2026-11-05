import React, { useState } from 'react';
import { LmsMcqQuestion } from '../../data/lmsData';
import {
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Save,
  Award,
  BookOpen
} from 'lucide-react';

interface TestBankEditorProps {
  questions: LmsMcqQuestion[];
  onUpdateQuestions: (updated: LmsMcqQuestion[]) => void;
  onShowToast: (msg: string) => void;
}

export const TestBankEditor: React.FC<TestBankEditorProps> = ({
  questions,
  onUpdateQuestions,
  onShowToast
}) => {
  const [selectedPart, setSelectedPart] = useState<'all' | 'part-1' | 'part-2' | 'part-3'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<LmsMcqQuestion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [formPartId, setFormPartId] = useState<'part-1' | 'part-2' | 'part-3'>('part-1');
  const [formDomain, setFormDomain] = useState('Domain I: Purpose of Internal Auditing');
  const [formDifficulty, setFormDifficulty] = useState<'Foundation' | 'Moderate' | 'Advanced'>('Moderate');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOption0, setFormOption0] = useState('');
  const [formOption1, setFormOption1] = useState('');
  const [formOption2, setFormOption2] = useState('');
  const [formOption3, setFormOption3] = useState('');
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formRationale, setFormRationale] = useState('');
  const [formStandardRef, setFormStandardRef] = useState('GIAS Standard 1.1 - Internal Audit Charter');

  const openEditModal = (q: LmsMcqQuestion) => {
    setEditingQuestion(q);
    setFormPartId(q.partId);
    setFormDomain(q.domain);
    setFormDifficulty(q.difficulty);
    setFormQuestion(q.question);
    setFormOption0(q.options[0] || '');
    setFormOption1(q.options[1] || '');
    setFormOption2(q.options[2] || '');
    setFormOption3(q.options[3] || '');
    setFormCorrectIndex(q.correctIndex);
    setFormRationale(q.rationale);
    setFormStandardRef(q.iiaStandardReference);
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormPartId(selectedPart === 'all' ? 'part-1' : selectedPart);
    setFormDomain('Domain I: Purpose of Internal Auditing');
    setFormDifficulty('Moderate');
    setFormQuestion('');
    setFormOption0('');
    setFormOption1('');
    setFormOption2('');
    setFormOption3('');
    setFormCorrectIndex(0);
    setFormRationale('Under the Global Internal Audit Standards (GIAS)...');
    setFormStandardRef('GIAS Principle 1');
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const updated = questions.map((q) => {
      if (q.id !== editingQuestion.id) return q;
      return {
        ...q,
        partId: formPartId,
        domain: formDomain.trim(),
        difficulty: formDifficulty,
        question: formQuestion.trim(),
        options: [formOption0.trim(), formOption1.trim(), formOption2.trim(), formOption3.trim()],
        correctIndex: formCorrectIndex,
        rationale: formRationale.trim(),
        iiaStandardReference: formStandardRef.trim()
      };
    });

    onUpdateQuestions(updated);
    setEditingQuestion(null);
    onShowToast('✓ MCQ question updated successfully!');
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formOption0.trim() || !formOption1.trim()) {
      alert('Please provide the question prompt and at least 2 options.');
      return;
    }

    const newQ: LmsMcqQuestion = {
      id: `mcq-${Date.now()}`,
      partId: formPartId,
      domain: formDomain.trim(),
      difficulty: formDifficulty,
      question: formQuestion.trim(),
      options: [formOption0.trim(), formOption1.trim(), formOption2.trim() || 'Option C', formOption3.trim() || 'Option D'],
      correctIndex: formCorrectIndex,
      rationale: formRationale.trim(),
      iiaStandardReference: formStandardRef.trim()
    };

    onUpdateQuestions([newQ, ...questions]);
    setIsAddModalOpen(false);
    onShowToast('✓ Successfully added new practice question to test bank!');
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question from the test bank?')) {
      const updated = questions.filter((q) => q.id !== id);
      onUpdateQuestions(updated);
      onShowToast('Question removed from test bank.');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesPart = selectedPart === 'all' || q.partId === selectedPart;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.question.toLowerCase().includes(term) ||
      q.domain.toLowerCase().includes(term) ||
      q.iiaStandardReference.toLowerCase().includes(term);
    return matchesPart && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b1d33] via-[#091b30] to-[#122338] border border-sky-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b58b42]/20 text-[#f1bd5b] border border-[#b58b42]/40 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>IIA Test Bank Engine · Full Edit Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            MCQ Test Bank & Exam Questions Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Create, edit, or adjust question prompts, 4 answer choices, correct option indicators, rationales, and GIAS standard references. Changes apply instantly to student exam simulation drills.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New MCQ Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#091729]/95 border border-sky-900/60 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Parts (${questions.length})` },
            { id: 'part-1', label: `Part 1 (${questions.filter((q) => q.partId === 'part-1').length})` },
            { id: 'part-2', label: `Part 2 (${questions.filter((q) => q.partId === 'part-2').length})` },
            { id: 'part-3', label: `Part 3 (${questions.filter((q) => q.partId === 'part-3').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPart(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedPart === tab.id
                  ? 'bg-gradient-to-r from-sky-700 to-[#b58b42] text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by scenario, standard, domain..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#f1bd5b] transition-all"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 rounded-3xl bg-[#091729]/80 border border-sky-950">
            No questions found matching your filter criteria.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-[#091729]/95 border border-sky-900/60 shadow-lg space-y-4 hover:border-sky-700/60 transition-colors"
            >
              {/* Question Top Meta */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-sky-950">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-900 text-sky-200 text-xs font-black flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#b58b42]/20 text-[#f1bd5b] border border-[#b58b42]/40 uppercase tracking-wider">
                    {q.partId.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{q.domain}</span>
                  <span className="text-slate-600">•</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#b58b42] text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#f1bd5b]" />
                    <span>Edit MCQ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer border border-slate-700"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {q.question}
              </h4>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctIndex;
                  return (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                          isCorrect
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rationale & Standard Reference */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-sky-950 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-semibold text-[11px]">
                  <span className="text-[#f1bd5b]">Official Rationale:</span>
                  <span>{q.iiaStandardReference}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{q.rationale}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      {(editingQuestion || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-[#091729] border border-sky-800/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="h-1.5 bg-gradient-to-r from-sky-600 via-[#f1bd5b] to-sky-700" />

            <div className="flex items-center justify-between px-6 py-4 bg-[#0b1d33] border-b border-sky-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center text-white shadow-md">
                  <HelpCircle className="w-4 h-4 text-[#f1bd5b]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingQuestion ? 'Edit MCQ Practice Question' : 'Create New MCQ Question'}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Live updates to student test bank drills
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsAddModalOpen(false);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingQuestion ? handleSaveEdit : handleCreateQuestion}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Part</label>
                  <select
                    value={formPartId}
                    onChange={(e) => setFormPartId(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  >
                    <option value="part-1">Part 1 (GIAS)</option>
                    <option value="part-2">Part 2 (Practice)</option>
                    <option value="part-3">Part 3 (Business & IT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  >
                    <option value="Foundation">Foundation</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correct Option
                  </label>
                  <select
                    value={formCorrectIndex}
                    onChange={(e) => setFormCorrectIndex(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-300 font-bold text-xs focus:outline-none"
                  >
                    <option value={0}>Option A (Correct)</option>
                    <option value={1}>Option B (Correct)</option>
                    <option value={2}>Option C (Correct)</option>
                    <option value={3}>Option D (Correct)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Syllabus Domain
                </label>
                <input
                  type="text"
                  required
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  placeholder="e.g. Domain I: Purpose of Internal Auditing"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Question Prompt / Scenario *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Under the newly enacted Global Internal Audit Standards (GIAS), which of the following is strictly required regarding the approval of the internal audit charter?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              {/* Options Inputs */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Multiple Choice Options
                </label>

                {[
                  { label: 'Option A', val: formOption0, setVal: setFormOption0, idx: 0 },
                  { label: 'Option B', val: formOption1, setVal: setFormOption1, idx: 1 },
                  { label: 'Option C', val: formOption2, setVal: setFormOption2, idx: 2 },
                  { label: 'Option D', val: formOption3, setVal: setFormOption3, idx: 3 }
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        formCorrectIndex === item.idx
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + item.idx)}
                    </span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={(e) => item.setVal(e.target.value)}
                      placeholder={`Enter ${item.label}...`}
                      className={`flex-1 px-3 py-2 rounded-xl bg-slate-900 border text-xs focus:outline-none ${
                        formCorrectIndex === item.idx
                          ? 'border-emerald-500 text-emerald-200'
                          : 'border-slate-700 text-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setFormCorrectIndex(item.idx)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        formCorrectIndex === item.idx
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {formCorrectIndex === item.idx ? 'Correct' : 'Mark Correct'}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Rationale / Explanation *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formRationale}
                  onChange={(e) => setFormRationale(e.target.value)}
                  placeholder="Explain why the selected option is correct and why other options are distractors..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  IIA Standard / GTAG Reference
                </label>
                <input
                  type="text"
                  value={formStandardRef}
                  onChange={(e) => setFormStandardRef(e.target.value)}
                  placeholder="e.g. GIAS Principle 1 & Domain I Requirement 1.1"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div className="pt-3 border-t border-sky-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestion ? 'Save MCQ Changes' : 'Add MCQ Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
