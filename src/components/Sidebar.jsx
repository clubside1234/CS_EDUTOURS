import { LayoutDashboard, Table2, KanbanSquare, BellRing, GraduationCap, RotateCcw, X, HardDrive } from 'lucide-react';
import { classNames } from '../utils/helpers';

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads Table', icon: Table2 },
  { id: 'pipeline', label: 'Pipeline Board', icon: KanbanSquare },
  { id: 'queue', label: 'Follow-Up Queue', icon: BellRing },
];

export default function Sidebar({ view, onNavigate, dueCount, open, onClose, onReset, storageOk, totalLeads }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="rounded-xl bg-brand-600 p-2 text-white shadow-lg shadow-brand-900/40">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold leading-tight text-white">EduTours</p>
            <p className="text-xs text-slate-400">Institutional Sales CRM</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={classNames(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                view === id ? 'bg-brand-600 text-white shadow' : 'hover:bg-slate-800 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{label}</span>
              {id === 'queue' && dueCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{dueCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-800 px-5 py-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <HardDrive className="h-4 w-4" />
            <span>
              {storageOk ? 'Auto-saved locally' : 'Storage unavailable'} · {totalLeads} leads
            </span>
          </div>
          <button onClick={onReset} className="flex items-center gap-2 text-slate-400 hover:text-white">
            <RotateCcw className="h-4 w-4" /> Reset demo data
          </button>
        </div>
      </aside>
    </>
  );
}
