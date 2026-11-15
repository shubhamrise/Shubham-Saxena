import React, { useState, useEffect, useRef } from 'react';
import { LmsModule, LmsLesson } from '../../data/lmsData';
import {
  Video,
  Plus,
  Edit3,
  Trash2,
  User,
  FileText,
  Search,
  X,
  Save,
  Upload,
  Link2,
  CheckCircle2,
  Film,
  AlertCircle
} from 'lucide-react';
import {
  saveLessonVideo,
  getLessonVideo,
  deleteLessonVideo,
  formatVideoFileSize,
  readVideoDurationFromFile,
  resolveVideoPlaybackSource
} from '../../utils/videoStorage';

interface CurriculumEditorProps {
  modules: LmsModule[];
  onUpdateModules: (updated: LmsModule[]) => void;
  onShowToast: (msg: string) => void;
  theme?: 'light' | 'dark';
}

export const CurriculumEditor: React.FC<CurriculumEditorProps> = ({
  modules,
  onUpdateModules,
  onShowToast,
  theme = 'light'
}) => {
  const [selectedPart, setSelectedPart] = useState<'all' | 'part-1' | 'part-2' | 'part-3' | 'ai-lab'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLesson, setEditingLesson] = useState<{ lesson: LmsLesson; moduleId: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(modules[0]?.id || 'p1-m1');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [confirmRemoveVideo, setConfirmRemoveVideo] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Lesson metadata form states
  const [formTitle, setFormTitle] = useState('');
  const [formPartId, setFormPartId] = useState<'part-1' | 'part-2' | 'part-3' | 'ai-lab'>('part-1');
  const [formDuration, setFormDuration] = useState('50 mins');
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(50);
  const [formInstructor, setFormInstructor] = useState('CA Gurvinder Pal Singh');
  const [formDomain, setFormDomain] = useState('Domain I: Purpose & Mandatory GIAS Foundations');
  const [formDescription, setFormDescription] = useState('');
  const [formTakeaways, setFormTakeaways] = useState('');
  const [formHandoutName, setFormHandoutName] = useState('GIAS_Master_Study_Notes.pdf');
  const [formHandoutSize, setFormHandoutSize] = useState('2.4 MB');

  // Video upload / link states
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('upload');
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoFileName, setFormVideoFileName] = useState('');
  const [formVideoFileSize, setFormVideoFileSize] = useState('');
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs on unmount or change
  useEffect(() => {
    return () => {
      if (previewObjectUrl && previewObjectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const resetVideoState = () => {
    if (previewObjectUrl && previewObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewObjectUrl);
    }
    setPendingVideoFile(null);
    setPreviewObjectUrl(null);
    setFormVideoUrl('');
    setFormVideoFileName('');
    setFormVideoFileSize('');
    setConfirmRemoveVideo(false);
    setFormError(null);
  };

  const openEditModal = async (lesson: LmsLesson, moduleId: string) => {
    resetVideoState();
    setEditingLesson({ lesson, moduleId });
    setFormTitle(lesson.title);
    setFormPartId(lesson.partId);
    setFormDuration(lesson.duration);
    setFormDurationMinutes(lesson.durationMinutes || 45);
    setFormInstructor(lesson.instructor);
    setFormDomain(lesson.domain);
    setFormDescription(lesson.description);
    setFormTakeaways(lesson.keyTakeaways.join('\n'));
    setFormHandoutName(lesson.handoutName);
    setFormHandoutSize(lesson.handoutSize);

    const existingUrl = lesson.videoUrl || '';
    setFormVideoUrl(existingUrl);
    setFormVideoFileName(lesson.videoFileName || '');
    setFormVideoFileSize(lesson.videoFileSize || '');

    if (lesson.videoSourceType === 'url' || (existingUrl && !existingUrl.startsWith('idb://'))) {
      setVideoMode('url');
    } else {
      setVideoMode('upload');
      if (existingUrl.startsWith('idb://')) {
        const stored = await getLessonVideo(lesson.id);
        if (stored) {
          const objUrl = URL.createObjectURL(stored.blob);
          setPreviewObjectUrl(objUrl);
          setFormVideoFileName(stored.fileName);
          setFormVideoFileSize(formatVideoFileSize(stored.sizeBytes));
        }
      }
    }
  };

  const openAddModal = (moduleId?: string) => {
    resetVideoState();
    setEditingLesson(null);
    setTargetModuleId(moduleId || modules[0]?.id || 'p1-m1');
    const matchedMod = modules.find((m) => m.id === (moduleId || modules[0]?.id));
    setFormTitle('');
    setFormPartId(matchedMod ? matchedMod.partId : selectedPart === 'all' ? 'part-1' : selectedPart);
    setFormDuration('45 mins');
    setFormDurationMinutes(45);
    setFormInstructor('CA Gurvinder Pal Singh');
    setFormDomain(matchedMod ? matchedMod.title : 'Domain I: Purpose & Mandatory GIAS Foundations');
    setFormDescription('Comprehensive video masterclass breakdown covering core GIAS examination concepts.');
    setFormTakeaways('Key standard requirements\nBoard governance interactions\nExam trap analysis');
    setFormHandoutName('BNC_CIA_Lecture_Handout.pdf');
    setFormHandoutSize('2.1 MB');
    setVideoMode('upload');
    setIsAddModalOpen(true);
  };

  const handleVideoFileSelect = async (file: File | null) => {
    if (!file) return;
    setFormError(null);

    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(file.name)) {
      setFormError('Please select a valid video file (MP4, WebM, MOV, M4V, or MKV).');
      return;
    }

    if (previewObjectUrl && previewObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewObjectUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setPendingVideoFile(file);
    setPreviewObjectUrl(objUrl);
    setFormVideoFileName(file.name);
    setFormVideoFileSize(formatVideoFileSize(file.size));

    // Automatically detect lecture duration from uploaded video metadata
    const detected = await readVideoDurationFromFile(file);
    if (detected) {
      setFormDuration(detected.formatted);
      setFormDurationMinutes(detected.minutes);
    }

    // Auto-fill title from filename if blank
    if (!formTitle.trim()) {
      const cleaned = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      if (cleaned) setFormTitle(cleaned);
    }
  };

  const handleRemoveAttachedVideo = async () => {
    if (editingLesson?.lesson.id && formVideoUrl.startsWith('idb://')) {
      await deleteLessonVideo(editingLesson.lesson.id);
    }
    resetVideoState();
    onShowToast('Video removed from form');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    if (!formTitle.trim()) {
      setFormError('Please enter a lesson title.');
      return;
    }

    setIsSavingVideo(true);
    setFormError(null);

    try {
      const lessonId = editingLesson.lesson.id;
      let nextVideoUrl = formVideoUrl.trim();
      let nextSourceType: 'upload' | 'url' | undefined = editingLesson.lesson.videoSourceType;
      let nextFileName = formVideoFileName;
      let nextFileSize = formVideoFileSize;

      if (videoMode === 'upload') {
        if (pendingVideoFile) {
          await saveLessonVideo(lessonId, pendingVideoFile);
          nextVideoUrl = `idb://${lessonId}`;
          nextSourceType = 'upload';
          nextFileName = pendingVideoFile.name;
          nextFileSize = formatVideoFileSize(pendingVideoFile.size);
        } else if (nextVideoUrl.startsWith('idb://')) {
          nextSourceType = 'upload';
        } else {
          nextVideoUrl = '';
          nextSourceType = undefined;
          nextFileName = '';
          nextFileSize = '';
        }
      } else {
        if (nextVideoUrl) {
          nextSourceType = 'url';
          nextFileName = '';
          nextFileSize = '';
        } else {
          nextSourceType = undefined;
          nextFileName = '';
          nextFileSize = '';
        }
      }

      const parsedMins = parseInt(formDuration, 10) || formDurationMinutes || 45;

      const updatedModules = modules.map((mod) => {
        if (mod.id !== editingLesson.moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) => {
            if (l.id !== lessonId) return l;
            return {
              ...l,
              title: formTitle.trim(),
              partId: formPartId,
              duration: formDuration.trim() || `${parsedMins} mins`,
              durationMinutes: parsedMins,
              instructor: formInstructor.trim(),
              domain: formDomain.trim(),
              description: formDescription.trim(),
              keyTakeaways: formTakeaways.split('\n').filter((t) => t.trim().length > 0),
              handoutName: formHandoutName.trim(),
              handoutSize: formHandoutSize.trim(),
              videoUrl: nextVideoUrl || undefined,
              videoSourceType: nextSourceType,
              videoFileName: nextFileName || undefined,
              videoFileSize: nextFileSize || undefined
            };
          })
        };
      });

      onUpdateModules(updatedModules);
      setEditingLesson(null);
      resetVideoState();
      onShowToast(`✓ Saved video & lesson updates for "${formTitle}"`);
    } catch (err) {
      console.error(err);
      setFormError('Could not save video file in browser storage. Try a smaller file or paste a video link.');
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please provide a video lesson title.');
      return;
    }

    setIsSavingVideo(true);
    setFormError(null);

    try {
      const newLessonId = `lesson-${Date.now()}`;
      let finalVideoUrl: string | undefined;
      let finalSourceType: 'upload' | 'url' | undefined;
      let finalFileName: string | undefined;
      let finalFileSize: string | undefined;

      if (videoMode === 'upload' && pendingVideoFile) {
        await saveLessonVideo(newLessonId, pendingVideoFile);
        finalVideoUrl = `idb://${newLessonId}`;
        finalSourceType = 'upload';
        finalFileName = pendingVideoFile.name;
        finalFileSize = formatVideoFileSize(pendingVideoFile.size);
      } else if (videoMode === 'url' && formVideoUrl.trim()) {
        finalVideoUrl = formVideoUrl.trim();
        finalSourceType = 'url';
      }

      const parsedMins = parseInt(formDuration, 10) || formDurationMinutes || 45;

      const newLesson: LmsLesson = {
        id: newLessonId,
        partId: formPartId,
        title: formTitle.trim(),
        duration: formDuration.trim() || `${parsedMins} mins`,
        durationMinutes: parsedMins,
        instructor: formInstructor.trim(),
        domain: formDomain.trim(),
        description: formDescription.trim(),
        keyTakeaways: formTakeaways.split('\n').filter((t) => t.trim().length > 0),
        handoutName: formHandoutName.trim() || 'BNC_CIA_Study_Handout.pdf',
        handoutSize: formHandoutSize.trim() || '2.0 MB',
        sampleTranscript: 'Welcome to BNC ELEVATE Masterclass lecture...',
        videoPoster: '/hero-bg.jpg',
        videoUrl: finalVideoUrl,
        videoSourceType: finalSourceType,
        videoFileName: finalFileName,
        videoFileSize: finalFileSize
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
      resetVideoState();
      onShowToast(`✓ Added video lesson "${newLesson.title}" to Student LMS!`);
    } catch (err) {
      console.error(err);
      setFormError('Could not save video file in browser storage. Try a smaller file or paste a video link.');
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string, title: string) => {
    await deleteLessonVideo(lessonId);
    const updatedModules = modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        lessons: mod.lessons.filter((l) => l.id !== lessonId)
      };
    });
    onUpdateModules(updatedModules);
    setConfirmDeleteKey(null);
    onShowToast(`Removed lesson "${title}"`);
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const uploadedVideosCount = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => Boolean(l.videoUrl)).length,
    0
  );

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

  const urlPreviewInfo = videoMode === 'url' ? resolveVideoPlaybackSource(formVideoUrl) : { kind: 'none' as const };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl border shadow-xs transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
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
            <Video className="w-3.5 h-3.5" />
            <span>
              Video Masterclasses Manager · {uploadedVideosCount}/{totalLessons} Lessons With Video
            </span>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Upload & Manage Masterclass Videos
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Upload MP4/WebM video lectures directly from your device or connect YouTube, Vimeo, Google Drive, or cloud MP4 links. Videos publish immediately to the Student LMS Portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Video Lesson</span>
        </button>
      </div>

      {/* Part Filter & Search Bar */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200'
            : 'bg-[#091729]/95 border-sky-900/60 shadow-md'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Parts' },
            { id: 'part-1', label: 'Part 1: GIAS' },
            { id: 'part-2', label: 'Part 2: Practice' },
            { id: 'part-3', label: 'Part 3: Business & IT' },
            { id: 'ai-lab', label: 'AI Audit Lab' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedPart(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedPart === tab.id
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-xs'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs transition-all ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]'
            }`}
          />
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-6">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            className={`rounded-3xl border overflow-hidden shadow-xs transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-[#091729]/95 border-sky-900/60 shadow-xl'
            }`}
          >
            {/* Module Header */}
            <div
              className={`px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#061220] border-sky-950'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      theme === 'light'
                        ? 'bg-amber-50 text-[#b58b42] border-amber-200'
                        : 'bg-[#b58b42]/20 text-[#f1bd5b] border-[#b58b42]/40'
                    }`}
                  >
                    {module.partId.toUpperCase()}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Module {module.moduleNumber} · {module.lessons.length} Lessons
                  </span>
                </div>
                <h3
                  className={`text-base font-extrabold mt-0.5 ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {module.title}
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {module.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openAddModal(module.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-sky-950 hover:bg-sky-900 text-sky-200 border-sky-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#b58b42]" />
                <span>Add Video Here</span>
              </button>
            </div>

            {/* Lessons Cards */}
            <div
              className={`divide-y ${
                theme === 'light' ? 'divide-slate-100' : 'divide-sky-950/60'
              }`}
            >
              {module.lessons.map((lesson, idx) => {
                const hasVideo = Boolean(lesson.videoUrl);
                const delKey = `${module.id}:${lesson.id}`;

                return (
                  <div
                    key={lesson.id}
                    className={`p-5 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group ${
                      theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#102a4e] to-[#b58b42] flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`text-sm font-bold transition-colors ${
                              theme === 'light'
                                ? 'text-slate-900 group-hover:text-sky-800'
                                : 'text-white group-hover:text-[#f1bd5b]'
                            }`}
                          >
                            {lesson.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              theme === 'light'
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-sky-950 text-sky-300 border-sky-800/50'
                            }`}
                          >
                            {lesson.duration}
                          </span>

                          {hasVideo ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                theme === 'light'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {lesson.videoUrl?.startsWith('idb://')
                                ? `Uploaded: ${lesson.videoFileName || 'Video File'}${
                                    lesson.videoFileSize ? ` (${lesson.videoFileSize})` : ''
                                  }`
                                : 'Video Link Attached'}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                theme === 'light'
                                  ? 'bg-amber-50 text-[#8d6928] border-amber-200'
                                  : 'bg-amber-950/50 text-amber-300 border-amber-700/50'
                              }`}
                            >
                              <Film className="w-3 h-3" />
                              No Video Uploaded Yet
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs leading-relaxed max-w-3xl ${
                            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                          }`}
                        >
                          {lesson.description}
                        </p>
                        <div
                          className={`flex flex-wrap items-center gap-3 text-[11px] pt-1 ${
                            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-1 font-medium">
                            <User className="w-3 h-3 text-[#b58b42]" />
                            <span className={theme === 'light' ? 'text-slate-800' : 'text-slate-300'}>
                              {lesson.instructor}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <FileText className="w-3 h-3 text-sky-600" />
                            <span className={theme === 'light' ? 'text-slate-800' : 'text-slate-300'}>
                              Handout: {lesson.handoutName} ({lesson.handoutSize})
                            </span>
                          </span>
                          <span>•</span>
                          <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                            {lesson.domain}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(lesson, module.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                          hasVideo
                            ? theme === 'light'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-slate-800 hover:bg-[#b58b42] text-slate-200 hover:text-white border-slate-700'
                            : 'bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white border-transparent'
                        }`}
                      >
                        {hasVideo ? (
                          <>
                            <Edit3 className="w-3.5 h-3.5 text-[#b58b42]" />
                            <span>Edit / Change Video</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-[#f1bd5b]" />
                            <span>Upload Video</span>
                          </>
                        )}
                      </button>

                      {confirmDeleteKey === delKey ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(module.id, lesson.id, lesson.title)}
                            className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(null)}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                              theme === 'light'
                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKey(delKey)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                            theme === 'light'
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-300'
                              : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border-slate-700'
                          }`}
                          title="Delete lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Upload Video Lesson Modal */}
      {(editingLesson || isAddModalOpen) && (
        <div
          onClick={() => {
            setEditingLesson(null);
            setIsAddModalOpen(false);
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
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1d33] border-sky-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#102a4e] to-[#b58b42] flex items-center justify-center text-white shadow-md">
                  <Video className="w-5 h-5 text-[#f1bd5b]" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {editingLesson ? 'Upload Video & Edit Lesson' : 'Upload New Masterclass Video'}
                  </h3>
                  <div className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Changes reflect immediately in the Student LMS Video Player
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingLesson(null);
                  setIsAddModalOpen(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'
                    : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <form
              onSubmit={editingLesson ? handleSaveEdit : handleCreateLesson}
              className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* VIDEO SOURCE UPLOADER BOX */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'light'
                    ? 'bg-sky-50 border-sky-200'
                    : 'bg-sky-950/30 border-sky-800/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className={`font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-sky-950' : 'text-sky-200'}`}>
                    <Film className="w-4 h-4 text-[#b58b42]" />
                    <span>Lecture Video File or Streaming Link</span>
                  </div>

                  <div className="inline-flex rounded-xl p-0.5 bg-slate-200 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        videoMode === 'upload'
                          ? 'bg-gradient-to-r from-[#102a4e] to-[#163a6b] text-white shadow-xs'
                          : theme === 'light'
                          ? 'text-slate-700 hover:text-slate-900'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File (MP4 / WebM)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoMode('url')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        videoMode === 'url'
                          ? 'bg-gradient-to-r from-[#102a4e] to-[#163a6b] text-white shadow-xs'
                          : theme === 'light'
                          ? 'text-slate-700 hover:text-slate-900'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Paste Video URL</span>
                    </button>
                  </div>
                </div>

                {videoMode === 'upload' ? (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      className="hidden"
                      onChange={(e) => handleVideoFileSelect(e.target.files?.[0] || null)}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const dropped = e.dataTransfer.files?.[0] || null;
                        handleVideoFileSelect(dropped);
                      }}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                        theme === 'light'
                          ? 'bg-white border-sky-300 hover:border-[#b58b42] hover:bg-amber-50/40'
                          : 'bg-slate-900 border-sky-800 hover:border-[#f1bd5b]'
                      }`}
                    >
                      <Upload className="w-7 h-7 mx-auto mb-2 text-[#b58b42]" />
                      <div className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {formVideoFileName
                          ? `Selected: ${formVideoFileName} (${formVideoFileSize})`
                          : 'Click to browse or drag & drop lecture video'}
                      </div>
                      <div className={`text-[11px] mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Supports MP4, WebM, MOV, M4V · Stored directly in browser media vault for instant playback
                      </div>
                    </div>

                    {previewObjectUrl && (
                      <div className="space-y-2">
                        <div className="rounded-2xl overflow-hidden border border-slate-300 bg-black aspect-video">
                          <video
                            src={previewObjectUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Video ready to publish
                          </span>
                          {confirmRemoveVideo ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleRemoveAttachedVideo}
                                className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmRemoveVideo(false)}
                                className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                                  theme === 'light'
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveVideo(true)}
                              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Remove Video
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <input
                        type="url"
                        value={formVideoUrl.startsWith('idb://') ? '' : formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or direct .mp4 URL"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                          theme === 'light'
                            ? 'bg-white border-sky-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                            : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]'
                        }`}
                      />
                      <p className={`text-[10px] mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Works with YouTube, Vimeo, Google Drive share links, or any direct MP4/WebM streaming URL.
                      </p>
                    </div>

                    {urlPreviewInfo.kind === 'iframe' && urlPreviewInfo.embedUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-300 bg-black aspect-video">
                        <iframe
                          src={urlPreviewInfo.embedUrl}
                          title="Video URL Preview"
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {urlPreviewInfo.kind === 'direct' && urlPreviewInfo.embedUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-300 bg-black aspect-video">
                        <video
                          src={urlPreviewInfo.embedUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!editingLesson && modules.length > 0 && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Target Curriculum Module *
                  </label>
                  <select
                    value={targetModuleId}
                    onChange={(e) => {
                      setTargetModuleId(e.target.value);
                      const mod = modules.find((m) => m.id === e.target.value);
                      if (mod) setFormPartId(mod.partId);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.partId.toUpperCase()} · Module {m.moduleNumber}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Domain I: Purpose & Mandatory GIAS Foundations"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#f1bd5b]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Exam Part
                  </label>
                  <select
                    value={formPartId}
                    onChange={(e) => setFormPartId(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    <option value="part-1">Part 1 (GIAS)</option>
                    <option value="part-2">Part 2 (Practice)</option>
                    <option value="part-3">Part 3 (Business & IT)</option>
                    <option value="ai-lab">AI Audit Lab</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Duration Display
                  </label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 54 mins"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Master Instructor
                  </label>
                  <input
                    type="text"
                    required
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    placeholder="CA Gurvinder Pal Singh"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Syllabus Domain / Category
                </label>
                <input
                  type="text"
                  required
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  placeholder="e.g. Ethics & Professionalism"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Comprehensive lecture breakdown covering core GIAS examination requirements..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Key Takeaways (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formTakeaways}
                  onChange={(e) => setFormTakeaways(e.target.value)}
                  placeholder="Key takeaway 1&#10;Key takeaway 2&#10;Key takeaway 3"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Downloadable Handout Name
                  </label>
                  <input
                    type="text"
                    value={formHandoutName}
                    onChange={(e) => setFormHandoutName(e.target.value)}
                    placeholder="e.g. GIAS_Crosswalk_Matrix.pdf"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Handout File Size
                  </label>
                  <input
                    type="text"
                    value={formHandoutSize}
                    onChange={(e) => setFormHandoutSize(e.target.value)}
                    placeholder="e.g. 2.4 MB"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div
                className={`pt-3 border-t flex items-center justify-end gap-3 ${
                  theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditingLesson(null);
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
                  disabled={isSavingVideo}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingVideo
                      ? 'Saving Video...'
                      : editingLesson
                      ? 'Save Video & Lesson'
                      : 'Publish Video Lesson'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
