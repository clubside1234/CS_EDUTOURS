import { useState } from 'react';
import { MapPin, Users, Plane, CalendarClock, GripVertical, MessageSquarePlus } from 'lucide-react';
import { STATUSES, STATUS_STYLES } from '../data/constants';
import { CategoryBadge } from './ui';
import { classNames, formatDate, formatNumber } from '../utils/helpers';
import { followUpBucket } from '../utils/metrics';

function LeadCard({ lead, onOpen, onLog, onStatusChange, onDragStart, onDragEnd, dragging }) {
  const bucket = followUpBucket(lead);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      className={classNames(
        'group cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-brand-300 hover:shadow-md active:cursor-grabbing',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-400" />
        <button onClick={() => onOpen(lead)} className="min-w-0 flex-1 text-left">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 hover:text-brand-600">{lead.schoolName}</p>
        </button>
        <CategoryBadge category={lead.category} />
      </div>
      <div className="mt-2 space-y-1 pl-6 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {lead.place}
          {lead.state ? `, ${lead.state}` : ''}
        </p>
        <p className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {formatNumber(lead.expectedStudents)} students
        </p>
        <p className="flex items-center gap-1.5">
          <Plane className="h-3.5 w-3.5" /> {lead.preferredLocation} · {lead.preferredTravelTime}
        </p>
        {bucket !== 'closed' && lead.nextFollowUpDate && (
          <p
            className={classNames(
              'flex items-center gap-1.5',
              bucket === 'overdue' && 'font-semibold text-rose-600',
              bucket === 'today' && 'font-semibold text-amber-600',
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {bucket === 'overdue' ? 'Overdue: ' : bucket === 'today' ? 'Due today: ' : 'Next: '}
            {formatDate(lead.nextFollowUpDate)}
          </p>
        )}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 pl-6">
        <select
          value={lead.followUpStatus}
          onChange={(e) => onStatusChange(lead, e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
          aria-label="Move to stage"
          onClick={(e) => e.stopPropagation()}
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button onClick={() => onLog(lead)} className="rounded-md p-1 text-brand-600 hover:bg-brand-50" title="Log follow-up">
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function PipelineBoard({ leads, onOpen, onLog, onStatusChange }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const handleDragStart = (e, lead) => {
    setDragId(lead.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId;
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.followUpStatus !== status) onStatusChange(lead, status);
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-3">
        {STATUSES.map((status) => {
          const items = leads.filter((l) => l.followUpStatus === status);
          const students = items.reduce((s, l) => s + (Number(l.expectedStudents) || 0), 0);
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                if (overCol !== status) setOverCol(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOverCol(null);
              }}
              onDrop={(e) => handleDrop(e, status)}
              className={classNames(
                'flex w-72 shrink-0 flex-col rounded-xl border-t-4 bg-slate-100/80 transition',
                STATUS_STYLES[status].column,
                overCol === status && 'bg-brand-50 ring-2 ring-brand-300',
              )}
            >
              <div className="flex items-center justify-between px-3 pb-2 pt-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{status}</p>
                  <p className="text-xs text-slate-500">{formatNumber(students)} students</p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">{items.length}</span>
              </div>
              <div className="scrollbar-thin flex max-h-[calc(100vh-340px)] min-h-[120px] flex-col gap-2 overflow-y-auto px-2 pb-3">
                {items.map((l) => (
                  <LeadCard
                    key={l.id}
                    lead={l}
                    onOpen={onOpen}
                    onLog={onLog}
                    onStatusChange={onStatusChange}
                    onDragStart={handleDragStart}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    dragging={dragId === l.id}
                  />
                ))}
                {!items.length && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
