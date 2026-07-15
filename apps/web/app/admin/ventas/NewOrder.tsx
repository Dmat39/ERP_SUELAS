'use client';

import { useState } from 'react';
import { Modal } from '../_components/Modal';
import { StatefulForm } from '../_components/StatefulForm';
import { createOrder } from '@/lib/actions';
import type { Contact, VariantFlat } from '@/lib/types';

export function NewOrder({
  customers,
  variants,
}: {
  customers: Contact[];
  variants: VariantFlat[];
}) {
  return (
    <Modal triggerLabel="Nuevo pedido interno" title="Nuevo pedido interno">
      {(close) => <OrderForm customers={customers} variants={variants} onDone={close} />}
    </Modal>
  );
}

function OrderForm({
  customers,
  variants,
  onDone,
}: {
  customers: Contact[];
  variants: VariantFlat[];
  onDone: () => void;
}) {
  const [variantId, setVariantId] = useState('');
  const [price, setPrice] = useState('');

  const onVariantChange = (id: string) => {
    setVariantId(id);
    const v = variants.find((x) => x.id === id);
    if (v) setPrice(String(v.price));
  };

  return (
    <StatefulForm action={createOrder} submitLabel="Crear pedido" onSuccess={onDone}>
      <input type="hidden" name="origin" value="INTERNO" />

      <div>
        <label className="label" htmlFor="customerId">
          Cliente
        </label>
        <select id="customerId" name="customerId" className="select" required>
          <option value="">Selecciona un cliente…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="variantId">
          Producto
        </label>
        <select
          id="variantId"
          name="variantId"
          className="select"
          required
          value={variantId}
          onChange={(e) => onVariantChange(e.target.value)}
        >
          <option value="">Selecciona una variante…</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.productName} — {v.sku} (stock: {v.stock})
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
            step="1"
            min="1"
            className="input tnum"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="unitPrice">
            Precio unitario (S/)
          </label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            className="input tnum"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>
    </StatefulForm>
  );
}
