import { CLOSED_STATUSES } from '../data/constants';
import { addDays, today } from './helpers';

export const isOpen = (l) => !CLOSED_STATUSES.includes(l.followUpStatus);

export function followUpBucket(lead, ref = today()) {
  if (!isOpen(lead)) return 'closed';
  if (!lead.nextFollowUpDate) return 'unscheduled';
  if (lead.nextFollowUpDate < ref) return 'overdue';
  if (lead.nextFollowUpDate === ref) return 'today';
  if (lead.nextFollowUpDate <= addDays(ref, 7)) return 'week';
  return 'later';
}

export function isDue(lead) {
  const b = followUpBucket(lead);
  return b === 'overdue' || b === 'today';
}

export function computeKPIs(leads) {
  const total = leads.length;
  const won = leads.filter((l) => l.followUpStatus === 'Closed - Won');
  const lost = leads.filter((l) => l.followUpStatus === 'Lost / Not Interested').length;
  const due = leads.filter(isDue);
  const overdue = leads.filter((l) => followUpBucket(l) === 'overdue').length;
  const studentsOf = (l) => Number(l.expectedStudents) || 0;
  const projected = leads.filter((l) => l.followUpStatus !== 'Lost / Not Interested').reduce((s, l) => s + studentsOf(l), 0);
  const confirmed = won.reduce((s, l) => s + studentsOf(l), 0);
  const decided = won.length + lost;
  const pipelineValue = leads
    .filter(isOpen)
    .reduce((s, l) => s + studentsOf(l) * (Number(l.budgetPerStudent) || 0), 0);
  return {
    total,
    open: leads.filter(isOpen).length,
    won: won.length,
    lost,
    due: due.length,
    overdue,
    conversionRate: total ? (won.length / total) * 100 : 0,
    winRate: decided ? (won.length / decided) * 100 : 0,
    projected,
    confirmed,
    pipelineValue,
  };
}

export function countBy(leads, key) {
  return leads.reduce((acc, l) => {
    const k = (typeof key === 'function' ? key(l) : l[key]) || 'Unspecified';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
