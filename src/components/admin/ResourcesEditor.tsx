import React, { useState } from 'react';
import { LmsResource } from '../../data/lmsData';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Search,
  Download,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface ResourcesEditorProps {
  resources: LmsResource[];
  onUpdateResources: (updated: LmsResource[]) => void;
  onShowToast: (msg: string) => void;
}

export const ResourcesEditor: React.FC<ResourcesEditorProps> = ({
  resources,
  onUpdateResources,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LmsResource | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Standards' | 'Mind Maps' | 'Templates' | 'Formula Sheets' | 'AI Workpapers'>('Standards');
  const [fileType, setFileType] = useState<'PDF' | 'XLSX' | 'DOCX'>('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setEditingResource(null);
    setTitle('');
    setCategory('Standards');
    setFileType('PDF');
    setFileSize('2.5 MB');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (r: LmsResource) => {
    setEditingResource(r);
    setTitle(r.title);
    setCategory(r.category);
    setFileType(r.fileType);
    setFileSize(r.fileSize);
    setDescription(r.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide title and description.');
      return;
    }

    if (editingResource) {
      const updated = resources.map((r) =>
        r.id === editingResource.id
          ? {
              ...r,
              title: title.trim(),
              category,
              fileType,
              fileSize: fileSize.trim() || '1.5 MB',
              description: description.trim(),
            }
          : r
      );
      onUpdateResources(updated);
      onShowToast(`✓ Resource "${title}" updated successfully.`);
    } else {
      const newResource: LmsResource = {
        id: `res-${Date.now()}`,
        title: title.trim(),
        category,
        fileType,
        fileSize: fileSize.trim() || '2.0 MB',
        description: description.trim(),
        downloadsCount: 0,
      };
      onUpdateResources([newResource, ...resources]);
      onShowToast(`✓ New resource "${title}" published.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, resTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${resTitle}" from student study downloads?`)) return;
    const updated = resources.filter((r) => r.id !== id);
    onUpdateResources(updated);
    onShowToast(`✓ Resource removed.`);
  };

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-700" />
            <span>Study Downloads & Handouts Repository</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage official IIA standards, mind maps, formula sheets, Excel audit workpapers, and student guides.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Add Resource</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-600"
          >
            <option value="all">All Categories ({resources.length})</option>
            <option value="Standards">Standards</option>
            <option value="Mind Maps">Mind Maps</option>
            <option value="Templates">Templates</option>
            <option value="Formula Sheets">Formula Sheets</option>
            <option value="AI Workpapers">AI Workpapers</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-100">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.fileType} · {item.fileSize}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1.5">{item.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Download className="w-3 h-3 text-slate-400" />
                {item.downloadsCount || 140}+ downloads
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer"
                  title="Edit Resource"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                  title="Delete Resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No study resources found matching criteria.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-700" />
                <span>{editingResource ? 'Edit Study Resource' : 'Add New Study Resource'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 2026 GIAS Global Internal Audit Standards (Complete Text)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-600 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="Standards">Standards</option>
                    <option value="Mind Maps">Mind Maps</option>
                    <option value="Templates">Templates</option>
                    <option value="Formula Sheets">Formula Sheets</option>
                    <option value="AI Workpapers">AI Workpapers</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File Format</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="PDF">PDF</option>
                    <option value="XLSX">XLSX</option>
                    <option value="DOCX">DOCX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Size Badge</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g., 3.8 MB"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide syllabus context, why it matters for IIA exam preparation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-600 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-700 to-[#b58b42] text-white font-bold cursor-pointer hover:shadow-md"
                >
                  {editingResource ? 'Save Changes' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
