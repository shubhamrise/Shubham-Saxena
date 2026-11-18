import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  CampaignFormRow,
  CampaignSpreadsheetBatch,
  EnquiryLead,
} from '../../types';
import {
  FileSpreadsheet,
  Upload,
  Search,
  Trash2,
  Download,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  Eye,
  X,
  FolderOpen,
  FileCheck2,
  AlertCircle,
  Save,
  Edit3,
} from 'lucide-react';

interface CampaignFormsEditorProps {
  batches: CampaignSpreadsheetBatch[];
  onUpdateBatches: (updated: CampaignSpreadsheetBatch[]) => void;
  existingLeads: EnquiryLead[];
  onImportLeads: (newLeads: EnquiryLead[]) => number;
  onShowToast: (msg: string) => void;
  theme?: 'light' | 'dark';
}

const normalizeHeader = (header: string): string =>
  header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const findMatchingHeader = (headers: string[], patterns: string[]): string | undefined => {
  const normalizedMap = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  for (const p of patterns) {
    const exact = normalizedMap.find((h) => h.norm === p);
    if (exact) return exact.raw;
  }
  for (const p of patterns) {
    const partial = normalizedMap.find((h) => h.norm.includes(p));
    if (partial) return partial.raw;
  }
  return undefined;
};

const formatCellValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return String(val).trim();
};

