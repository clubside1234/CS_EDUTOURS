export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Local-date ISO string (YYYY-MM-DD), avoiding UTC off-by-one. */
export function toISODate(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today() {
  return toISODate(new Date());
}

export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  return toISODate(new Date(y, m - 1, d + days));
}

export function daysBetween(fromIso, toIso) {
  const [y1, m1, d1] = fromIso.split('-').map(Number);
  const [y2, m2, d2] = toIso.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatNumber(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-IN');
}

export function formatCurrency(n) {
  const num = Number(n);
  if (!num) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Accepts many date shapes seen in spreadsheets: 2026-10-13, 13/10/2026, 13-10-2026,
 * 13.10.2026, "13 Oct 2026", Excel serial numbers. Returns YYYY-MM-DD or ''.
 */
export function parseFlexibleDate(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date && !isNaN(value)) return toISODate(value);
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (dmy) {
    let [, d, m, y] = dmy.map(Number);
    if (y < 100) y += 2000;
    if (m > 12 && d <= 12) [d, m] = [m, d];
    const dt = new Date(y, m - 1, d);
    if (!isNaN(dt)) return toISODate(dt);
  }
  if (/^\d{5}(\.\d+)?$/.test(s)) {
    // Excel serial date (days since 1899-12-30)
    const dt = new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000);
    return toISODate(new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
  }
  const parsed = new Date(s);
  if (!isNaN(parsed)) return toISODate(parsed);
  return '';
}

export function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^\d.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function isValidContact(value) {
  const v = (value || '').trim();
  if (!v) return false;
  const email = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  const phone = /(\+?\d[\d\s-]{8,}\d)/;
  return email.test(v) || phone.test(v);
}

export function extractEmail(contact) {
  const m = (contact || '').match(/[^\s@,;/]+@[^\s@,;/]+\.[^\s@,;/]+/);
  return m ? m[0] : '';
}

export function extractPhone(contact) {
  const m = (contact || '').match(/\+?\d[\d\s-]{8,}\d/);
  return m ? m[0].replace(/[\s-]/g, '') : '';
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}
