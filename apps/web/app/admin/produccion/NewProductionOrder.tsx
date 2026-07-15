'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createProductionOrder } from '@/lib/actions';
import type { Bom } from '@/lib/types';

export function NewProductionOrder({ boms }: { boms: Bom[] }) {
  return (
    <Modal triggerLabel="Nueva orden de producción" title="Nueva orden de producción">
      {(close) => (
        <StatefulForm
          action={createProductionOrder}
          submitLabel="Crear orden"
          onSuccess={close}
        >
          <div>
            <label className="label" htmlFor="bomId">
              Receta (BOM)
            </label>
            <select id="bomId" name="bomId" className="select" required>
              <option value="">Selecciona una receta…</option>
              {boms.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.variant.template.name} {b.variant.sku}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantityToProduce">
              Cantidad a producir (unidades)
            </label>
            <input
              id="quantityToProduce"
              name="quantityToProduce"
              type="number"
              step="1"
              min="1"
              className="input tnum"
              required
            />
          </div>
        </StatefulForm>
      )}
    </Modal>
  );
}
