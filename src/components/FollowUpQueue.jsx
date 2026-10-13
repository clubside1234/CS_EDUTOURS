import { AlertCircle, CalendarCheck, CalendarClock, CalendarPlus, MessageSquarePlus, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { CategoryBadge, EmptyState, StatusBadge } from './ui';
import { classNames, daysBetween, extractEmail, extractPhone, formatDate, formatNumber, today } from '../utils/helpers';
import { followUpBucket } from '../utils/metrics';

const GROUPS = [
  { id: 'overdue', title: 'Overdue', icon: AlertCircle, tone: 'text-rose-600 bg-rose-50' },
  { id: 'today', title: 'Due Today', icon: CalendarCheck, tone: 'text-amber-600 bg-amber-50' },
  { id: 'week', title: 'Next 7 Days', icon: CalendarClock, tone: 'text-brand-600 bg-brand-50' },
  { id: 'later', title: 'Later', icon: CalendarClock, tone: 'text-slate-600 bg-slate-100' },
  { id: 'unscheduled', title: 'No Follow-up Scheduled', icon: CalendarPlus, tone: 'text-slate-600 bg-slate-100' },
];

function QueueRow({ lead, onOpen, onLog, onEmail }) {
  const t = today();
  const diff = lead.nextFollowUpDate ? daysBetween(t, lead.nextFollowUpDate) : null;
  const phone = extractPhone(lead.contactDetails);
  const email = extractEmail(lead.contactDetails);
  const lastLog = lead.followUpHistory?.[0];
  return (
    <div className="flex flex-col gap-3 p-4 hover:bg-slate-50 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onOpen(lead)} className="truncate text-left font-semibold text-slate-800 hover:text-brand-600">
            {lead.schoolName}
          </button>
          <CategoryBadge category={lead.category} />
          <StatusBadge status={lead.followUpStatus} />
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {lead.principalName} · {lead.place}, {lead.state} · {formatNumber(lead.expectedStudents)} students → {lead.preferredLocation}
        </p>
        <p className="mt-1 line-clamp-1 text-xs text-slate-600">
          <span className="font-medium text-slate-500">Last action:</span> {lead.lastActionTaken || '—'}
          {lastLog && <span className="text-slate-400"> ({formatDate(lastLog.date)})</span>}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {diff !== null && (
          <span
            className={classNames(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              diff < 0 ? 'bg-rose-100 text-rose-700' : diff === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
            )}
          >
            {diff < 0 ? `${-diff}d overdue` : diff === 0 ? 'Today' : `in ${diff}d`} · {formatDate(lead.nextFollowUpDate)}
          </span>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="btn-secondary px-2.5 py-1.5" title={`Call ${phone}`}>
            <Phone className="h-4 w-4" />
          </a>
        )}
        <button onClick={() => onEmail(lead)} className="btn-secondary px-2.5 py-1.5" title={email ? `Email ${email}` : 'Compose email'}>
          <Mail className="h-4 w-4" />
        </button>
        <button onClick={() => onLog(lead)} className="btn-primary py-1.5">
          <MessageSquarePlus className="h-4 w-4" /> Log Follow-Up
        </button>
      </div>
    </div>
  );
}

export default function FollowUpQueue({ leads, onOpen, onLog, onEmail }) {
  const open = leads.filter((l) => followUpBucket(l) !== 'closed');
  const grouped = GROUPS.map((g) => ({
    ...g,
    items: open
      .filter((l) => followUpBucket(l) === g.id)
      .sort((a, b) => (a.nextFollowUpDate || a.date).localeCompare(b.nextFollowUpDate || b.date)),
  })).filter((g) => g.items.length);

  if (!open.length) {
    return (
      <div className="card">
        <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="All caught up!" message="No open leads match the current filters." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((g) => (
        <section key={g.id} className="card overflow-hidden">
          <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <span className={classNames('rounded-lg p-1.5', g.tone)}>
              <g.icon className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-800">{g.title}</h3>
            <span className="rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">{g.items.length}</span>
          </header>
          <div className="divide-y divide-slate-100">
            {g.items.map((l) => (
              <QueueRow key={l.id} lead={l} onOpen={onOpen} onLog={onLog} onEmail={onEmail} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
