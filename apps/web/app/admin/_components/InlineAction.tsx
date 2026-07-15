'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from './Toast';
import type { ActionState } from '@/lib/actions';

type ServerAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

// Botón que dispara una server action con campos fijos (hidden) y muestra
// feedback inmediato vía toast. Para acciones de una fila: recibir, confirmar, etc.
export function InlineAction({
  action,
  fields,
  label,
  className = 'btn btn-secondary btn-sm',
  confirmText,
}: {
  action: ServerAction;
  fields: Record<string, string>;
  label: string;
  className?: string;
  confirmText?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const toast = useToast();
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) toast.show(state.message ?? 'Listo', 'ok');
    else if (state.error) toast.show(state.error, 'error');
  }, [state, toast]);

  return (
    <form
      action={formAction}
      className="inline"
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className={className} disabled={pending}>
        {pending ? '…' : label}
      </button>
    </form>
  );
}
