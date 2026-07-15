'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createRawMaterial } from '@/lib/actions';

export function NewRawMaterial() {
  return (
    <Modal triggerLabel="Nueva materia prima" title="Registrar materia prima">
      {(close) => (
        <StatefulForm action={createRawMaterial} submitLabel="Registrar" onSuccess={close}>
          <div>
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input id="name" name="name" className="input" placeholder="Ej: Caucho SBR" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="unit">
                Unidad
              </label>
              <input id="unit" name="unit" className="input" placeholder="kg, lt, unidad" required />
            </div>
            <div>
              <label className="label" htmlFor="costPerUnit">
                Costo unitario (S/)
              </label>
              <input
                id="costPerUnit"
                name="costPerUnit"
                type="number"
                step="0.01"
                min="0"
                className="input tnum"
                required
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="minStock">
              Stock mínimo (alerta de reposición)
            </label>
            <input
              id="minStock"
              name="minStock"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="input tnum"
            />
          </div>
        </StatefulForm>
      )}
    </Modal>
  );
}
