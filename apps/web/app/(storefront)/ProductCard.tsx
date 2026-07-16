'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CatalogProduct } from '@erp/shared-types';
import { useCart } from '@/lib/cart';
import { Icon } from '@/components/Icon';
import { soles } from '@/lib/format';

// Umbral para marcar "pocas unidades" (crea sensación de disponibilidad real, sin inventar datos).
const STOCK_BAJO = 20;

// Paleta de degradados: da variedad visual a las cabeceras (no hay fotos reales).
// La misma categoría siempre obtiene el mismo color.
const GRADIENTES = [
  'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  'linear-gradient(135deg, #ec4899 0%, #9d174d 100%)',
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',
];

function gradientePara(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return GRADIENTES[h % GRADIENTES.length];
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { add } = useCart();

  const disponibles = product.variants.filter((v) => v.stock > 0);
  const sinStock = disponibles.length === 0;
  const stockTotal = product.variants.reduce((s, v) => s + v.stock, 0);
  const stockBajo = !sinStock && stockTotal <= STOCK_BAJO;

  const [variantId, setVariantId] = useState(disponibles[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(0);

  const selected = product.variants.find((v) => v.id === variantId);
  const precioDesde = product.variants.length
    ? Math.min(...product.variants.map((v) => v.price))
    : product.basePrice;

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
    <div className="group card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-border-strong)]">
      {/* Cabecera visual (degradado por categoría + ícono; sin fotos reales) */}
      <div
        className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{ background: gradientePara(product.category ?? product.name) }}
      >
        <div className="absolute inset-0 tread-bg-dark" aria-hidden="true" />
        <span className="relative text-white/90 transition-transform duration-300 group-hover:scale-110">
          <Icon name="sole" size={64} strokeWidth={1.4} />
        </span>

        {product.category && (
          <span className="absolute top-3 left-3 text-xs font-medium bg-white/90 text-[var(--color-ink)] rounded-full px-2.5 py-0.5">
            {product.category}
          </span>
        )}
        {sinStock ? (
          <span className="absolute top-3 right-3 text-xs font-semibold bg-[var(--color-ink)]/80 text-white rounded-full px-2.5 py-0.5">
            Agotado
          </span>
        ) : (
          stockBajo && (
            <span className="absolute top-3 right-3 text-xs font-semibold bg-[var(--color-warn)] text-white rounded-full px-2.5 py-0.5">
              ¡Pocas unidades!
            </span>
          )
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-base leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-[var(--color-muted)] mt-1 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-3 mb-4">
          <span className="text-xs text-[var(--color-muted)]">Desde</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tnum">{soles(precioDesde)}</span>
            {!sinStock && (
              <span className="text-xs text-[var(--color-muted)]">
                · {disponibles.length} {disponibles.length === 1 ? 'talla' : 'tallas'}
              </span>
            )}
          </div>
        </div>

        {sinStock ? (
          <div className="mt-auto text-sm text-[var(--color-muted)] bg-[var(--color-surface-2)] rounded-md px-3 py-3 text-center">
            Sin stock disponible por ahora.
          </div>
        ) : (
          <div className="mt-auto">
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
                      className={`min-w-10 h-9 px-2.5 rounded-md text-sm font-medium border transition-colors tnum ${
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
            <div className="flex items-center gap-2">
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
                Agregar
              </button>
            </div>

            {justAdded > 0 && (
              <div className="mt-2 text-sm text-[var(--color-ok)] bg-[var(--color-ok-soft)] rounded-md px-3 py-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={15} strokeWidth={2.4} />
                  Agregaste {justAdded} al carrito
                </span>
                <Link href="/carrito" className="font-medium underline">
                  Ver carrito
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
