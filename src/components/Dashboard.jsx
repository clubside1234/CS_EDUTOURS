import { ArrowRight, Mail, Phone, Users, IndianRupee, MapPinned, Activity } from 'lucide-react';
import { CATEGORIES, CATEGORY_STYLES, STATUSES, STATUS_STYLES } from '../data/constants';
import { CategoryBadge, StatusBadge } from './ui';
import { classNames, formatDate, formatNumber } from '../utils/helpers';
import { countBy, followUpBucket } from '../utils/metrics';

function Panel({ title, icon, action, children, className = '' }) {
  return (
    <section className={classNames('card flex flex-col', className)}>
      <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="text-slate-400">{icon}</span>
        <h3 className="flex-1 text-sm font-semibold text-slate-800">{title}</h3>
        {action}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

function BarList({ data, colorFor, total, onClick }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <button
            type="button"
            onClick={onClick ? () => onClick(d.label) : undefined}
            className={classNames('w-full text-left', onClick && 'group')}
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-medium text-slate-700 group-hover:text-brand-600">{d.label}</span>
              <span className="shrink-0 text-slate-500">
                <strong className="text-slate-800">{d.value}</strong>
                {total ? ` · ${Math.round((d.value / total) * 100)}%` : ''}
                {d.extra ? ` · ${d.extra}` : ''}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={classNames('h-full rounded-full transition-all', colorFor(d.label))} style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatLakh(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${formatNumber(n)}`;
}

export default function Dashboard({ leads, kpis, onOpen, onLog, onGo, onFilterStatus }) {
  const total = leads.length;
  const statusData = STATUSES.map((s) => {
    const items = leads.filter((l) => l.followUpStatus === s);
    return {
      label: s,
      value: items.length,
      extra: `${formatNumber(items.reduce((a, l) => a + (Number(l.expectedStudents) || 0), 0))} std`,
    };
  });

  const catCounts = countBy(leads, 'category');
  const destCounts = Object.entries(countBy(leads, 'preferredLocation'))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const stateCounts = Object.entries(countBy(leads, 'state'))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const upcoming = leads
    .filter((l) => ['overdue', 'today', 'week'].includes(followUpBucket(l)))
    .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate))
    .slice(0, 6);

  const activity = leads
    .flatMap((l) => (l.followUpHistory || []).map((h) => ({ ...h, lead: l })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const CHANNEL_ICON = { Call: Phone, Email: Mail, Meeting: Users };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel
        title="Pipeline by Stage"
        icon={<Activity className="h-4 w-4" />}
        className="lg:col-span-2"
        action={
          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => onGo('pipeline')}>
            Open board <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      >
        <BarList data={statusData} total={total} colorFor={(s) => STATUS_STYLES[s].dot} onClick={onFilterStatus} />
      </Panel>

      <Panel title="Pipeline Value" icon={<IndianRupee className="h-4 w-4" />}>
        <p className="text-3xl font-bold text-slate-900">{formatLakh(kpis.pipelineValue)}</p>
        <p className="mt-1 text-xs text-slate-500">Open leads · expected students × budget per student</p>
        <div className="mt-5">
          <p className="label">Category mix</p>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {CATEGORIES.filter((c) => catCounts[c]).map((c) => (
              <div
                key={c}
                className={CATEGORY_STYLES[c].split(' ')[0]}
                style={{ width: `${(catCounts[c] / Math.max(1, total)) * 100}%` }}
                title={`${c}: ${catCounts[c]}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => catCounts[c]).map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <CategoryBadge category={c} /> {catCounts[c]}
              </span>
            ))}
          </div>
        </div>
      </Panel>

      <Panel
        title="Upcoming Follow-ups"
        icon={<Phone className="h-4 w-4" />}
        className="lg:col-span-2"
        action={
          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => onGo('queue')}>
            Full queue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      >
        {upcoming.length ? (
          <ul className="-my-2 divide-y divide-slate-100">
            {upcoming.map((l) => {
              const b = followUpBucket(l);
              return (
                <li key={l.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className={classNames(
                      'w-20 shrink-0 rounded-md px-2 py-1 text-center text-xs font-semibold',
                      b === 'overdue' ? 'bg-rose-50 text-rose-700' : b === 'today' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {b === 'overdue' ? 'Overdue' : b === 'today' ? 'Today' : formatDate(l.nextFollowUpDate).slice(0, 6)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button onClick={() => onOpen(l)} className="block truncate text-left text-sm font-medium text-slate-800 hover:text-brand-600">
                      {l.schoolName}
                    </button>
                    <p className="truncate text-xs text-slate-500">{l.lastActionTaken}</p>
                  </div>
                  <span className="hidden sm:block">
                    <StatusBadge status={l.followUpStatus} />
                  </span>
                  <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => onLog(l)}>
                    Log
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No follow-ups due in the next 7 days.</p>
        )}
      </Panel>

      <Panel title="Top Destinations" icon={<MapPinned className="h-4 w-4" />}>
        <BarList data={destCounts} total={total} colorFor={() => 'bg-brand-500'} />
      </Panel>

      <Panel title="Recent Activity" icon={<Activity className="h-4 w-4" />} className="lg:col-span-2">
        {activity.length ? (
          <ol className="relative space-y-4 border-l border-slate-200 pl-5">
            {activity.map((a) => {
              const Icon = CHANNEL_ICON[a.channel] || Activity;
              return (
                <li key={`${a.lead.id}-${a.id}`} className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                  <p className="line-clamp-2 text-sm text-slate-700">
                    <button onClick={() => onOpen(a.lead)} className="font-semibold hover:text-brand-600">
                      {a.lead.schoolName}
                    </button>{' '}
                    — {a.notes.split('\n')[0]}
                  </p>
                  <p className="text-xs text-slate-400">
                    {a.channel} · {formatDate(a.date)}
                    {a.emailSent && ' · Email sent'}
                  </p>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">No interactions logged yet.</p>
        )}
      </Panel>

      <Panel title="Leads by State" icon={<MapPinned className="h-4 w-4" />}>
        <BarList data={stateCounts} total={total} colorFor={() => 'bg-violet-500'} />
      </Panel>
    </div>
  );
}
