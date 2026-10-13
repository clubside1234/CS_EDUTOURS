import { Filter, X } from 'lucide-react';
import { CATEGORIES, STATUSES } from '../data/constants';

export const EMPTY_FILTERS = { status: '', category: '', travel: '', state: '' };

export default function FilterBar({ filters, onChange, travelOptions, stateOptions, resultCount, totalCount, hideStatus }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });
  const active = Object.entries(filters).filter(([k, v]) => v && !(hideStatus && k === 'status')).length;

  return (
    <div className="card flex flex-wrap items-center gap-2 p-3">
      <div className="flex items-center gap-2 pr-1 text-sm font-medium text-slate-600">
        <Filter className="h-4 w-4" /> Filters
      </div>
      {!hideStatus && (
        <select className="input w-full sm:w-auto" value={filters.status} onChange={set('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
      <select className="input w-[calc(50%-0.25rem)] sm:w-auto" value={filters.category} onChange={set('category')} aria-label="Filter by category">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            Category {c}
          </option>
        ))}
      </select>
      <select className="input w-[calc(50%-0.25rem)] sm:w-auto" value={filters.travel} onChange={set('travel')} aria-label="Filter by travel window">
        <option value="">All travel windows</option>
        {travelOptions.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <select className="input w-full sm:w-auto" value={filters.state} onChange={set('state')} aria-label="Filter by state">
        <option value="">All states</option>
        {stateOptions.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      {active > 0 && (
        <button className="btn-ghost text-xs" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="h-3.5 w-3.5" /> Clear ({active})
        </button>
      )}
      <span className="ml-auto text-xs text-slate-500">
        Showing <strong className="text-slate-700">{resultCount}</strong> of {totalCount}
      </span>
    </div>
  );
}
