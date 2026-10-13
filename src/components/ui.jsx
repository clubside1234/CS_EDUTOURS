import { useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_STYLES, STATUS_STYLES } from '../data/constants';
import { useEscape } from '../hooks';
import { classNames } from '../utils/helpers';

export function StatusBadge({ status, className = '' }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['New Lead'];
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        s.badge,
        className,
      )}
    >
      <span className={classNames('h-1.5 w-1.5 rounded-full', s.dot)} />
      {status}
    </span>
  );
}

export function CategoryBadge({ category }) {
  if (!category) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span
      className={classNames(
        'inline-flex min-w-[2rem] items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold',
        CATEGORY_STYLES[category] || 'bg-slate-100 text-slate-700',
      )}
      title={`Category ${category}`}
    >
      {category}
    </span>
  );
}

function useBodyLock(open) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

export function Modal({ open, onClose, title, subtitle, icon, children, footer, size = 'lg' }) {
  const close = useCallback(() => onClose(), [onClose]);
  useEscape(close, open);
  useBodyLock(open);
  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-6xl' }[size];
  return (
    <div data-modal className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" onClick={close} />
      <div
        className={classNames(
          'relative flex max-h-[95vh] w-full animate-fade-in flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
          width,
        )}
      >
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
          {icon && <div className="rounded-lg bg-brand-50 p-2 text-brand-600">{icon}</div>}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, subtitle, children, footer, headerExtra }) {
  // Let a modal stacked above the drawer handle Escape first.
  const close = useCallback(() => {
    if (!document.querySelector('[data-modal]')) onClose();
  }, [onClose]);
  useEscape(close, open);
  useBodyLock(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
      <div className="relative flex h-full w-full max-w-xl animate-slide-in flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
              {subtitle && <div className="mt-0.5 text-sm text-slate-500">{subtitle}</div>}
            </div>
            <button onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {headerExtra}
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

export function Field({ label, error, required, children, hint, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={classNames(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition',
            value === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {t.icon}
          <span className="truncate">{t.label}</span>
          {t.count !== undefined && <span className="rounded-full bg-slate-200 px-1.5 text-xs text-slate-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
