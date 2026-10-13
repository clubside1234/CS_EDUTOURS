import { Users, BellRing, TrendingUp, GraduationCap } from 'lucide-react';
import { formatNumber } from '../utils/helpers';

function Card({ icon, label, value, sub, tone, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className="card flex items-start gap-4 p-4 text-left transition hover:shadow-md">
      <div className={`rounded-xl p-2.5 ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-slate-500">{sub}</p>}
      </div>
    </Comp>
  );
}

export default function KPICards({ kpis, onOpenQueue }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        icon={<Users className="h-5 w-5" />}
        tone="bg-brand-50 text-brand-600"
        label="Total Leads"
        value={formatNumber(kpis.total)}
        sub={`${kpis.open} open · ${kpis.won} won · ${kpis.lost} lost`}
      />
      <Card
        icon={<BellRing className="h-5 w-5" />}
        tone={kpis.due ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}
        label="Follow-ups Due"
        value={formatNumber(kpis.due)}
        sub={kpis.overdue ? `${kpis.overdue} overdue — view queue` : 'Nothing overdue'}
        onClick={onOpenQueue}
      />
      <Card
        icon={<TrendingUp className="h-5 w-5" />}
        tone="bg-emerald-50 text-emerald-600"
        label="Conversion Rate"
        value={`${kpis.conversionRate.toFixed(1)}%`}
        sub={`Win rate on decided leads: ${kpis.winRate.toFixed(0)}%`}
      />
      <Card
        icon={<GraduationCap className="h-5 w-5" />}
        tone="bg-violet-50 text-violet-600"
        label="Projected Students"
        value={formatNumber(kpis.projected)}
        sub={`${formatNumber(kpis.confirmed)} confirmed from won deals`}
      />
    </div>
  );
}
