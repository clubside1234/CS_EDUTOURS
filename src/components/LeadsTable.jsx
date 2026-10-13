import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, MessageSquarePlus, Trash2, Search, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';
import { CategoryBadge, EmptyState } from './ui';
import { STATUSES, STATUS_STYLES } from '../data/constants';
import { classNames, extractEmail, extractPhone, formatDate, formatNumber, formatCurrency } from '../utils/helpers';
import { followUpBucket } from '../utils/metrics';

const CATEGORY_RANK = { 'A+': 0, A: 1, 'B+': 2, B: 3, 'C+': 4, C: 5 };

const COLUMNS = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'schoolName', label: 'School', sortable: true },
  { key: 'category', label: 'Cat.', sortable: true, sortValue: (l) => CATEGORY_RANK[l.category] ?? 9 },
  { key: 'place', label: 'Location', sortable: true },
  { key: 'principalName', label: 'Principal / Contact', sortable: true },
  { key: 'expectedStudents', label: 'Students', sortable: true, numeric: true },
  { key: 'budgetPerStudent', label: 'Budget/Std', sortable: true, numeric: true },
  { key: 'preferredLocation', label: 'Destination / Window', sortable: true },
  { key: 'followUpStatus', label: 'Status', sortable: true, sortValue: (l) => STATUSES.indexOf(l.followUpStatus) },
  { key: 'nextFollowUpDate', label: 'Next Follow-up', sortable: true },
];

const PAGE_SIZE = 12;

function NextFollowUp({ lead }) {
  const bucket = followUpBucket(lead);
  if (bucket === 'closed') return <span className="text-xs text-slate-400">Closed</span>;
  if (!lead.nextFollowUpDate) return <span className="text-xs text-slate-400">Not set</span>;
  const tone = { overdue: 'text-rose-600 font-semibold', today: 'text-amber-600 font-semibold' }[bucket] || 'text-slate-600';
  return (
    <span className={classNames('whitespace-nowrap text-xs', tone)}>
      {bucket === 'overdue' ? 'Overdue · ' : bucket === 'today' ? 'Today · ' : ''}
      {formatDate(lead.nextFollowUpDate)}
    </span>
  );
}

export default function LeadsTable({ leads, onOpen, onEdit, onLog, onDelete, onStatusChange, onAdd }) {
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sort.key);
    const get = col?.sortValue || ((l) => l[sort.key]);
    const arr = [...leads].sort((a, b) => {
      let va = get(a);
      let vb = get(b);
      if (col?.numeric) {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      } else if (typeof va === 'string' || typeof vb === 'string') {
        // Push empties to the bottom regardless of direction
        if (!va && vb) return 1;
        if (va && !vb) return -1;
        return String(va).localeCompare(String(vb)) * (sort.dir === 'asc' ? 1 : -1);
      }
      return (va - vb) * (sort.dir === 'asc' ? 1 : -1);
    });
    return arr;
  }, [leads, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'date' ? 'desc' : 'asc' }));

  if (!leads.length) {
    return (
      <div className="card">
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No leads match"
          message="Try clearing the search or filters, or add a new school lead."
          action={
            <button className="btn-primary" onClick={onAdd}>
              Add Lead
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={classNames(
                    'whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                    c.numeric && 'text-right',
                  )}
                >
                  <button
                    onClick={() => toggleSort(c.key)}
                    className={classNames('inline-flex items-center gap-1 hover:text-slate-800', c.numeric && 'flex-row-reverse')}
                  >
                    {c.label}
                    {sort.key === c.key ? (
                      sort.dir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((l) => {
              const email = extractEmail(l.contactDetails);
              const phone = extractPhone(l.contactDetails);
              return (
                <tr key={l.id} className="group hover:bg-brand-50/40">
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">{formatDate(l.date)}</td>
                  <td className="max-w-[240px] px-3 py-2.5">
                    <button onClick={() => onOpen(l)} className="block truncate text-left font-semibold text-slate-800 hover:text-brand-600">
                      {l.schoolName}
                    </button>
                    <p className="truncate text-xs text-slate-500" title={l.lastActionTaken}>
                      {l.lastActionTaken || '—'}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <CategoryBadge category={l.category} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <p className="text-slate-700">{l.place || '—'}</p>
                    <p className="text-xs text-slate-500">{l.state}</p>
                  </td>
                  <td className="max-w-[220px] px-3 py-2.5">
                    <p className="truncate text-slate-700">{l.principalName || '—'}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {phone && (
                        <a href={`tel:${phone}`} className="inline-flex items-center gap-1 hover:text-brand-600" title={`Call ${phone}`}>
                          <Phone className="h-3 w-3" /> {phone}
                        </a>
                      )}
                      {email && (
                        <a href={`mailto:${email}`} className="hover:text-brand-600" title={email}>
                          <Mail className="h-3 w-3" />
                        </a>
                      )}
                      {!phone && !email && <span className="truncate">{l.contactDetails || '—'}</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <p className="font-semibold text-slate-800">{formatNumber(l.expectedStudents)}</p>
                    <p className="text-xs text-slate-400">of {formatNumber(l.totalStrength)}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{formatCurrency(l.budgetPerStudent)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <p className="text-slate-700">{l.preferredLocation || '—'}</p>
                    <p className="text-xs text-slate-500">{l.preferredTravelTime}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={l.followUpStatus}
                      onChange={(e) => onStatusChange(l, e.target.value)}
                      className={classNames(
                        'cursor-pointer rounded-full border-0 py-0.5 pl-2 pr-7 text-xs font-medium ring-1 ring-inset focus:ring-2 focus:ring-brand-300',
                        STATUS_STYLES[l.followUpStatus]?.badge,
                      )}
                      aria-label={`Status for ${l.schoolName}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <NextFollowUp lead={l} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <div className="inline-flex gap-0.5">
                      <button onClick={() => onLog(l)} className="rounded-md p-1.5 text-brand-600 hover:bg-brand-50" title="Log follow-up / send email">
                        <MessageSquarePlus className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(l)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" title="Edit lead">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(l)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete lead">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
        <span>
          {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2 py-1" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Page {current} / {pages}
          </span>
          <button className="btn-ghost px-2 py-1" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
