'use client';

import { useState } from 'react';
import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createBom } from '@/lib/actions';
import type { RawMaterial, VariantFlat } from '@/lib/types';

type Line = { rawMaterialId: string; quantity: string };

export function NewBom({
  variants,
  materials,
}: {
  variants: VariantFlat[];
  materials: RawMaterial[];
}) {
  return (
    <Modal
      triggerLabel="Nueva receta"
      triggerClassName="btn btn-secondary"
      title="Nueva receta (LDM)"
    >
      {(close) => <BomForm variants={variants} materials={materials} onDone={close} />}
    </Modal>
  );
}

function BomForm({
  variants,
  materials,
  onDone,
}: {
  variants: VariantFlat[];
  materials: RawMaterial[];
  onDone: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([{ rawMaterialId: '', quantity: '' }]);

  const update = (i: number, patch: Partial<Line>) =>
    setLines((l) => l.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const add = () => setLines((l) => [...l, { rawMaterialId: '', quantity: '' }]);
  const remove = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i));

  const validLines = lines
    .filter((l) => l.rawMaterialId && Number(l.quantity) > 0)
    .map((l) => ({ rawMaterialId: l.rawMaterialId, quantity: Number(l.quantity) }));

  return (
    <StatefulForm action={createBom} submitLabel="Crear receta" onSuccess={onDone}>
      <input type="hidden" name="lines" value={JSON.stringify(validLines)} />

      <div>
        <label className="label" htmlFor="variantId">
          Producto / variante
        </label>
        <select id="variantId" name="variantId" className="select" required>
          <option value="">Selecciona una variante…</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.productName} — {v.sku}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="name">
          Nombre de la receta
        </label>
        <input
          id="name"
          name="name"
          className="input"
          placeholder="Ej: Receta Suela Runner Talla 40"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="label mb-0">Materia prima por unidad</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
            + Agregar línea
          </button>
        </div>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <select
                className="select flex-1"
                value={line.rawMaterialId}
                onChange={(e) => update(i, { rawMaterialId: e.target.value })}
              >
                <option value="">Material…</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="Cant."
                className="input tnum w-28"
                value={line.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })}
              />
              {lines.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => remove(i)}
                  aria-label="Quitar línea"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </StatefulForm>
  );
}
