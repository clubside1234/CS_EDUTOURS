import { useEffect, useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, AlertTriangle, XCircle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { CSV_TEMPLATE_HEADERS } from '../data/constants';
import { downloadTemplate, readSpreadsheetFile, rowsToLeads } from '../utils/csv';
import { CategoryBadge, Modal, StatusBadge } from './ui';
import { classNames, formatDate, formatNumber } from '../utils/helpers';

export default function BulkUploadModal({ open, onClose, onImport, existingLeads }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [excluded, setExcluded] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setPreview(null);
      setError('');
      setExcluded(new Set());
    }
  }, [open]);

  const existingKeys = new Set(existingLeads.map((l) => `${l.schoolName}|${l.place}`.toLowerCase().trim()));

  const handleFile = async (f) => {
    if (!f) return;
    if (!/\.(csv|xlsx|xls)$/i.test(f.name)) {
      setError('Unsupported file type. Please upload a .csv, .xlsx or .xls file.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rows = await readSpreadsheetFile(f);
      if (rows.length < 2) throw new Error('The file has no data rows below the header.');
      const result = rowsToLeads(rows);
      if (!result.leads.some((l) => l.schoolName)) {
        throw new Error('Could not find a "School Name" column. Please use the sample template headers.');
      }
      const seen = new Set();
      result.leads = result.leads.map((l) => {
        const key = `${l.schoolName}|${l.place}`.toLowerCase().trim();
        const dup = existingKeys.has(key) || seen.has(key);
        seen.add(key);
        return { ...l, _duplicate: dup && Boolean(l.schoolName) };
      });
      setFile(f);
      setPreview(result);
      setExcluded(new Set());
    } catch (err) {
      setError(err.message || 'Failed to read file.');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const leads = preview?.leads || [];
  const importable = leads.filter((l) => !l._errors.length && !excluded.has(l.id) && !(skipDuplicates && l._duplicate));
  const invalidCount = leads.filter((l) => l._errors.length).length;
  const dupCount = leads.filter((l) => l._duplicate).length;
  const warnCount = leads.filter((l) => l._warnings.length).length;

  const toggleRow = (id) =>
    setExcluded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<FileSpreadsheet className="h-5 w-5" />}
      title="Bulk Upload Leads"
      subtitle="Import from the Institutional Sales Master Sheet (CSV or Excel)"
      footer={
        <>
          {preview && (
            <button className="btn-ghost mr-auto" onClick={() => { setPreview(null); setFile(null); }}>
              <RefreshCcw className="h-4 w-4" /> Choose another file
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={!importable.length} onClick={() => onImport(importable)}>
            <UploadCloud className="h-4 w-4" /> Import {importable.length} lead{importable.length === 1 ? '' : 's'}
          </button>
        </>
      }
    >
      {!preview ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            className={classNames(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition',
              dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50',
            )}
          >
            <UploadCloud className={classNames('h-10 w-10', dragOver ? 'text-brand-600' : 'text-slate-400')} />
            <p className="mt-3 text-sm font-semibold text-slate-700">{loading ? 'Reading file…' : 'Drop your CSV / Excel file here, or click to browse'}</p>
            <p className="mt-1 text-xs text-slate-500">Supports .csv, .xlsx and .xls · First row must contain headers</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Expected column headers</p>
                <p className="text-xs text-slate-500">Column order doesn’t matter; common variations are auto-mapped.</p>
              </div>
              <button className="btn-secondary" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> Download sample template
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CSV_TEMPLATE_HEADERS.map((h) => (
                <code key={h} className="rounded bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                  {h}
                </code>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              <FileSpreadsheet className="h-4 w-4" /> {file?.name}
            </span>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              {importable.length} ready
            </span>
            {invalidCount > 0 && <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-rose-700">{invalidCount} invalid (skipped)</span>}
            {warnCount > 0 && <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700">{warnCount} with warnings</span>}
            {dupCount > 0 && (
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-slate-600">
                <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} className="rounded border-slate-300 text-brand-600" />
                Skip {dupCount} duplicate{dupCount > 1 ? 's' : ''}
              </label>
            )}
          </div>
          {preview.unmappedHeaders.length > 0 && (
            <p className="text-xs text-amber-700">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
              Ignored columns: {preview.unmappedHeaders.join(', ')}
            </p>
          )}
          <div className="scrollbar-thin max-h-[55vh] overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-left font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">Include</th>
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">School</th>
                  <th className="px-2 py-2">Cat.</th>
                  <th className="px-2 py-2">Place / State</th>
                  <th className="px-2 py-2">Principal</th>
                  <th className="px-2 py-2">Contact</th>
                  <th className="px-2 py-2">Destination</th>
                  <th className="px-2 py-2 text-right">Strength</th>
                  <th className="px-2 py-2 text-right">Budget</th>
                  <th className="px-2 py-2">Travel</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leads.map((l, i) => {
                  const invalid = l._errors.length > 0;
                  const skippedDup = skipDuplicates && l._duplicate;
                  const included = !invalid && !skippedDup && !excluded.has(l.id);
                  return (
                    <tr key={l.id} className={classNames(invalid ? 'bg-rose-50/60' : !included ? 'bg-slate-50 text-slate-400' : '')}>
                      <td className="px-2 py-1.5">
                        <input
                          type="checkbox"
                          disabled={invalid || skippedDup}
                          checked={included}
                          onChange={() => toggleRow(l.id)}
                          className="rounded border-slate-300 text-brand-600"
                          aria-label={`Include row ${i + 1}`}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-slate-400">{i + 2}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{formatDate(l.date)}</td>
                      <td className="max-w-[200px] truncate px-2 py-1.5 font-medium">{l.schoolName || <em className="text-rose-600">missing</em>}</td>
                      <td className="px-2 py-1.5">
                        <CategoryBadge category={l.category} />
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5">
                        {l.place}
                        {l.state && `, ${l.state}`}
                      </td>
                      <td className="max-w-[140px] truncate px-2 py-1.5">{l.principalName}</td>
                      <td className="max-w-[160px] truncate px-2 py-1.5">{l.contactDetails}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{l.preferredLocation}</td>
                      <td className="px-2 py-1.5 text-right">{formatNumber(l.totalStrength)}</td>
                      <td className="px-2 py-1.5 text-right">{l.budgetPerStudent ? `₹${formatNumber(l.budgetPerStudent)}` : '—'}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{l.preferredTravelTime}</td>
                      <td className="px-2 py-1.5">
                        <StatusBadge status={l.followUpStatus} />
                      </td>
                      <td className="min-w-[160px] px-2 py-1.5">
                        {l._errors.map((m) => (
                          <p key={m} className="text-rose-600">
                            {m}
                          </p>
                        ))}
                        {l._duplicate && <p className="text-amber-600">Duplicate school</p>}
                        {l._warnings.map((m) => (
                          <p key={m} className="text-amber-600">
                            {m}
                          </p>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
