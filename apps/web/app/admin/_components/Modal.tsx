'use client';

import { useState } from 'react';

// Modal simple accionado por un botón. Los hijos reciben una función `close`
// para cerrar tras una acción exitosa.
export function Modal({
  triggerLabel,
  triggerClassName = 'btn btn-primary',
  title,
  children,
}: {
  triggerLabel: string;
  triggerClassName?: string;
  title: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={close}
        >
          <div
            className="card w-full max-w-lg mt-16 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]">
              <h2 className="font-semibold">{title}</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={close}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="p-5">{children(close)}</div>
          </div>
        </div>
      )}
    </>
  );
}
