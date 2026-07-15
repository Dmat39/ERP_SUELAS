'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createPurchaseOrder } from '@/lib/actions';
import type { Contact, RawMaterial } from '@/lib/types';

export function NewPurchase({
  suppliers,
  materials,
}: {
  suppliers: Contact[];
  materials: RawMaterial[];
}) {
  return (
    <Modal triggerLabel="Nueva orden de compra" title="Nueva orden de compra">
      {(close) => (
        <StatefulForm action={createPurchaseOrder} submitLabel="Crear orden" onSuccess={close}>
          <div>
            <label className="label" htmlFor="supplierId">
              Proveedor
            </label>
            <select id="supplierId" name="supplierId" className="select" required>
              <option value="">Selecciona un proveedor…</option>
              {suppliers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="rawMaterialId">
              Materia prima
            </label>
            <select id="rawMaterialId" name="rawMaterialId" className="select" required>
              <option value="">Selecciona un material…</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="quantity">
                Cantidad
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                step="0.001"
                min="0.001"
                className="input tnum"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="unitCost">
                Costo unitario (S/)
              </label>
              <input
                id="unitCost"
                name="unitCost"
                type="number"
                step="0.01"
                min="0"
                className="input tnum"
                required
              />
            </div>
          </div>
        </StatefulForm>
      )}
    </Modal>
  );
}
