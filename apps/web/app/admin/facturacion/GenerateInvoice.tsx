'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '../_components/Toast';
import { generateInvoice, type ActionState } from '@/lib/actions';

export function GenerateInvoice({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    generateInvoice,
    {},
  );
  const toast = useToast();
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) toast.show(state.message ?? 'Comprobante generado', 'ok');
    else if (state.error) toast.show(state.error, 'error');
  }, [state, toast]);

  return (
    <form action={formAction} className="flex items-center justify-end gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <select name="type" className="select w-28 py-1.5 text-xs" defaultValue="BOLETA">
        <option value="BOLETA">Boleta</option>
        <option value="FACTURA">Factura</option>
      </select>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? '…' : 'Emitir'}
      </button>
    </form>
  );
}
