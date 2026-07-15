'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from './Toast';
import type { ActionState } from '@/lib/actions';

type ServerAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

// Formulario de creación con estado: muestra error inline, toast en éxito y
// ejecuta onSuccess (típicamente cerrar el modal).
export function StatefulForm({
  action,
  children,
  submitLabel = 'Guardar',
  onSuccess,
}: {
  action: ServerAction;
  children: React.ReactNode;
  submitLabel?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const toast = useToast();
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) {
      toast.show(state.message ?? 'Guardado', 'ok');
      onSuccess?.();
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state.error && (
        <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-soft)] rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
