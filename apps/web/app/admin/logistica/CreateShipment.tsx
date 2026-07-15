'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '../_components/Toast';
import { createShipment, type ActionState } from '@/lib/actions';

export function CreateShipment({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createShipment,
    {},
  );
  const toast = useToast();
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) toast.show(state.message ?? 'Despacho creado', 'ok');
    else if (state.error) toast.show(state.error, 'error');
  }, [state, toast]);

  return (
    <form action={formAction} className="flex items-center justify-end gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <input
        name="address"
        className="input py-1.5 text-xs w-56"
        placeholder="Dirección de entrega"
        required
      />
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? '…' : 'Despachar'}
      </button>
    </form>
  );
}
