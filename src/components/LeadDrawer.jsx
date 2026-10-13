import { useEffect, useMemo, useState } from 'react';
import {
  Info, MessageSquarePlus, Mail, History, Phone, Users, Send, Copy, Pencil, Trash2, MapPin, CalendarClock, IndianRupee, Plane, School, Check,
} from 'lucide-react';
import { CHANNELS, STATUSES } from '../data/constants';
import { EMAIL_TEMPLATES, PLACEHOLDERS, fillTemplate } from '../data/emailTemplates';
import { CategoryBadge, Drawer, Field, StatusBadge, Tabs } from './ui';
import { addDays, classNames, extractEmail, extractPhone, formatCurrency, formatDate, formatNumber, today } from '../utils/helpers';

const CHANNEL_ICON = { Call: Phone, Meeting: Users, Email: Mail };
const QUICK_DAYS = [
  { label: 'Tomorrow', days: 1 },
  { label: '+3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
];

function Detail({ icon, label, children }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm text-slate-800">{children || '—'}</div>
      </div>
    </div>
  );
}

function DateQuickPick({ value, onChange, label, allowClear }) {
  const t = today();
  return (
    <Field label={label}>
      <input type="date" className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_DAYS.map((q) => {
          const d = addDays(t, q.days);
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => onChange(d)}
              className={classNames(
                'rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition',
                value === d ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {q.label}
            </button>
          );
        })}
        {allowClear && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={classNames(
              'rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
              !value ? 'bg-slate-700 text-white ring-slate-700' : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50',
            )}
          >
            None
          </button>
        )}
      </div>
    </Field>
  );
}

function OverviewTab({ lead }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Detail icon={<School className="h-4 w-4" />} label="Principal / Director">
          {lead.principalName}
        </Detail>
        <Detail icon={<Phone className="h-4 w-4" />} label="Contact">
          <span className="break-words">{lead.contactDetails}</span>
        </Detail>
        <Detail icon={<MapPin className="h-4 w-4" />} label="Location">
          {lead.place}
          {lead.state ? `, ${lead.state}` : ''}
        </Detail>
        <Detail icon={<CalendarClock className="h-4 w-4" />} label="Date of visit / entry">
          {formatDate(lead.date)}
        </Detail>
        <Detail icon={<Users className="h-4 w-4" />} label="Students">
          {formatNumber(lead.expectedStudents)} expected / {formatNumber(lead.totalStrength)} total
        </Detail>
        <Detail icon={<IndianRupee className="h-4 w-4" />} label="Fees · Budget per student">
          {lead.fees || '—'} · {formatCurrency(lead.budgetPerStudent)}
        </Detail>
        <Detail icon={<Plane className="h-4 w-4" />} label="Preferred destination">
          {lead.preferredLocation}
        </Detail>
        <Detail icon={<CalendarClock className="h-4 w-4" />} label="Preferred travel time">
          {lead.preferredTravelTime}
        </Detail>
      </div>
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="label">Last action taken</p>
        <p className="text-sm text-slate-700">{lead.lastActionTaken || '—'}</p>
        <p className="label mt-3">Next follow-up</p>
        <p className="text-sm text-slate-700">{lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'Not scheduled'}</p>
        <p className="label mt-3">Remarks</p>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{lead.remarks || '—'}</p>
      </div>
      <p className="text-xs text-slate-400">
        Estimated deal value: <strong className="text-slate-600">{formatCurrency((lead.expectedStudents || 0) * (lead.budgetPerStudent || 0))}</strong>
      </p>
    </div>
  );
}

