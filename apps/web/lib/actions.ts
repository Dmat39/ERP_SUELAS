'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from './api';
import type { InvoiceType, OrderOrigin } from '@erp/shared-types';

export type ActionState = { ok?: boolean; error?: string; message?: string };

// Envuelve una llamada mutadora: normaliza errores de la API y revalida rutas.
async function run(
  fn: () => Promise<unknown>,
  revalidate: string[],
  message: string,
): Promise<ActionState> {
  try {
    await fn();
    for (const path of revalidate) revalidatePath(path);
    return { ok: true, message };
  } catch (e) {
    const error = e instanceof ApiError ? e.message : 'Ocurrió un error inesperado';
    return { ok: false, error };
  }
}

const n = (v: FormDataEntryValue | null) => Number(v ?? 0);
const s = (v: FormDataEntryValue | null) => String(v ?? '').trim();

// ---------------- Compras ----------------
export async function createPurchaseOrder(_p: ActionState, fd: FormData) {
  const supplierId = s(fd.get('supplierId'));
  const rawMaterialId = s(fd.get('rawMaterialId'));
  const quantity = n(fd.get('quantity'));
  const unitCost = n(fd.get('unitCost'));
  return run(
    () =>
      apiFetch('/purchase-orders', {
        method: 'POST',
        body: { supplierId, items: [{ rawMaterialId, quantity, unitCost }] },
      }),
    ['/admin/compras'],
    'Orden de compra creada',
  );
}

export async function receivePurchase(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const warehouseId = s(fd.get('warehouseId'));
  return run(
    () => apiFetch(`/purchase-orders/${id}/receive`, { method: 'POST', body: { warehouseId } }),
    ['/admin/compras', '/admin/materia-prima', '/admin'],
    'Compra recibida — stock de materia prima actualizado',
  );
}

// ---------------- Producción ----------------
export async function createProductionOrder(_p: ActionState, fd: FormData) {
  const bomId = s(fd.get('bomId'));
  const quantityToProduce = n(fd.get('quantityToProduce'));
  return run(
    () =>
      apiFetch('/production-orders', {
        method: 'POST',
        body: { bomId, quantityToProduce },
      }),
    ['/admin/produccion'],
    'Orden de producción creada',
  );
}

export async function startProduction(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/production-orders/${id}/start`, { method: 'POST' }),
    ['/admin/produccion'],
    'Orden en proceso',
  );
}

export async function completeProduction(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const warehouseId = s(fd.get('warehouseId'));
  return run(
    () => apiFetch(`/production-orders/${id}/complete`, { method: 'POST', body: { warehouseId } }),
    ['/admin/produccion', '/admin/inventario', '/admin/materia-prima', '/admin'],
    'Producción completada — stock actualizado',
  );
}

export async function createBom(_p: ActionState, fd: FormData) {
  const variantId = s(fd.get('variantId'));
  const name = s(fd.get('name'));
  // Líneas serializadas como JSON desde el formulario.
  const lines = JSON.parse(s(fd.get('lines')) || '[]');
  return run(
    () => apiFetch('/boms', { method: 'POST', body: { variantId, name, lines } }),
    ['/admin/produccion'],
    'Receta (LDM) creada',
  );
}

// ---------------- Ventas ----------------
export async function createOrder(_p: ActionState, fd: FormData) {
  const customerId = s(fd.get('customerId'));
  const origin = s(fd.get('origin')) as OrderOrigin;
  const variantId = s(fd.get('variantId'));
  const quantity = n(fd.get('quantity'));
  const unitPrice = n(fd.get('unitPrice'));
  return run(
    () =>
      apiFetch('/orders', {
        method: 'POST',
        body: { customerId, origin, items: [{ variantId, quantity, unitPrice }] },
      }),
    ['/admin/ventas'],
    'Pedido creado',
  );
}

export async function confirmOrder(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const warehouseId = s(fd.get('warehouseId'));
  return run(
    () => apiFetch(`/orders/${id}/confirm`, { method: 'POST', body: { warehouseId } }),
    ['/admin/ventas', '/admin/inventario', '/admin'],
    'Pedido confirmado — stock descontado',
  );
}

// ---------------- Facturación ----------------
export async function generateInvoice(_p: ActionState, fd: FormData) {
  const orderId = s(fd.get('orderId'));
  const type = s(fd.get('type')) as InvoiceType;
  return run(
    () => apiFetch('/invoices', { method: 'POST', body: { orderId, type } }),
    ['/admin/facturacion', '/admin/ventas'],
    'Comprobante generado',
  );
}

// Solo ADMIN: corrige el tipo del comprobante (reasigna serie y número).
export async function updateInvoiceType(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const type = s(fd.get('type')) as InvoiceType;
  return run(
    () => apiFetch(`/invoices/${id}`, { method: 'PATCH', body: { type } }),
    ['/admin/facturacion', '/admin/ventas'],
    'Comprobante corregido — se asignó un nuevo número',
  );
}

// Solo ADMIN: anula el comprobante (el pedido queda libre para re-emitir).
export async function deleteInvoice(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/invoices/${id}`, { method: 'DELETE' }),
    ['/admin/facturacion', '/admin/ventas'],
    'Comprobante anulado — puedes emitir uno nuevo desde "Pedidos por facturar"',
  );
}

// ---------------- Logística ----------------
export async function createShipment(_p: ActionState, fd: FormData) {
  const orderId = s(fd.get('orderId'));
  const address = s(fd.get('address'));
  return run(
    () => apiFetch('/shipments', { method: 'POST', body: { orderId, address } }),
    ['/admin/logistica', '/admin/ventas'],
    'Despacho creado',
  );
}

