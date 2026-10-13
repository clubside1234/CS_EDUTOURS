import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Menu, Plus, Search, UploadCloud, Download, Table2, KanbanSquare, X } from 'lucide-react';
import Sidebar, { NAV } from './components/Sidebar';
import KPICards from './components/KPICards';
import FilterBar, { EMPTY_FILTERS } from './components/FilterBar';
import Dashboard from './components/Dashboard';
import LeadsTable from './components/LeadsTable';
import PipelineBoard from './components/PipelineBoard';
import FollowUpQueue from './components/FollowUpQueue';
import LeadFormModal from './components/LeadFormModal';
import BulkUploadModal from './components/BulkUploadModal';
import LeadDrawer from './components/LeadDrawer';
import { ConfirmDialog } from './components/ui';
import { useToast } from './components/Toast';
import { useLeads } from './hooks';
import { TRAVEL_WINDOWS } from './data/constants';
import { computeKPIs, isDue } from './utils/metrics';
import { downloadFile, leadsToCSV } from './utils/csv';
import { classNames, today } from './utils/helpers';

const VIEW_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Snapshot of your institutional sales pipeline' },
  leads: { title: 'Leads', subtitle: 'All schools and institutions in your master sheet' },
  pipeline: { title: 'Pipeline Board', subtitle: 'Drag cards between stages or use the quick stage changer' },
  queue: { title: 'Follow-Up Queue', subtitle: 'Who to call or email next, ordered by urgency' },
};

