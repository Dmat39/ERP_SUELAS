'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '../_components/Toast';
import {
  deleteInvoice,
  updateInvoiceType,
  type ActionState,
} from '@/lib/actions';

// Acciones por comprobante: Ver (previsualización), Descargar, y — solo para
// el ADMIN — Editar (corregir tipo o anular, por si hubo equivocación).
export function InvoiceActions({
  id,
  type,
  label,
  isAdmin,
}: {
  id: string;
  type: string; // BOLETA | FACTURA
  label: string; // ej. "B001-000003"
  isAdmin: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const [edit, setEdit] = useState(false);
  const pdfUrl = `/admin/facturacion/${id}/pdf`;

  return (
    <div className="flex justify-end gap-1.5">
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreview(true)}>
        Ver
      </button>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener"
        className="btn btn-secondary btn-sm"
        title="Descargar el PDF"
      >
        Descargar
      </a>
      {isAdmin && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(true)}>
          Editar
        </button>
      )}

      {/* ---------- Vista previa del PDF ---------- */}
      {preview && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreview(false)}
        >
          <div
            className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-3xl h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-sm">Vista previa — {label}</h2>
              <div className="flex gap-2">
                <a className="btn btn-secondary btn-sm" href={pdfUrl} target="_blank" rel="noopener">
                  Descargar
                </a>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPreview(false)}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full rounded-b-lg"
              title={`Vista previa del comprobante ${label}`}
            />
          </div>
        </div>
      )}

      {/* ---------- Edición (solo ADMIN) ---------- */}
      {edit && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={() => setEdit(false)}
        >
          <div
            className="card w-full max-w-md mt-20 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]">
              <h2 className="font-semibold">Corregir comprobante {label}</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setEdit(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <EditForms id={id} type={type} close={() => setEdit(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditForms({ id, type, close }: { id: string; type: string; close: () => void }) {
  const toast = useToast();

  const [updState, updAction, updPending] = useActionState<ActionState, FormData>(
    updateInvoiceType,
    {},
  );
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(
    deleteInvoice,
    {},
  );

  const seenUpd = useRef(updState);
  const seenDel = useRef(delState);

  useEffect(() => {
    if (updState !== seenUpd.current) {
      seenUpd.current = updState;
      if (updState.ok) {
        toast.show(updState.message ?? 'Comprobante corregido', 'ok');
        close();
      } else if (updState.error) toast.show(updState.error, 'error');
    }
  }, [updState, toast, close]);

  useEffect(() => {
    if (delState !== seenDel.current) {
      seenDel.current = delState;
      if (delState.ok) {
        toast.show(delState.message ?? 'Comprobante anulado', 'ok');
        close();
      } else if (delState.error) toast.show(delState.error, 'error');
    }
  }, [delState, toast, close]);

  return (
    <div className="space-y-5">
      {/* Cambiar tipo */}
      <form action={updAction} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <div>
          <label className="label" htmlFor={`type-${id}`}>
            Tipo de comprobante
          </label>
          <select id={`type-${id}`} name="type" className="select" defaultValue={type}>
            <option value="BOLETA">Boleta</option>
            <option value="FACTURA">Factura</option>
          </select>
          <p className="text-xs text-[var(--color-muted)] mt-1.5">
            Al cambiar el tipo se asigna un nuevo número en la serie correspondiente. El número
            anterior queda anulado.
          </p>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={updPending}>
          {updPending ? 'Guardando…' : 'Guardar corrección'}
        </button>
      </form>

      {/* Anular */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <form
          action={delAction}
          onSubmit={(e) => {
            if (
              !window.confirm(
                '¿Anular este comprobante? El pedido quedará libre para emitir uno nuevo.',
              )
            )
              e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="btn w-full text-white"
            style={{ backgroundColor: 'var(--color-danger)' }}
            disabled={delPending}
          >
            {delPending ? 'Anulando…' : 'Anular comprobante'}
          </button>
        </form>
        <p className="text-xs text-[var(--color-muted)] mt-2 text-center">
          Úsalo si el comprobante se emitió por error.
        </p>
      </div>
    </div>
  );
}