function LogTab({ lead, onSubmit }) {
  const [date, setDate] = useState(today());
  const [channel, setChannel] = useState('Call');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(lead.followUpStatus);
  const [next, setNext] = useState(addDays(today(), 3));
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please add a short note about this interaction.');
      return;
    }
    if (date > today()) {
      setError('Interaction date cannot be in the future. Use “Next follow-up” to schedule.');
      return;
    }
    onSubmit({ date, channel, notes: notes.trim(), emailSent: false }, { followUpStatus: status, nextFollowUpDate: next });
    setNotes('');
    setError('');
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DateQuickPick label="Interaction date" value={date} onChange={setDate} />
      <Field label="Channel">
        <div className="grid grid-cols-3 gap-2">
          {CHANNELS.map((c) => {
            const Icon = CHANNEL_ICON[c];
            return (
              <button
                type="button"
                key={c}
                onClick={() => setChannel(c)}
                className={classNames(
                  'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  channel === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                <Icon className="h-4 w-4" /> {c}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Notes" required error={error}>
        <textarea
          rows={4}
          className={classNames('input', error && 'input-error')}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (error) setError('');
          }}
          placeholder="What was discussed? Any objections, decision makers, next steps…"
          autoFocus
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Update status">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <DateQuickPick label="Next follow-up" value={next} onChange={setNext} allowClear />
      <button type="submit" className="btn-primary w-full">
        <MessageSquarePlus className="h-4 w-4" /> Save Follow-Up Log
      </button>
    </form>
  );
}

function EmailTab({ lead, onSent, toast }) {
  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
  const [to, setTo] = useState(extractEmail(lead.contactDetails));
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [next, setNext] = useState(addDays(today(), 3));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSubject(template.subject);
    setBody(template.body);
  }, [template]);

  const finalSubject = fillTemplate(subject, lead);
  const finalBody = fillTemplate(body, lead);
  const mailto = `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;
  const toValid = !to.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim());

  const send = () => {
    if (!toValid) return;
    // Trigger the user's default mail client, then record the interaction.
    window.location.href = mailto;
    onSent(template, { to: to.trim(), subject: finalSubject }, next);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${finalSubject}\n\n${finalBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('Clipboard unavailable', 'error');
    }
  };

  const insert = (ph) => setBody((b) => `${b}${b.endsWith(' ') || !b ? '' : ' '}${ph}`);

  return (
    <div className="space-y-4">
      <Field label="Template">
        <div className="grid gap-2">
          {EMAIL_TEMPLATES.map((t) => (
            <label
              key={t.id}
              className={classNames(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition',
                templateId === t.id ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <input type="radio" name="template" checked={templateId === t.id} onChange={() => setTemplateId(t.id)} className="text-brand-600" />
              <Mail className="h-4 w-4 opacity-60" /> {t.name}
            </label>
          ))}
        </div>
      </Field>
      <Field label="To" error={!toValid ? 'Enter a valid email address' : ''} hint={!to ? 'No email on file — you can type one or fill it in your mail client.' : ''}>
        <input className={classNames('input', !toValid && 'input-error')} value={to} onChange={(e) => setTo(e.target.value)} placeholder="principal@school.edu.in" />
      </Field>
      <Field label="Subject">
        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Body">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {PLACEHOLDERS.map((p) => (
            <button key={p} type="button" onClick={() => insert(p)} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 hover:bg-brand-100 hover:text-brand-700">
              + {p}
            </button>
          ))}
        </div>
        <textarea className="input font-mono text-xs" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="label">Preview</p>
        <p className="text-sm font-semibold text-slate-800">{finalSubject}</p>
        <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{finalBody}</p>
      </div>
      <DateQuickPick label="Next follow-up after this email" value={next} onChange={setNext} allowClear />
      <div className="flex gap-2">
        <button type="button" onClick={copy} className="btn-secondary">
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} Copy
        </button>
        <button type="button" onClick={send} disabled={!toValid} className="btn-primary flex-1">
          <Send className="h-4 w-4" /> Send Follow-up Email
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Opens your default email client with the subject and body pre-filled, and logs a “Follow-up Email Sent” entry to this school’s history.
      </p>
    </div>
  );
}

function HistoryTab({ lead }) {
  const history = lead.followUpHistory || [];
  if (!history.length) return <p className="py-8 text-center text-sm text-slate-500">No interactions logged yet.</p>;
  return (
    <ol className="relative ml-3 space-y-5 border-l border-slate-200 pl-6">
      {history.map((h) => {
        const Icon = CHANNEL_ICON[h.channel] || Info;
        return (
          <li key={h.id} className="relative">
            <span
              className={classNames(
                'absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white',
                h.channel === 'Email' ? 'bg-indigo-100 text-indigo-600' : h.channel === 'Meeting' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{h.channel}</span>
              <span>·</span>
              <span>{formatDate(h.date)}</span>
              {h.emailSent && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-200">Email sent</span>}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{h.notes}</p>
          </li>
        );
      })}
    </ol>
  );
}

export default function LeadDrawer({ lead, initialTab = 'overview', onClose, onEdit, onDelete, onStatusChange, onLog, toast }) {
  const [tab, setTab] = useState(initialTab);
  const leadId = lead?.id;

  useEffect(() => {
    setTab(initialTab);
  }, [leadId, initialTab]);

  const phone = useMemo(() => extractPhone(lead?.contactDetails), [lead?.contactDetails]);

  if (!lead) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
    { id: 'log', label: 'Log', icon: <MessageSquarePlus className="h-4 w-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <History className="h-4 w-4" />, count: lead.followUpHistory?.length || 0 },
  ];

  return (
    <Drawer
      open
      onClose={onClose}
      title={lead.schoolName}
      subtitle={
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <CategoryBadge category={lead.category} />
          <span>
            {lead.place}
            {lead.state ? `, ${lead.state}` : ''}
          </span>
        </div>
      }
      headerExtra={
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={lead.followUpStatus}
              onChange={(e) => onStatusChange(lead, e.target.value)}
              className="input w-auto py-1.5 text-xs"
              aria-label="Change status"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <StatusBadge status={lead.followUpStatus} className="hidden sm:inline-flex" />
            <div className="ml-auto flex gap-1">
              {phone && (
                <a href={`tel:${phone}`} className="btn-ghost px-2 py-1.5" title={`Call ${phone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              )}
              <button className="btn-ghost px-2 py-1.5" onClick={() => onEdit(lead)} title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button className="btn-ghost px-2 py-1.5 hover:text-rose-600" onClick={() => onDelete(lead)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
        </div>
      }
    >
      {tab === 'overview' && <OverviewTab lead={lead} />}
      {tab === 'log' && (
        <LogTab
          key={lead.id}
          lead={lead}
          onSubmit={(entry, extra) => {
            onLog(lead, entry, extra);
            setTab('history');
          }}
        />
      )}
      {tab === 'email' && (
        <EmailTab
          key={lead.id}
          lead={lead}
          toast={toast}
          onSent={(template, meta, next) => {
            onLog(
              lead,
              {
                date: today(),
                channel: 'Email',
                emailSent: true,
                notes: `Follow-up Email Sent: ${template.name}${meta.to ? ` → ${meta.to}` : ''}\nSubject: ${meta.subject}`,
              },
              { nextFollowUpDate: next, lastActionTaken: `Follow-up Email Sent: ${template.name}` },
              true,
            );
            setTab('history');
          }}
        />
      )}
      {tab === 'history' && <HistoryTab lead={lead} />}
    </Drawer>
  );
}
