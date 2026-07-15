'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { InlineAction } from '../_components/InlineAction';
import { updateRawMaterial, deleteRawMaterial } from '@/lib/actions';
import type { RawMaterial } from '@/lib/types';

// Editar / eliminar insumo — visible solo para el ADMIN.
export function RawMaterialActions({ material }: { material: RawMaterial }) {
  return (
    <div className="flex justify-end gap-1.5">
      <Modal
        triggerLabel="Editar"
        triggerClassName="btn btn-secondary btn-sm"
        title={`Editar ${material.name}`}
      >
        {(close) => (
          <StatefulForm action={updateRawMaterial} submitLabel="Guardar cambios" onSuccess={close}>
            <input type="hidden" name="id" value={material.id} />
            <div>
              <label className="label" htmlFor={`rm-name-${material.id}`}>
                Nombre
              </label>
              <input
                id={`rm-name-${material.id}`}
                name="name"
                className="input"
                defaultValue={material.name}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor={`rm-unit-${material.id}`}>
                  Unidad
                </label>
                <input
                  id={`rm-unit-${material.id}`}
                  name="unit"
                  className="input"
                  defaultValue={material.unit}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor={`rm-cost-${material.id}`}>
                  Costo unitario (S/)
                </label>
                <input
                  id={`rm-cost-${material.id}`}
                  name="costPerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input tnum"
                  defaultValue={Number(material.costPerUnit)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor={`rm-min-${material.id}`}>
                Stock mínimo (alerta de reposición)
              </label>
              <input
                id={`rm-min-${material.id}`}
                name="minStock"
                type="number"
                step="0.01"
                min="0"
                className="input tnum"
                defaultValue={Number(material.minStock)}
              />
            </div>
          </StatefulForm>
        )}
      </Modal>

      <InlineAction
        action={deleteRawMaterial}
        fields={{ id: material.id }}
        label="Eliminar"
        className="btn btn-ghost btn-sm"
        confirmText={`¿Eliminar "${material.name}"? Solo es posible si no tiene movimientos, recetas ni compras.`}
      />
    </div>
  );
}