export const CampaignFormsEditor: React.FC<CampaignFormsEditorProps> = ({
  batches,
  onUpdateBatches,
  existingLeads,
  onImportLeads,
  onShowToast,
  theme = 'light',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [campaignTagInput, setCampaignTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncFilter, setSyncFilter] = useState<'all' | 'pending' | 'synced'>('all');

  const [confirmDeleteBatchId, setConfirmDeleteBatchId] = useState<string | null>(null);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState<string | null>(null);
  const [inspectingRow, setInspectingRow] = useState<CampaignFormRow | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editingBatchName, setEditingBatchName] = useState('');

  const existingContactKeys = new Set<string>();
  existingLeads.forEach((l) => {
    if (l.email) existingContactKeys.add(`e:${l.email.trim().toLowerCase()}`);
    const phoneDigits = (l.phone || '').replace(/[^0-9]/g, '');
    if (phoneDigits.length >= 8) existingContactKeys.add(`p:${phoneDigits.slice(-10)}`);
  });

  const isRowAlreadyInLeads = (row: CampaignFormRow): boolean => {
    if (row.importedToLeads) return true;
    const e = row.email.trim().toLowerCase();
    if (e && existingContactKeys.has(`e:${e}`)) return true;
    const p = row.phone.replace(/[^0-9]/g, '');
    if (p.length >= 8 && existingContactKeys.has(`p:${p.slice(-10)}`)) return true;
    return false;
  };

  const visibleBatches =
    selectedBatchId === 'all' ? batches : batches.filter((b) => b.id === selectedBatchId);

  const allRows: CampaignFormRow[] = visibleBatches.flatMap((b) => b.rows);
  const totalAllRowsCount = batches.reduce((sum, b) => sum + b.rows.length, 0);
  const totalSyncedCount = batches.reduce(
    (sum, b) => sum + b.rows.filter((r) => isRowAlreadyInLeads(r)).length,
    0
  );
  const pendingImportCount = Math.max(0, totalAllRowsCount - totalSyncedCount);

  const filteredRows = allRows.filter((row) => {
    const synced = isRowAlreadyInLeads(row);
    if (syncFilter === 'pending' && synced) return false;
    if (syncFilter === 'synced' && !synced) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.phone.toLowerCase().includes(q) ||
      row.campaignName.toLowerCase().includes(q) ||
      (row.program || '').toLowerCase().includes(q) ||
      (row.qualification || '').toLowerCase().includes(q) ||
      Object.values(row.rawFields).some((v) => v.toLowerCase().includes(q))
    );
  });

  const formatNowTimestamp = () =>
    new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSpreadsheetFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadError(null);
    setIsParsing(true);

    const newBatches: CampaignSpreadsheetBatch[] = [];
    const skippedFiles: string[] = [];

    try {
      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
          skippedFiles.push(`${file.name} (unsupported format)`);
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        if (!workbook.SheetNames.length) {
          skippedFiles.push(`${file.name} (no readable worksheets)`);
          continue;
        }

        const defaultBaseName = file.name
          .replace(/\.(xlsx|xls|csv)$/i, '')
          .replace(/[_-]+/g, ' ')
          .trim();

        const hasMultipleTabs = workbook.SheetNames.length > 1;

        workbook.SheetNames.forEach((sheetName, sIdx) => {
          const sheet = workbook.Sheets[sheetName];
          const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: '',
            raw: false,
          });

          if (!rawJson || rawJson.length === 0) return;

          const headersSet = new Set<string>();
          rawJson.forEach((rec) => {
            Object.keys(rec).forEach((k) => {
              if (k && !k.startsWith('__EMPTY')) {
                headersSet.add(k);
              } else if (k && formatCellValue(rec[k])) {
                headersSet.add(k);
              }
            });
          });
          const headers = Array.from(headersSet);

          const tagPrefix = campaignTagInput.trim();
          const campaignName = tagPrefix
            ? files.length > 1 || hasMultipleTabs
              ? `${tagPrefix} · ${hasMultipleTabs ? sheetName : defaultBaseName}`
              : tagPrefix
            : hasMultipleTabs
            ? `${defaultBaseName} · ${sheetName}`
            : defaultBaseName || 'Email Campaign Google Form';

          const batchId = `batch-${Date.now()}-${fIdx}-${sIdx}`;

          const timestampCol = findMatchingHeader(headers, ['timestamp', 'submitted', 'date', 'created']);
          const nameCol = findMatchingHeader(headers, [
            'full name',
            'student name',
            'candidate name',
            'your name',
            'name',
          ]);
          const emailCol = findMatchingHeader(headers, ['email address', 'e mail', 'email', 'mail']);
          const phoneCol = findMatchingHeader(headers, [
            'whatsapp',
            'phone number',
            'mobile number',
            'contact number',
            'phone',
            'mobile',
            'contact',
          ]);
          const qualCol = findMatchingHeader(headers, [
            'qualification',
            'education',
            'degree',
            'background',
            'designation',
            'profession',
          ]);
          const programCol = findMatchingHeader(headers, [
            'program',
            'package',
            'course',
            'cohort',
            'interest',
            'track',
          ]);
          const notesCol = findMatchingHeader(headers, [
            'comments',
            'questions',
            'message',
            'notes',
            'remarks',
            'query',
          ]);

          const parsedRows: CampaignFormRow[] = rawJson
            .map((rec, idx) => {
              const rawFields: Record<string, string> = {};
              headers.forEach((h) => {
                const val = formatCellValue(rec[h]);
                if (val !== '') rawFields[h] = val;
              });

              if (Object.keys(rawFields).length === 0) return null;

              const name = (nameCol ? formatCellValue(rec[nameCol]) : '') || 'Campaign Respondent';
              const email = (emailCol ? formatCellValue(rec[emailCol]) : '').toLowerCase();
              const phone = phoneCol ? formatCellValue(rec[phoneCol]) : '';
              const submittedAt =
                (timestampCol ? formatCellValue(rec[timestampCol]) : '') ||
                new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

              return {
                id: `crow-${batchId}-${idx}`,
                batchId,
                campaignName,
                submittedAt,
                name,
                email,
                phone,
                qualification: qualCol ? formatCellValue(rec[qualCol]) : undefined,
                program: programCol ? formatCellValue(rec[programCol]) : undefined,
                notes: notesCol ? formatCellValue(rec[notesCol]) : undefined,
                rawFields,
                importedToLeads: false,
              } as CampaignFormRow;
            })
            .filter((r): r is CampaignFormRow => r !== null);

          if (parsedRows.length > 0) {
            newBatches.push({
              id: batchId,
              campaignName,
              fileName: file.name,
              sheetName,
              uploadedAt: formatNowTimestamp(),
              headers,
              rows: parsedRows,
            });
          }
        });
      }

      if (newBatches.length === 0) {
        setUploadError(
          skippedFiles.length > 0
            ? `No valid campaign sheets found. Skipped: ${skippedFiles.join(', ')}`
            : 'No non-empty rows were found in the uploaded file(s).'
        );
        return;
      }

      onUpdateBatches([...newBatches, ...batches]);
      setSelectedBatchId(newBatches.length === 1 ? newBatches[0].id : 'all');
      setCampaignTagInput('');
      const totalRows = newBatches.reduce((sum, b) => sum + b.rows.length, 0);
      onShowToast(
        `Uploaded ${newBatches.length} sheet(s) (${totalRows} rows). Click Save to confirm or rename sheets.`
      );
      if (skippedFiles.length > 0) {
        setUploadError(`Some files were skipped: ${skippedFiles.join(', ')}`);
      }
    } catch (err) {
      console.error('Failed to parse spreadsheet:', err);
      setUploadError('Could not read uploaded file(s). Ensure they are valid .xlsx, .xls, or .csv exports.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveSingleBatch = (batchId: string) => {
    const now = formatNowTimestamp();
    const updated = batches.map((b) => (b.id === batchId ? { ...b, savedAt: now } : b));
    onUpdateBatches(updated);
    const target = updated.find((b) => b.id === batchId);
    onShowToast(`Saved sheet "${target?.campaignName || 'Campaign Sheet'}"`);
  };

  const handleSaveAllBatches = () => {
    if (batches.length === 0) {
      onShowToast('Upload one or more Excel/CSV sheets first.');
      return;
    }
    const now = formatNowTimestamp();
    const updated = batches.map((b) => ({ ...b, savedAt: b.savedAt || now }));
    onUpdateBatches(updated);
    onShowToast(`Saved all ${updated.length} uploaded sheet(s) in Campaigns`);
  };

  const handleRenameBatch = (batchId: string) => {
    const trimmed = editingBatchName.trim();
    if (!trimmed) {
      setEditingBatchId(null);
      return;
    }
    const now = formatNowTimestamp();
    const updated = batches.map((b) => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        campaignName: trimmed,
        savedAt: now,
        rows: b.rows.map((r) => ({ ...r, campaignName: trimmed })),
      };
    });
    onUpdateBatches(updated);
    setEditingBatchId(null);
    setEditingBatchName('');
    onShowToast(`Renamed and saved sheet as "${trimmed}"`);
  };

  const handleDownloadSingleBatchExcel = (batch: CampaignSpreadsheetBatch) => {
    const exportObjects = batch.rows.map((r) => ({
      Campaign: batch.campaignName,
      Submitted: r.submittedAt,
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Qualification: r.qualification || '',
      Program: r.program || '',
      SyncedToLeads: isRowAlreadyInLeads(r) ? 'Yes' : 'No',
      ...r.rawFields,
    }));
    const ws = XLSX.utils.json_to_sheet(exportObjects);
    const wb = XLSX.utils.book_new();
    const safeTab = batch.campaignName.replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Sheet1';
    XLSX.utils.book_append_sheet(wb, ws, safeTab);
    const safeFile = batch.campaignName.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
    XLSX.writeFile(wb, `${safeFile || 'Campaign_Sheet'}.xlsx`);
    onShowToast(`Downloaded "${batch.campaignName}.xlsx"`);
  };

  const handleDownloadAllSavedWorkbook = () => {
    if (batches.length === 0) {
      onShowToast('No uploaded sheets available to export.');
      return;
    }
    const wb = XLSX.utils.book_new();
    const usedNames = new Set<string>();
    batches.forEach((batch, idx) => {
      const exportObjects = batch.rows.map((r) => ({
        Campaign: batch.campaignName,
        Submitted: r.submittedAt,
        Name: r.name,
        Email: r.email,
        Phone: r.phone,
        Qualification: r.qualification || '',
        Program: r.program || '',
        SyncedToLeads: isRowAlreadyInLeads(r) ? 'Yes' : 'No',
        ...r.rawFields,
      }));
      const ws = XLSX.utils.json_to_sheet(exportObjects);
      let tabName = (batch.campaignName.replace(/[\\/?*[\]:]/g, '').trim() || `Sheet_${idx + 1}`).slice(0, 28);
      let uniqueTab = tabName;
      let suffix = 2;
      while (usedNames.has(uniqueTab.toLowerCase())) {
        uniqueTab = `${tabName.slice(0, 25)}_${suffix++}`;
      }
      usedNames.add(uniqueTab.toLowerCase());
      XLSX.utils.book_append_sheet(wb, ws, uniqueTab);
    });
    XLSX.writeFile(wb, `BNC_All_Campaign_Sheets_${new Date().toISOString().slice(0, 10)}.xlsx`);
    onShowToast(`Saved combined workbook with ${batches.length} campaign sheet(s)`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length > 0) {
      void handleSpreadsheetFiles(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (dropped.length > 0) {
      void handleSpreadsheetFiles(dropped);
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    const target = batches.find((b) => b.id === batchId);
    const updated = batches.filter((b) => b.id !== batchId);
    onUpdateBatches(updated);
    if (selectedBatchId === batchId) setSelectedBatchId('all');
    setConfirmDeleteBatchId(null);
    onShowToast(`Deleted campaign sheet "${target?.campaignName || 'Upload'}"`);
  };

  const handleDeleteRow = (rowId: string) => {
    const updated = batches
      .map((b) => ({
        ...b,
        rows: b.rows.filter((r) => r.id !== rowId),
      }))
      .filter((b) => b.rows.length > 0);
    onUpdateBatches(updated);
    setConfirmDeleteRowId(null);
    onShowToast('Removed response row from campaign sheet');
  };

  const convertRowToLead = (row: CampaignFormRow): EnquiryLead => {
    const extraPairs = Object.entries(row.rawFields)
      .slice(0, 6)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    return {
      id: `lead-cmp-${row.id}`,
      name: row.name,
      email: row.email || 'no-email@campaign.local',
      phone: row.phone || '',
      qualification: row.qualification || "Bachelor's / Professional",
      program: row.program || 'All Packages',
      source: `Email Campaign · ${row.campaignName}`,
      status: 'New',
      submittedAt: row.submittedAt,
      brochureDownloaded: false,
      notes: row.notes || extraPairs || `Imported from ${row.campaignName}`,
    };
  };

  const handleSyncRowsToLeads = (targetRows: CampaignFormRow[]) => {
    const pendingRows = targetRows.filter((r) => !isRowAlreadyInLeads(r));
    if (pendingRows.length === 0) {
      onShowToast('All selected campaign respondents are already in Enquiries & Leads.');
      return;
    }

    const mappedLeads = pendingRows.map(convertRowToLead);
    const addedCount = onImportLeads(mappedLeads);

    const syncedIds = new Set(pendingRows.map((r) => r.id));
    const updatedBatches = batches.map((b) => ({
      ...b,
      rows: b.rows.map((r) => (syncedIds.has(r.id) ? { ...r, importedToLeads: true } : r)),
    }));
    onUpdateBatches(updatedBatches);

    onShowToast(`Synced ${addedCount} Google Form response(s) to Enquiries & Leads`);
  };

  const handleExportFilteredCsv = () => {
    if (filteredRows.length === 0) {
      onShowToast('No rows available to export.');
      return;
    }
    const exportObjects = filteredRows.map((r) => ({
      Campaign: r.campaignName,
      Submitted: r.submittedAt,
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Qualification: r.qualification || '',
      Program: r.program || '',
      SyncedToLeads: isRowAlreadyInLeads(r) ? 'Yes' : 'No',
      ...r.rawFields,
    }));
    const ws = XLSX.utils.json_to_sheet(exportObjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campaign Responses');
    XLSX.writeFile(wb, `BNC_Email_Campaign_Responses_${new Date().toISOString().slice(0, 10)}.xlsx`);
    onShowToast(`Exported ${filteredRows.length} response(s) to Excel`);
  };

  const unsavedCount = batches.filter((b) => !b.savedAt).length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div
        className={`px-6 lg:px-8 py-5 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
        }`}
      >
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Email Campaigns &amp; Google Forms Sheets
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Upload one or multiple Excel/CSV Google Form exports, save them as named campaign sheets, and sync respondents into Leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {batches.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleSaveAllBatches}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                <span>
                  {unsavedCount > 0 ? `Save Uploaded Sheets (${unsavedCount})` : `Save All Sheets (${batches.length})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAllSavedWorkbook}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer whitespace-nowrap ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
                title="Download all saved campaign sheets as a multi-tab Excel workbook"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>Download All Sheets (.xlsx)</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleExportFilteredCsv}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer whitespace-nowrap ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Filtered</span>
          </button>
        </div>
      </div>

      {/* Unified Horizontal Metric Strip */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-b ${
          theme === 'light'
            ? 'border-slate-200 divide-slate-200 bg-slate-50/40'
            : 'border-slate-800/90 divide-slate-800/90 bg-[#081526]/60'
        }`}
      >
        <div className="px-6 lg:px-8 py-4">
          <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Saved Campaign Sheets</span>
            <FolderOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{batches.length}</div>
          <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Uploaded &amp; stored spreadsheets
          </div>
        </div>

        <div className="px-6 lg:px-8 py-4">
          <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>In Leads Desk</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-sky-700' : 'text-sky-300'}`}>
            {totalSyncedCount}
          </div>
          <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Synced to Leads &amp; CRM
          </div>
        </div>

        <div className="px-6 lg:px-8 py-4">
          <div className={`flex items-center justify-between text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Ready to Sync</span>
            <UserPlus className="w-4 h-4 text-amber-600" />
          </div>
          <div className={`text-2xl font-bold mt-1.5 tabular-nums ${theme === 'light' ? 'text-amber-700' : 'text-[#f1bd5b]'}`}>
            {pendingImportCount}
          </div>
          <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            New respondents awaiting CRM
          </div>
        </div>
      </div>

      {/* Inline Excel Upload Band (Supports Multiple Files & Multi-Tab Workbooks) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`px-6 lg:px-8 py-5 border-b transition-colors ${
          isDragging
            ? 'bg-amber-50/50 border-[#b58b42]'
            : theme === 'light'
            ? 'border-slate-200 bg-white'
            : 'border-slate-800/90 bg-[#07111e]'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 justify-between">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                theme === 'light'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-700/40'
              }`}
            >
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Upload One or Multiple Google Forms Excel / CSV Sheets
              </h3>
              <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Select or drag &amp; drop multiple <code>.xlsx</code>, <code>.xls</code>, or <code>.csv</code> files at once—all non-empty worksheet tabs are imported and ready to save.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 lg:w-auto w-full">
            <input
              type="text"
              value={campaignTagInput}
              onChange={(e) => setCampaignTagInput(e.target.value)}
              placeholder="Campaign Name (optional, e.g. Nov Email Blast)"
              className={`px-3 py-2 rounded-lg border text-xs w-full sm:w-64 focus:outline-none ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-sky-600'
              }`}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isParsing}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#f1bd5b]" />
              <span>{isParsing ? 'Reading Sheets...' : 'Upload Excel / CSV Sheets'}</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Saved Uploaded Sheets Library (Manage, Rename, Save, Download, Filter Each Sheet) */}
      {batches.length > 0 && (
        <div className={`border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'}`}>
          <div
            className={`px-6 lg:px-8 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
              theme === 'light'
                ? 'bg-slate-50/70 border-slate-200'
                : 'bg-[#081526] border-slate-800/90'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                Uploaded Sheets Library ({batches.length})
              </span>
              <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                · Click a sheet to filter rows below, or save/rename individual sheets
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedBatchId('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedBatchId === 'all'
                    ? 'bg-[#102a4e] text-white'
                    : theme === 'light'
                    ? 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                    : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Show All ({totalAllRowsCount})
              </button>
              <button
                type="button"
                onClick={handleSaveAllBatches}
                className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Sheets</span>
              </button>
            </div>
          </div>

          <div className={`divide-y ${theme === 'light' ? 'divide-slate-100' : 'divide-slate-800/70'}`}>
            {batches.map((b) => {
              const isSelected = selectedBatchId === b.id;
              const isEditing = editingBatchId === b.id;
              const batchPendingCount = b.rows.filter((r) => !isRowAlreadyInLeads(r)).length;
              return (
                <div
                  key={b.id}
                  className={`px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? theme === 'light'
                        ? 'bg-sky-50/60'
                        : 'bg-sky-950/30'
                      : theme === 'light'
                      ? 'hover:bg-slate-50/60'
                      : 'hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <FileCheck2 className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${b.savedAt ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2 max-w-md">
                          <input
                            type="text"
                            value={editingBatchName}
                            onChange={(e) => setEditingBatchName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameBatch(b.id);
                              if (e.key === 'Escape') setEditingBatchId(null);
                            }}
                            autoFocus
                            className={`px-2.5 py-1 rounded-md border text-xs font-semibold w-full focus:outline-none ${
                              theme === 'light'
                                ? 'bg-white border-sky-500 text-slate-900'
                                : 'bg-slate-900 border-sky-500 text-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameBatch(b.id)}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBatchId(null)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                              theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBatchId(isSelected ? 'all' : b.id)}
                            className={`text-sm font-bold text-left hover:underline cursor-pointer ${
                              theme === 'light' ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {b.campaignName}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBatchId(b.id);
                              setEditingBatchName(b.campaignName);
                            }}
                            title="Rename campaign sheet"
                            className={`p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer ${
                              theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-200'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <span className={`text-xs tabular-nums font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {b.rows.length} rows
                          </span>
                          <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-700'}>·</span>
                          <span className={`text-xs truncate max-w-[240px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {b.fileName} ({b.sheetName})
                          </span>
                          <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-700'}>·</span>
                          {b.savedAt ? (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Saved {b.savedAt}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              Unsaved draft
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {!b.savedAt && (
                      <button
                        type="button"
                        onClick={() => handleSaveSingleBatch(b.id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Sheet</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedBatchId(isSelected ? 'all' : b.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#102a4e] text-white border-[#102a4e]'
                          : theme === 'light'
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {isSelected ? 'Showing Rows' : 'View Rows'}
                    </button>

                    {batchPendingCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSyncRowsToLeads(b.rows)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          theme === 'light'
                            ? 'bg-amber-50 hover:bg-amber-100 text-[#8d6928] border-amber-200'
                            : 'bg-[#b58b42]/15 hover:bg-[#b58b42]/25 text-[#f1bd5b] border-[#b58b42]/40'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Sync {batchPendingCount} to Leads</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownloadSingleBatchExcel(b)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        theme === 'light'
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                      title="Download this sheet as .xlsx"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Save .xlsx</span>
                    </button>

                    {confirmDeleteBatchId === b.id ? (
                      <div className="inline-flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(b.id)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteBatchId(null)}
                          className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                            theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBatchId(b.id)}
                        title={`Delete ${b.campaignName}`}
                        className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200'
                            : 'bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border-slate-800'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Row */}
      <div
        className={`px-6 lg:px-8 py-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/90'
        }`}
      >
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search respondents by name, email, phone, or Google Form answer..."
            className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none border transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-sky-600'
            }`}
          />
        </div>

        <div className={`inline-flex items-center p-1 rounded-lg ${
          theme === 'light' ? 'bg-slate-100' : 'bg-slate-900 border border-slate-800'
        }`}>
          {(['all', 'pending', 'synced'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSyncFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                syncFilter === st
                  ? theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-slate-800 text-white'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All' : st === 'pending' ? 'Not Synced' : 'Synced'}
            </button>
          ))}
        </div>
      </div>

      {/* Full-Width Responses Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                theme === 'light'
                  ? 'border-slate-200 bg-slate-50/70 text-slate-500'
                  : 'border-slate-800/90 bg-[#081526] text-slate-400'
              }`}
            >
              <th className="py-3 pl-6 lg:pl-8 pr-3">Respondent</th>
              <th className="py-3 px-3">Email &amp; Phone</th>
              <th className="py-3 px-3">Campaign &amp; Program</th>
              <th className="py-3 px-3">Form Highlights</th>
              <th className="py-3 px-3">CRM Sync Status</th>
              <th className="py-3 pl-3 pr-6 lg:pr-8 text-right">Actions</th>
            </tr>
          </thead>
            <tbody className={`divide-y text-xs ${theme === 'light' ? 'divide-slate-100' : 'divide-sky-950/60'}`}>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`py-14 text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {batches.length === 0
                      ? 'No Google Forms Excel sheets uploaded yet. Upload your first campaign .xlsx or .csv file above.'
                      : 'No campaign responses match the current search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const synced = isRowAlreadyInLeads(row);
                  const previewPairs = Object.entries(row.rawFields).slice(0, 3);
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors group ${
                        theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          {row.name}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {row.submittedAt}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 space-y-1">
                        {row.email ? (
                          <div className={`flex items-center gap-1.5 font-mono break-all max-w-[200px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                            <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <a href={`mailto:${row.email}`} className="hover:text-[#b58b42]">
                              {row.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No email column</span>
                        )}
                        {row.phone && (
                          <div className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <a href={`tel:${row.phone}`} className="hover:text-emerald-700 font-semibold">
                              {row.phone}
                            </a>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1 truncate max-w-full">
                          {row.campaignName}
                        </div>
                        <div className={`font-semibold text-[11px] ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                          {row.program || row.qualification || 'Google Form Lead'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 max-w-[240px]">
                        <div className="space-y-0.5">
                          {previewPairs.map(([k, v]) => (
                            <div
                              key={k}
                              className={`text-[11px] truncate ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}
                            >
                              <span className="font-semibold">{k}:</span> {v}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {synced ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              theme === 'light'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Leads</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSyncRowsToLeads([row])}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                              theme === 'light'
                                ? 'bg-amber-50 hover:bg-amber-100 text-[#8d6928] border-amber-300'
                                : 'bg-[#b58b42]/20 hover:bg-[#b58b42]/30 text-[#f1bd5b] border-[#b58b42]/50'
                            }`}
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Add to Leads</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {confirmDeleteRowId === row.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRowId(null)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-slate-700 text-slate-200'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setInspectingRow(row)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                                }`}
                                title="Inspect all Google Form columns"
                              >
                                <Eye className="w-4 h-4 text-sky-600" />
                              </button>

                              {row.phone && (
                                <a
                                  href={`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hello ${row.name}, thank you for filling out the BNC ELEVATE Google Form (${row.campaignName}). How can our admissions desk assist you with CIA coaching?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex p-1.5 rounded-lg border transition-colors ${
                                    theme === 'light'
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                      : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700/50'
                                  }`}
                                  title="WhatsApp Candidate"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRowId(row.id)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  theme === 'light'
                                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                                    : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400'
                                }`}
                                title="Delete Row"
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

      {/* Modal: Full Google Form Response Inspection */}
      {inspectingRow && (
        <div
          onClick={() => setInspectingRow(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-xl my-8 border rounded-3xl shadow-2xl overflow-hidden ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#091729] border-sky-800/80 text-slate-100'
            }`}
          >
            <div className="h-1.5 bg-gradient-to-r from-[#102a4e] via-[#b58b42] to-emerald-600" />
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1d33] border-sky-950'
              }`}
            >
              <div>
                <h3 className="text-base font-black">{inspectingRow.name}</h3>
                <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Campaign: {inspectingRow.campaignName} · {inspectingRow.submittedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingRow(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto text-xs">
              {Object.entries(inspectingRow.rawFields).map(([field, value]) => (
                <div
                  key={field}
                  className={`p-3 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {field}
                  </div>
                  <div className={`font-medium break-words ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`px-6 py-3.5 border-t flex items-center justify-end gap-2 ${
                theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0b1d33]'
              }`}
            >
              {!isRowAlreadyInLeads(inspectingRow) && (
                <button
                  type="button"
                  onClick={() => {
                    handleSyncRowsToLeads([inspectingRow]);
                    setInspectingRow(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] text-white text-xs font-bold cursor-pointer"
                >
                  Add to Enquiries &amp; Leads
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectingRow(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
