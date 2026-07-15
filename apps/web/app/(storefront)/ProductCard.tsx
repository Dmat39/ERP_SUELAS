'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CatalogProduct } from '@erp/shared-types';
import { useCart } from '@/lib/cart';
import { soles } from '@/lib/format';

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { add } = useCart();

  const disponibles = product.variants.filter((v) => v.stock > 0);
  const sinStock = disponibles.length === 0;

  // Variante seleccionada (primera con stock por defecto).
  const [variantId, setVariantId] = useState(disponibles[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(0);

  const selected = product.variants.find((v) => v.id === variantId);
  const precioDesde = Math.min(...product.variants.map((v) => v.price));

  const tallaDe = (v: (typeof product.variants)[number]) =>
    v.attributes.find((a) => a.attribute.toLowerCase() === 'talla')?.value ??
    v.attributes[0]?.value ??
    v.sku;

  const handleAdd = () => {
    if (!selected) return;
    add(
      {
        variantId: selected.id,
        sku: selected.sku,
        productName: product.name,
        attributes: selected.attributes,
        unitPrice: selected.price,
      },
      qty,
    );
    setJustAdded(qty);
    setQty(1);
    setTimeout(() => setJustAdded(0), 2500);
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Cabecera visual (sin imágenes reales: degradado + ícono) */}
      <div
        className="h-32 flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        }}
      >
        <span className="text-5xl select-none" aria-hidden="true">
          👟
        </span>
        {product.category && (
          <span className="absolute top-3 left-3 badge badge-neutral bg-white/90">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-[var(--color-muted)] mt-1 flex-1">{product.description}</p>
        )}

        <div className="mt-3 mb-4">
          <span className="text-xs text-[var(--color-muted)]">Desde</span>{' '}
          <span className="text-xl font-semibold tnum">{soles(precioDesde)}</span>
        </div>

        {sinStock ? (
          <div className="text-sm text-[var(--color-muted)] bg-[var(--color-surface-2)] rounded-md px-3 py-3 text-center">
            Sin stock disponible por ahora.
          </div>
        ) : (
          <>
            {/* Selector de talla */}
            <div className="mb-3">
              <div className="text-xs font-medium text-[var(--color-muted)] mb-1.5">
                Elige tu talla
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const agotado = v.stock <= 0;
                  const activo = v.id === variantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={agotado}
                      onClick={() => setVariantId(v.id)}
                      className={`min-w-11 h-10 px-3 rounded-md text-sm font-medium border transition-colors tnum ${
                        agotado
                          ? 'border-[var(--color-border)] text-[var(--color-faint)] line-through cursor-not-allowed'
                          : activo
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-hover)]'
                            : 'border-[var(--color-border-strong)] hover:border-[var(--color-primary)]'
                      }`}
                      title={agotado ? 'Sin stock' : `${v.stock} disponibles`}
                    >
                      {tallaDe(v)}
                    </button>
                  );
                })}
              </div>
              {selected && (
                <div className="text-xs text-[var(--color-muted)] mt-1.5 tnum">
                  {selected.stock} disponibles · {soles(selected.price)} c/u
                </div>
              )}
            </div>

            {/* Cantidad + agregar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center border border-[var(--color-border-strong)] rounded-md">
                <button
                  type="button"
                  className="px-3 py-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Restar"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm tnum">{qty}</span>
                <button
                  type="button"
                  className="px-3 py-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  onClick={() => setQty((q) => Math.min(selected?.stock ?? 1, q + 1))}
                  aria-label="Sumar"
                >
                  +
                </button>
              </div>
              <button type="button" className="btn btn-primary flex-1" onClick={handleAdd}>
                Agregar al carrito
              </button>
            </div>

            {justAdded > 0 && (
              <div className="mt-2 text-sm text-[var(--color-ok)] bg-[var(--color-ok-soft)] rounded-md px-3 py-2 flex items-center justify-between">
                <span>✓ Agregaste {justAdded} al carrito</span>
                <Link href="/carrito" className="font-medium underline">
                  Ver carrito
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
