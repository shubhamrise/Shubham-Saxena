import React, { useState } from 'react';
import { LmsModule, LmsLesson } from '../../data/lmsData';
import {
  Video,
  Plus,
  Edit3,
  Trash2,
  Clock,
  User,
  FileText,
  Search,
  CheckCircle2,
  X,
  Save,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface CurriculumEditorProps {
  modules: LmsModule[];
  onUpdateModules: (updated: LmsModule[]) => void;
  onShowToast: (msg: string) => void;
}

export const CurriculumEditor: React.FC<CurriculumEditorProps> = ({
  modules,
  onUpdateModules,
  onShowToast
}) => {
  const [selectedPart, setSelectedPart] = useState<'all' | 'part-1' | 'part-2' | 'part-3' | 'ai-lab'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLesson, setEditingLesson] = useState<{ lesson: LmsLesson; moduleId: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(modules[0]?.id || 'p1-m1');

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formPartId, setFormPartId] = useState<'part-1' | 'part-2' | 'part-3' | 'ai-lab'>('part-1');
  const [formDuration, setFormDuration] = useState('50 mins');
  const [formInstructor, setFormInstructor] = useState('CA Gurvinder Pal Singh');
  const [formDomain, setFormDomain] = useState('Domain I: Purpose & Mandatory GIAS Foundations');
  const [formDescription, setFormDescription] = useState('');
  const [formTakeaways, setFormTakeaways] = useState('');
  const [formHandoutName, setFormHandoutName] = useState('GIAS_Master_Study_Notes.pdf');
  const [formHandoutSize, setFormHandoutSize] = useState('2.4 MB');

  const openEditModal = (lesson: LmsLesson, moduleId: string) => {
    setEditingLesson({ lesson, moduleId });
    setFormTitle(lesson.title);
    setFormPartId(lesson.partId);
    setFormDuration(lesson.duration);
    setFormInstructor(lesson.instructor);
    setFormDomain(lesson.domain);
    setFormDescription(lesson.description);
    setFormTakeaways(lesson.keyTakeaways.join('\n'));
    setFormHandoutName(lesson.handoutName);
    setFormHandoutSize(lesson.handoutSize);
  };

  const openAddModal = (moduleId?: string) => {
    setTargetModuleId(moduleId || modules[0]?.id || 'p1-m1');
    setFormTitle('');
    setFormPartId(selectedPart === 'all' ? 'part-1' : selectedPart);
    setFormDuration('50 mins');
    setFormInstructor('CA Gurvinder Pal Singh');
    setFormDomain('Domain I: Purpose & Mandatory GIAS Foundations');
    setFormDescription('Comprehensive lecture breakdown covering core GIAS examination requirements.');
    setFormTakeaways('Key standard requirements\nBoard governance interactions\nExam trap analysis');
    setFormHandoutName('BNC_CIA_Lecture_Handout.pdf');
    setFormHandoutSize('2.1 MB');
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    const updatedModules = modules.map((mod) => {
      if (mod.id !== editingLesson.moduleId) return mod;
      return {
        ...mod,
        lessons: mod.lessons.map((l) => {
          if (l.id !== editingLesson.lesson.id) return l;
          return {
            ...l,
            title: formTitle.trim(),
            partId: formPartId,
            duration: formDuration.trim(),
            instructor: formInstructor.trim(),
            domain: formDomain.trim(),
            description: formDescription.trim(),
            keyTakeaways: formTakeaways.split('\n').filter((t) => t.trim().length > 0),
            handoutName: formHandoutName.trim(),
            handoutSize: formHandoutSize.trim()
          };
        })
      };
    });

    onUpdateModules(updatedModules);
    setEditingLesson(null);
    onShowToast(`✓ Updated lesson: "${formTitle}"`);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please provide a lesson title');
      return;
    }

    const newLesson: LmsLesson = {
      id: `lesson-${Date.now()}`,
      partId: formPartId,
      title: formTitle.trim(),
      duration: formDuration.trim(),
      durationMinutes: parseInt(formDuration, 10) || 45,
      instructor: formInstructor.trim(),
      domain: formDomain.trim(),
      description: formDescription.trim(),
      keyTakeaways: formTakeaways.split('\n').filter((t) => t.trim().length > 0),
      handoutName: formHandoutName.trim() || 'BNC_CIA_Study_Handout.pdf',
      handoutSize: formHandoutSize.trim() || '2.0 MB',
      sampleTranscript: 'Welcome to BNC ELEVATE Masterclass lecture...',
      videoPoster: '/hero-bg.jpg'
    };

    const updatedModules = modules.map((mod) => {
      if (mod.id === targetModuleId) {
        return {
          ...mod,
          lessons: [...mod.lessons, newLesson]
        };
      }
      return mod;
    });

    onUpdateModules(updatedModules);
    setIsAddModalOpen(false);
    onShowToast(`✓ Successfully added new lesson: "${newLesson.title}"`);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string, title: string) => {
    if (confirm(`Are you sure you want to remove lesson "${title}" from the curriculum?`)) {
      const updatedModules = modules.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.filter((l) => l.id !== lessonId)
        };
      });
      onUpdateModules(updatedModules);
      onShowToast(`Removed lesson "${title}"`);
    }
  };

  const filteredModules = modules
    .filter((m) => selectedPart === 'all' || m.partId === selectedPart)
    .map((m) => ({
      ...m,
      lessons: m.lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter((m) => m.lessons.length > 0 || searchTerm === '');

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b1d33] via-[#091b30] to-[#122338] border border-sky-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b58b42]/20 text-[#f1bd5b] border border-[#b58b42]/40 text-[10px] font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Syllabus Controller · Full Edit Privileges</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Curriculum & Video Masterclasses Editor
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Directly modify lesson titles, durations, instructors, handouts, and takeaways across all CIA Parts and AI Audit Lab. All updates reflect instantly on learner portals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video Lesson</span>
        </button>
      </div>

      {/* Part Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#091729]/95 border border-sky-900/60 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Parts' },
            { id: 'part-1', label: 'Part 1: GIAS' },
            { id: 'part-2', label: 'Part 2: Practice' },
            { id: 'part-3', label: 'Part 3: Business & IT' },
            { id: 'ai-lab', label: 'AI Audit Lab' }
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

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lessons by title, domain..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#f1bd5b] transition-all"
          />
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-6">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            className="rounded-3xl bg-[#091729]/95 border border-sky-900/60 overflow-hidden shadow-xl"
          >
            {/* Module Header */}
            <div className="px-6 py-4 bg-[#061220] border-b border-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#b58b42]/20 text-[#f1bd5b] border border-[#b58b42]/40 uppercase tracking-wider">
                    {module.partId.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Module {module.moduleNumber} · {module.lessons.length} Lessons
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-0.5">{module.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{module.description}</p>
              </div>

              <button
                type="button"
                onClick={() => openAddModal(module.id)}
                className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-[#f1bd5b]" />
                <span>Add Lesson Here</span>
              </button>
            </div>

            {/* Lessons Cards */}
            <div className="divide-y divide-sky-950/60">
              {module.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-800 to-[#b58b42] flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#f1bd5b] transition-colors">
                          {lesson.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/50">
                          {lesson.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {lesson.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3 h-3 text-[#f1bd5b]" />
                          <span>{lesson.instructor}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <FileText className="w-3 h-3 text-sky-400" />
                          <span>Handout: {lesson.handoutName} ({lesson.handoutSize})</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{lesson.domain}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(lesson, module.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#b58b42] text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#f1bd5b] group-hover:text-white" />
                      <span>Edit Lesson</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(module.id, lesson.id, lesson.title)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer border border-slate-700"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(editingLesson || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-[#091729] border border-sky-800/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="h-1.5 bg-gradient-to-r from-sky-600 via-[#f1bd5b] to-sky-700" />

            <div className="flex items-center justify-between px-6 py-4 bg-[#0b1d33] border-b border-sky-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center text-white shadow-md">
                  <Video className="w-4 h-4 text-[#f1bd5b]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingLesson ? 'Edit Curriculum Lesson' : 'Create New Curriculum Lesson'}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Changes take effect across all student portals immediately
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingLesson(null);
                  setIsAddModalOpen(false);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingLesson ? handleSaveEdit : handleCreateLesson}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Domain I: Purpose & Mandatory GIAS Foundations"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#f1bd5b] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Exam Part
                  </label>
                  <select
                    value={formPartId}
                    onChange={(e) => setFormPartId(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  >
                    <option value="part-1">Part 1 (GIAS)</option>
                    <option value="part-2">Part 2 (Practice)</option>
                    <option value="part-3">Part 3 (Business & IT)</option>
                    <option value="ai-lab">AI Audit Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration Display
                  </label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 54 mins"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Master Instructor
                  </label>
                  <input
                    type="text"
                    required
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    placeholder="CA Gurvinder Pal Singh"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Syllabus Domain / Category
                </label>
                <input
                  type="text"
                  required
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  placeholder="e.g. Ethics & Professionalism"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Comprehensive lecture breakdown covering core GIAS examination requirements..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Takeaways (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formTakeaways}
                  onChange={(e) => setFormTakeaways(e.target.value)}
                  placeholder="Key takeaway 1&#10;Key takeaway 2&#10;Key takeaway 3"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#f1bd5b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Downloadable Handout Name
                  </label>
                  <input
                    type="text"
                    value={formHandoutName}
                    onChange={(e) => setFormHandoutName(e.target.value)}
                    placeholder="e.g. GIAS_Crosswalk_Matrix.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Handout File Size
                  </label>
                  <input
                    type="text"
                    value={formHandoutSize}
                    onChange={(e) => setFormHandoutSize(e.target.value)}
                    placeholder="e.g. 2.4 MB"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#f1bd5b]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-sky-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLesson(null);
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
                  <span>{editingLesson ? 'Save Lesson Changes' : 'Create Lesson'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
