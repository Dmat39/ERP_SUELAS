'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createContact } from '@/lib/actions';

export function NewContact() {
  return (
    <Modal triggerLabel="Nuevo contacto" title="Nuevo contacto">
      {(close) => (
        <StatefulForm action={createContact} submitLabel="Guardar contacto" onSuccess={close}>
          <div>
            <label className="label" htmlFor="name">
              Nombre / Razón social
            </label>
            <input id="name" name="name" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="docType">
                Tipo doc.
              </label>
              <select id="docType" name="docType" className="select" defaultValue="RUC">
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="docNumber">
                Número doc.
              </label>
              <input id="docNumber" name="docNumber" className="input tnum" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="phone">
                Teléfono
              </label>
              <input id="phone" name="phone" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Correo
              </label>
              <input id="email" name="email" type="email" className="input" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="address">
              Dirección
            </label>
            <input id="address" name="address" className="input" />
          </div>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isCustomer" className="size-4" defaultChecked />
              Es cliente
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isSupplier" className="size-4" />
              Es proveedor
            </label>
          </div>
        </StatefulForm>
      )}
    </Modal>
  );
}