export async function dispatchShipment(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/shipments/${id}/dispatch`, { method: 'POST' }),
    ['/admin/logistica', '/admin/ventas'],
    'Despacho en ruta',
  );
}

export async function deliverShipment(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/shipments/${id}/deliver`, { method: 'POST' }),
    ['/admin/logistica', '/admin/ventas'],
    'Despacho entregado',
  );
}

// ---------------- Cancelaciones (solo ADMIN) ----------------
export async function cancelOrder(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/orders/${id}/cancel`, { method: 'POST' }),
    ['/admin/ventas', '/admin'],
    'Pedido cancelado',
  );
}

export async function cancelPurchase(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/purchase-orders/${id}/cancel`, { method: 'POST' }),
    ['/admin/compras', '/admin'],
    'Orden de compra cancelada',
  );
}

export async function cancelProduction(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/production-orders/${id}/cancel`, { method: 'POST' }),
    ['/admin/produccion', '/admin'],
    'Orden de producción cancelada',
  );
}

export async function deleteBom(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/boms/${id}`, { method: 'DELETE' }),
    ['/admin/produccion'],
    'Receta eliminada',
  );
}

// ---------------- Contactos ----------------
export async function createContact(_p: ActionState, fd: FormData) {
  const body = {
    name: s(fd.get('name')),
    docType: s(fd.get('docType')) || undefined,
    docNumber: s(fd.get('docNumber')) || undefined,
    phone: s(fd.get('phone')) || undefined,
    email: s(fd.get('email')) || undefined,
    address: s(fd.get('address')) || undefined,
    isCustomer: fd.get('isCustomer') === 'on',
    isSupplier: fd.get('isSupplier') === 'on',
  };
  return run(
    () => apiFetch('/contacts', { method: 'POST', body }),
    ['/admin/contactos'],
    'Contacto creado',
  );
}

export async function updateContact(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const body = {
    name: s(fd.get('name')),
    docType: s(fd.get('docType')) || undefined,
    docNumber: s(fd.get('docNumber')) || undefined,
    phone: s(fd.get('phone')) || undefined,
    email: s(fd.get('email')) || undefined,
    address: s(fd.get('address')) || undefined,
    isCustomer: fd.get('isCustomer') === 'on',
    isSupplier: fd.get('isSupplier') === 'on',
  };
  return run(
    () => apiFetch(`/contacts/${id}`, { method: 'PATCH', body }),
    ['/admin/contactos', '/admin/ventas', '/admin/compras'],
    'Contacto actualizado',
  );
}

export async function deleteContact(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/contacts/${id}`, { method: 'DELETE' }),
    ['/admin/contactos'],
    'Contacto eliminado',
  );
}

// ---------------- Materia prima ----------------
export async function createRawMaterial(_p: ActionState, fd: FormData) {
  const body = {
    name: s(fd.get('name')),
    unit: s(fd.get('unit')),
    costPerUnit: n(fd.get('costPerUnit')),
    minStock: n(fd.get('minStock')),
  };
  return run(
    () => apiFetch('/raw-materials', { method: 'POST', body }),
    ['/admin/materia-prima'],
    'Materia prima registrada',
  );
}

export async function updateRawMaterial(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const body = {
    name: s(fd.get('name')),
    unit: s(fd.get('unit')),
    costPerUnit: n(fd.get('costPerUnit')),
    minStock: n(fd.get('minStock')),
  };
  return run(
    () => apiFetch(`/raw-materials/${id}`, { method: 'PATCH', body }),
    ['/admin/materia-prima', '/admin'],
    'Insumo actualizado',
  );
}

export async function deleteRawMaterial(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/raw-materials/${id}`, { method: 'DELETE' }),
    ['/admin/materia-prima', '/admin'],
    'Insumo eliminado',
  );
}

// ---------------- Inventario ----------------
export async function createTemplate(_p: ActionState, fd: FormData) {
  const body = {
    name: s(fd.get('name')),
    description: s(fd.get('description')) || undefined,
    basePrice: n(fd.get('basePrice')),
  };
  return run(
    () => apiFetch('/products/templates', { method: 'POST', body }),
    ['/admin/inventario'],
    'Producto creado',
  );
}

export async function createVariant(_p: ActionState, fd: FormData) {
  const body = {
    templateId: s(fd.get('templateId')),
    sku: s(fd.get('sku')),
    talla: s(fd.get('talla')),
    priceOverride: fd.get('priceOverride') ? n(fd.get('priceOverride')) : undefined,
  };
  return run(
    () => apiFetch('/products/variants', { method: 'POST', body }),
    ['/admin/inventario', '/admin/ventas'],
    'Talla agregada',
  );
}

export async function updateVariant(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  const precio = s(fd.get('priceOverride'));
  const body = {
    sku: s(fd.get('sku')),
    // vacío = volver al precio base del producto
    priceOverride: precio === '' ? null : Number(precio),
  };
  return run(
    () => apiFetch(`/products/variants/${id}`, { method: 'PATCH', body }),
    ['/admin/inventario', '/admin/ventas'],
    'Variante actualizada',
  );
}

export async function deleteVariant(_p: ActionState, fd: FormData) {
  const id = s(fd.get('id'));
  return run(
    () => apiFetch(`/products/variants/${id}`, { method: 'DELETE' }),
    ['/admin/inventario'],
    'Variante eliminada',
  );
}
