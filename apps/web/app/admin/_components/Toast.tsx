'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type Kind = 'ok' | 'error';
type Toast = { id: number; message: string; kind: Kind };

const ToastCtx = createContext<{ show: (m: string, k: Kind) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast fuera de ToastProvider');
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: Kind) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`card px-4 py-3 text-sm shadow-lg border-l-4 ${
              t.kind === 'ok'
                ? 'border-l-[var(--color-ok)]'
                : 'border-l-[var(--color-danger)]'
            }`}
          >
            <span
              className={
                t.kind === 'ok'
                  ? 'text-[var(--color-ok)] font-medium'
                  : 'text-[var(--color-danger)] font-medium'
              }
            >
              {t.kind === 'ok' ? '✓ ' : '⚠ '}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