export default function App() {
  const toast = useToast();
  const store = useLeads();
  const { leads } = store;

  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [formState, setFormState] = useState({ open: false, lead: null });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [drawer, setDrawer] = useState({ id: null, tab: 'overview' });
  const [confirm, setConfirm] = useState(null);

  const drawerLead = leads.find((l) => l.id === drawer.id) || null;

  const travelOptions = useMemo(
    () => [...new Set([...TRAVEL_WINDOWS, ...leads.map((l) => l.preferredTravelTime).filter(Boolean)])],
    [leads],
  );
  const stateOptions = useMemo(() => [...new Set(leads.map((l) => l.state).filter(Boolean))].sort(), [leads]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return leads.filter((l) => {
      if (q) {
        const hay = [l.schoolName, l.principalName, l.place, l.state, l.contactDetails].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.status && view !== 'pipeline' && l.followUpStatus !== filters.status) return false;
      if (filters.category && l.category !== filters.category) return false;
      if (filters.travel && l.preferredTravelTime !== filters.travel) return false;
      if (filters.state && l.state !== filters.state) return false;
      return true;
    });
  }, [leads, deferredSearch, filters, view]);

  const kpis = useMemo(() => computeKPIs(filtered), [filtered]);
  const dueCount = useMemo(() => leads.filter(isDue).length, [leads]);

  const navigate = (id) => {
    setView(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- actions ----------
  const openLead = useCallback((lead, tab = 'overview') => setDrawer({ id: lead.id, tab }), []);
  const closeDrawer = useCallback(() => setDrawer({ id: null, tab: 'overview' }), []);
  const openAdd = () => setFormState({ open: true, lead: null });
  const openEdit = useCallback((lead) => setFormState({ open: true, lead }), []);
  const closeForm = useCallback(() => setFormState((s) => ({ ...s, open: false })), []);

  const saveLead = (data) => {
    if (formState.lead) {
      store.updateLead(formState.lead.id, data);
      toast('Lead updated', 'success', data.schoolName);
    } else {
      const created = store.addLead(data);
      toast('Lead added', 'success', `${created.schoolName} · ${created.followUpStatus}`);
    }
    closeForm();
  };

  const changeStatus = useCallback(
    (lead, status) => {
      if (lead.followUpStatus === status) return;
      store.setStatus(lead.id, status);
      toast('Status updated', status === 'Closed - Won' ? 'success' : 'info', `${lead.schoolName} → ${status}`);
    },
    [store, toast],
  );

  const logFollowUp = useCallback(
    (lead, entry, extra = {}, isEmail = false) => {
      const patch = { ...extra };
      if (isEmail && lead.followUpStatus === 'New Lead' && !patch.followUpStatus) patch.followUpStatus = 'Follow up in process';
      store.logFollowUp(lead.id, entry, patch);
      if (isEmail) toast('Follow-up email logged', 'success', 'Your email client was opened with the pre-filled message.');
      else toast('Follow-up logged', 'success', `${entry.channel} · ${lead.schoolName}`);
      if (patch.followUpStatus && patch.followUpStatus !== lead.followUpStatus) {
        toast('Status updated', 'info', `${lead.schoolName} → ${patch.followUpStatus}`);
      }
    },
    [store, toast],
  );

  const askDelete = useCallback(
    (lead) =>
      setConfirm({
        title: 'Delete lead?',
        message: `“${lead.schoolName}” and its ${lead.followUpHistory?.length || 0} logged interaction(s) will be permanently removed.`,
        confirmLabel: 'Delete',
        danger: true,
        onConfirm: () => {
          store.deleteLead(lead.id);
          if (drawer.id === lead.id) closeDrawer();
          toast('Lead deleted', 'warning', lead.schoolName);
        },
      }),
    [store, toast, drawer.id, closeDrawer],
  );

  const askReset = () =>
    setConfirm({
      title: 'Reset demo data?',
      message: 'This replaces all current leads with the sample dataset. Export to CSV first if you want to keep your data.',
      confirmLabel: 'Reset',
      danger: true,
      onConfirm: () => {
        store.resetDemo();
        closeDrawer();
        toast('Demo data restored', 'info');
      },
    });

  const handleImport = (rows) => {
    const n = store.addMany(rows);
    setBulkOpen(false);
    toast(`${n} lead${n === 1 ? '' : 's'} imported`, 'success', 'Saved to your browser storage.');
  };

  const exportCSV = () => {
    if (!filtered.length) {
      toast('Nothing to export', 'warning', 'No leads match the current filters.');
      return;
    }
    downloadFile(`edutours_leads_${today()}.csv`, leadsToCSV(filtered));
    const scoped = filtered.length !== leads.length;
    toast('Export ready', 'success', `${filtered.length} ${scoped ? 'filtered ' : ''}lead(s) exported to CSV.`);
  };

  const meta = VIEW_META[view];
  const showTableToggle = view === 'leads' || view === 'pipeline';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        view={view}
        onNavigate={navigate}
        dueCount={dueCount}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onReset={askReset}
        storageOk={store.storageOk}
        totalLeads={leads.length}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <button className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search school, principal, city or state…"
                className="input pl-9 pr-8"
                aria-label="Search leads"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="btn-secondary hidden md:inline-flex" onClick={exportCSV} title="Export filtered leads to CSV">
                <Download className="h-4 w-4" /> <span className="hidden xl:inline">Export to CSV</span>
              </button>
              <button className="btn-secondary" onClick={() => setBulkOpen(true)} title="Bulk upload CSV / Excel">
                <UploadCloud className="h-4 w-4" /> <span className="hidden xl:inline">Bulk Upload CSV</span>
              </button>
              <button className="btn-primary" onClick={openAdd}>
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Lead</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-4 px-4 py-5 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{meta.title}</h1>
              <p className="text-sm text-slate-500">{meta.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {showTableToggle && (
                <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                  {[
                    { id: 'leads', label: 'List', icon: Table2 },
                    { id: 'pipeline', label: 'Kanban', icon: KanbanSquare },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={classNames(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition',
                        view === id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100',
                      )}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              )}
              <button className="btn-secondary md:hidden" onClick={exportCSV}>
                <Download className="h-4 w-4" /> CSV
              </button>
            </div>
          </div>

          <KPICards kpis={kpis} onOpenQueue={() => navigate('queue')} />

          <FilterBar
            filters={filters}
            onChange={setFilters}
            travelOptions={travelOptions}
            stateOptions={stateOptions}
            resultCount={filtered.length}
            totalCount={leads.length}
            hideStatus={view === 'pipeline'}
          />

          {view === 'dashboard' && (
            <Dashboard
              leads={filtered}
              kpis={kpis}
              onOpen={openLead}
              onLog={(l) => openLead(l, 'log')}
              onGo={navigate}
              onFilterStatus={(status) => {
                setFilters((f) => ({ ...f, status }));
                navigate('leads');
              }}
            />
          )}
          {view === 'leads' && (
            <LeadsTable
              leads={filtered}
              onOpen={openLead}
              onEdit={openEdit}
              onLog={(l) => openLead(l, 'log')}
              onDelete={askDelete}
              onStatusChange={changeStatus}
              onAdd={openAdd}
            />
          )}
          {view === 'pipeline' && (
            <PipelineBoard leads={filtered} onOpen={openLead} onLog={(l) => openLead(l, 'log')} onStatusChange={changeStatus} />
          )}
          {view === 'queue' && (
            <FollowUpQueue leads={filtered} onOpen={openLead} onLog={(l) => openLead(l, 'log')} onEmail={(l) => openLead(l, 'email')} />
          )}
        </main>

        <footer className="px-6 pb-6 text-center text-xs text-slate-400">
          EduTours CRM · data stored locally in this browser · {NAV.length} workspaces
        </footer>
      </div>

      <LeadFormModal open={formState.open} lead={formState.lead} onClose={closeForm} onSave={saveLead} existingLeads={leads} />
      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} onImport={handleImport} existingLeads={leads} />
      {drawerLead && (
        <LeadDrawer
          lead={drawerLead}
          initialTab={drawer.tab}
          onClose={closeDrawer}
          onEdit={openEdit}
          onDelete={askDelete}
          onStatusChange={changeStatus}
          onLog={logFollowUp}
          toast={toast}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.onConfirm();
          setConfirm(null);
        }}
      />
    </div>
  );
}
