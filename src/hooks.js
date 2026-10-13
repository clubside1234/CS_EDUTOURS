import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEY } from './data/constants';
import { buildMockLeads } from './data/mockData';
import { uid, today } from './utils/helpers';

function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* corrupted or unavailable storage – fall back to seed data */
  }
  return buildMockLeads();
}

/** Central lead store, persisted to localStorage on every change. */
export function useLeads() {
  const [leads, setLeads] = useState(loadLeads);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [leads]);

  const stamp = (lead) => ({ ...lead, updatedAt: new Date().toISOString() });

  const addLead = useCallback((lead) => {
    const newLead = stamp({
      followUpHistory: [],
      ...lead,
      id: uid(),
      createdAt: new Date().toISOString(),
    });
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }, []);

  const addMany = useCallback((list) => {
    const clean = list.map(({ _errors, _warnings, ...l }) => stamp({ ...l, id: l.id || uid() }));
    setLeads((prev) => [...clean, ...prev]);
    return clean.length;
  }, []);

  const updateLead = useCallback((id, patch) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? stamp({ ...l, ...(typeof patch === 'function' ? patch(l) : patch) }) : l)));
  }, []);

  const deleteLead = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setStatus = useCallback((id, status) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id && l.followUpStatus !== status
          ? stamp({ ...l, followUpStatus: status, lastActionTaken: `Stage moved to "${status}" (${today()})` })
          : l,
      ),
    );
  }, []);

  const logFollowUp = useCallback((id, entry, extra = {}) => {
    const log = { id: uid(), date: today(), channel: 'Call', emailSent: false, ...entry };
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? stamp({
              ...l,
              ...extra,
              lastActionTaken: extra.lastActionTaken || `${log.channel}: ${log.notes}`.slice(0, 160),
              followUpHistory: [log, ...(l.followUpHistory || [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
            })
          : l,
      ),
    );
  }, []);

  const resetDemo = useCallback(() => setLeads(buildMockLeads()), []);
  const clearAll = useCallback(() => setLeads([]), []);

  return { leads, storageOk, addLead, addMany, updateLead, deleteLead, setStatus, logFollowUp, resetDemo, clearAll };
}

export function useOnClickOutside(ref, handler) {
  const saved = useRef(handler);
  saved.current = handler;
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      saved.current(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]);
}

export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === 'Escape' && handler();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler, active]);
}
