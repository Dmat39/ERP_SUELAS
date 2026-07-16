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
      title="Nuevo producto"
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
  defaultTemplateId,
  triggerLabel = 'Nueva talla',
  triggerClassName,
}: {
  templates: TemplateAdmin[];
  attributes: AttributeWithValues[];
  defaultTemplateId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  // Tallas ya existentes en el catálogo, como sugerencias del datalist.
  const tallasSugeridas = attributes
    .filter((attr) => attr.name.toLowerCase() === 'talla')
    .flatMap((attr) => attr.values.map((v) => v.value));

  return (
    <Modal
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
      title="Agregar talla a un modelo"
    >
      {(close) => (
        <StatefulForm action={createVariant} submitLabel="Agregar talla" onSuccess={close}>
          <div>
            <label className="label" htmlFor="templateId">
              Producto
            </label>
            <select
              id="templateId"
              name="templateId"
              className="select"
              defaultValue={defaultTemplateId ?? ''}
              required
            >
              <option value="">Selecciona un producto…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="talla">
              Talla
            </label>
            <input
              id="talla"
              name="talla"
              className="input"
              list="tallas-sugeridas"
              placeholder="Ej: 42 (elige una o escribe una nueva)"
              required
            />
            <datalist id="tallas-sugeridas">
              {tallasSugeridas.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <p className="text-xs text-[var(--color-muted)] mt-1.5">
              Si la talla no existe todavía, se crea automáticamente.
            </p>
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
