'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { InlineAction } from '../_components/InlineAction';
import { updateVariant, deleteVariant } from '@/lib/actions';
import type { VariantFlat } from '@/lib/types';

// Editar / eliminar variante (talla) — visible solo para el ADMIN.
export function VariantActions({ variant }: { variant: VariantFlat }) {
  return (
    <div className="flex justify-end gap-1.5">
      <Modal
        triggerLabel="Editar"
        triggerClassName="btn btn-secondary btn-sm"
        title={`Editar ${variant.productName} — ${variant.sku}`}
      >
        {(close) => (
          <StatefulForm action={updateVariant} submitLabel="Guardar cambios" onSuccess={close}>
            <input type="hidden" name="id" value={variant.id} />
            <div>
              <label className="label" htmlFor={`sku-${variant.id}`}>
                SKU
              </label>
              <input
                id={`sku-${variant.id}`}
                name="sku"
                className="input"
                defaultValue={variant.sku}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor={`po-${variant.id}`}>
                Precio propio (S/)
              </label>
              <input
                id={`po-${variant.id}`}
                name="priceOverride"
                type="number"
                step="0.01"
                min="0"
                className="input tnum"
                defaultValue={variant.priceOverride ?? ''}
                placeholder={`vacío = precio base (S/ ${variant.price.toFixed(2)})`}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1.5">
                Déjalo vacío para usar el precio base del producto.
              </p>
            </div>
          </StatefulForm>
        )}
      </Modal>

      <InlineAction
        action={deleteVariant}
        fields={{ id: variant.id }}
        label="Eliminar"
        className="btn btn-ghost btn-sm"
        confirmText={`¿Eliminar la variante ${variant.sku}? Solo es posible si no tiene stock ni movimientos.`}
      />
    </div>
  );
}
