'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { InlineAction } from '../_components/InlineAction';
import { updateContact, deleteContact } from '@/lib/actions';
import type { Contact } from '@/lib/types';

// Editar / eliminar contacto — visible solo para el ADMIN.
export function ContactActions({ contact }: { contact: Contact }) {
  return (
    <div className="flex justify-end gap-1.5">
      <Modal
        triggerLabel="Editar"
        triggerClassName="btn btn-secondary btn-sm"
        title={`Editar ${contact.name}`}
      >
        {(close) => (
          <StatefulForm action={updateContact} submitLabel="Guardar cambios" onSuccess={close}>
            <input type="hidden" name="id" value={contact.id} />
            <div>
              <label className="label" htmlFor={`name-${contact.id}`}>
                Nombre / Razón social
              </label>
              <input
                id={`name-${contact.id}`}
                name="name"
                className="input"
                defaultValue={contact.name}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor={`docType-${contact.id}`}>
                  Tipo doc.
                </label>
                <select
                  id={`docType-${contact.id}`}
                  name="docType"
                  className="select"
                  defaultValue={contact.docType ?? 'RUC'}
                >
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor={`docNumber-${contact.id}`}>
                  Número doc.
                </label>
                <input
                  id={`docNumber-${contact.id}`}
                  name="docNumber"
                  className="input tnum"
                  defaultValue={contact.docNumber ?? ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor={`phone-${contact.id}`}>
                  Teléfono
                </label>
                <input
                  id={`phone-${contact.id}`}
                  name="phone"
                  className="input tnum"
                  defaultValue={contact.phone ?? ''}
                />
              </div>
              <div>
                <label className="label" htmlFor={`email-${contact.id}`}>
                  Correo
                </label>
                <input
                  id={`email-${contact.id}`}
                  name="email"
                  type="email"
                  className="input"
                  defaultValue={contact.email ?? ''}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor={`address-${contact.id}`}>
                Dirección
              </label>
              <input
                id={`address-${contact.id}`}
                name="address"
                className="input"
                defaultValue={contact.address ?? ''}
              />
            </div>
            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="isCustomer"
                  className="size-4"
                  defaultChecked={contact.isCustomer}
                />
                Es cliente
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="isSupplier"
                  className="size-4"
                  defaultChecked={contact.isSupplier}
                />
                Es proveedor
              </label>
            </div>
          </StatefulForm>
        )}
      </Modal>

      <InlineAction
        action={deleteContact}
        fields={{ id: contact.id }}
        label="Eliminar"
        className="btn btn-ghost btn-sm"
        confirmText={`¿Eliminar a "${contact.name}"? Solo es posible si no tiene pedidos ni compras.`}
      />
    </div>
  );
}
