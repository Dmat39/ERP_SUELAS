'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { soles } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function CarritoPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      customer: {
        name: String(fd.get('name') ?? ''),
        docType: String(fd.get('docType') ?? '') || undefined,
        docNumber: String(fd.get('docNumber') ?? '') || undefined,
        phone: String(fd.get('phone') ?? '') || undefined,
        email: String(fd.get('email') ?? '') || undefined,
        address: String(fd.get('address') ?? ''),
      },
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    };

    try {
      const res = await fetch(`${API}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data.message)
          ? data.message.join('. ')
          : data.message ?? data.error ?? 'No se pudo enviar el pedido';
        throw new Error(msg);
      }
      const order = await res.json();
      clear();
      setDone({ id: order.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el pedido');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto">
        <div className="h-12 w-12 rounded-full bg-[var(--color-ok-soft)] text-[var(--color-ok)] flex items-center justify-center text-2xl mx-auto mb-4">
          ✓
        </div>
        <h1 className="text-xl font-semibold mb-1">¡Pedido recibido!</h1>
        <p className="text-sm text-[var(--color-muted)] mb-2">
          Tu número de pedido es
        </p>
        <p className="font-mono font-semibold mb-6 tnum">{done.id.slice(0, 8).toUpperCase()}</p>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Nos comunicaremos contigo para coordinar el pago y la entrega.
        </p>
        <Link href="/" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center max-w-md mx-auto">
        <h1 className="text-lg font-semibold mb-2">Tu carrito está vacío</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Agrega productos desde el catálogo para armar tu pedido.
        </p>
        <Link href="/" className="btn btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Líneas del carrito */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <h1 className="font-semibold">Tu pedido</h1>
          <button className="btn btn-ghost btn-sm" onClick={clear}>
            Vaciar
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-center">Cantidad</th>
              <th className="text-right">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.variantId}>
                <td>
                  <div className="font-medium">{i.productName}</div>
                  <div className="text-xs text-[var(--color-muted)] tnum">
                    {i.attributes.map((a) => `${a.attribute} ${a.value}`).join(' · ')} ·{' '}
                    {soles(i.unitPrice)} c/u
                  </div>
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      className="btn btn-secondary btn-sm px-2"
                      onClick={() => setQty(i.variantId, i.quantity - 1)}
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span className="tnum w-8 text-center">{i.quantity}</span>
                    <button
                      className="btn btn-secondary btn-sm px-2"
                      onClick={() => setQty(i.variantId, i.quantity + 1)}
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="text-right tnum font-medium">{soles(i.unitPrice * i.quantity)}</td>
                <td className="text-right">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => remove(i.variantId)}
                    aria-label="Quitar"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Datos + confirmación */}
      <form onSubmit={onSubmit} className="card p-5 space-y-4">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium">Total</span>
          <span className="font-semibold tnum">{soles(total)}</span>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
          <div>
            <label className="label" htmlFor="name">
              Nombre / Razón social
            </label>
            <input id="name" name="name" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label" htmlFor="docType">
                Documento
              </label>
              <select id="docType" name="docType" className="select" defaultValue="RUC">
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="docNumber">
                Número
              </label>
              <input id="docNumber" name="docNumber" className="input tnum" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Teléfono / WhatsApp
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input tnum"
              placeholder="999 999 999"
              required
            />
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Te llamaremos a este número para confirmar tu pedido.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="address">
              Dirección de entrega
            </label>
            <input id="address" name="address" className="input" required />
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-soft)] rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={sending}>
          {sending ? 'Enviando…' : 'Confirmar pedido'}
        </button>
        <p className="text-xs text-[var(--color-muted)] text-center">
          Sin pago en línea. Coordinamos el pago tras confirmar.
        </p>
      </form>
    </div>
  );
}
