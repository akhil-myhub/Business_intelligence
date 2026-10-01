'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const ICONS = { success: CheckCircle2, info: Info, warning: TriangleAlert, error: TriangleAlert };

// Non-blocking feedback for every action (exports, errors, alerts). Max 4 visible, auto-dismiss.
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback(id => setItems(list => list.filter(t => t.id !== id)), []);
  const toast = useCallback((message, { tone = 'info', ms = 6000, action } = {}) => {
    const id = ++seq.current;
    setItems(list => [...list.slice(-3), { id, message, tone, action }]);
    if (ms) setTimeout(() => dismiss(id), ms);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
        {items.map(t => {
          const Icon = ICONS[t.tone] ?? Info;
          return (
            <div key={t.id} className={'toast ' + t.tone} role="status">
              <Icon size={18} />
              <span>{t.message}</span>
              {t.action && <button className="toast-action" onClick={() => { t.action.run(); dismiss(t.id); }}>{t.action.label}</button>}
              <button aria-label="Dismiss" className="toast-x" onClick={() => dismiss(t.id)}><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
