'use client';

import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createTemplate, createVariant } from '@/lib/actions';
import type { AttributeWithValues, TemplateAdmin } from '@/lib/types';

export function NewTemplate() {
  return (
    <Modal
      triggerLabel="Nuevo producto"
      triggerClassName="btn btn-secondary"
      title="Nuevo producto terminado"
    >
      {(close) => (
        <StatefulForm action={createTemplate} submitLabel="Crear producto" onSuccess={close}>
          <div>
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input id="name" name="name" className="input" placeholder="Ej: Suela Runner" required />
          </div>
          <div>
            <label className="label" htmlFor="description">
              Descripción
            </label>
            <input
              id="description"
              name="description"
              className="input"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="label" htmlFor="basePrice">
              Precio base (S/)
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              step="0.01"
              min="0"
              className="input tnum"
              required
            />
          </div>
        </StatefulForm>
      )}
    </Modal>
  );
}

export function NewVariant({
  templates,
  attributes,
}: {
  templates: TemplateAdmin[];
  attributes: AttributeWithValues[];
}) {
  return (
    <Modal triggerLabel="Nueva variante" title="Nueva variante (talla)">
      {(close) => (
        <StatefulForm action={createVariant} submitLabel="Crear variante" onSuccess={close}>
          <div>
            <label className="label" htmlFor="templateId">
              Producto
            </label>
            <select id="templateId" name="templateId" className="select" required>
              <option value="">Selecciona un producto…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="attributeValueId">
              Talla / atributo
            </label>
            <select id="attributeValueId" name="attributeValueId" className="select" required>
              <option value="">Selecciona…</option>
              {attributes.map((attr) =>
                attr.values.map((v) => (
                  <option key={v.id} value={v.id}>
                    {attr.name}: {v.value}
                  </option>
                )),
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="sku">
                SKU
              </label>
              <input id="sku" name="sku" className="input" placeholder="SR-RUN-42" required />
            </div>
            <div>
              <label className="label" htmlFor="priceOverride">
                Precio propio (opcional)
              </label>
              <input
                id="priceOverride"
                name="priceOverride"
                type="number"
                step="0.01"
                min="0"
                className="input tnum"
                placeholder="usa precio base"
              />
            </div>
          </div>
        </StatefulForm>
      )}
    </Modal>
  );
}
