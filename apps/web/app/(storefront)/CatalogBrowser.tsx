'use client';

import { useMemo, useState } from 'react';
import type { CatalogProduct } from '@erp/shared-types';
import { ProductCard } from './ProductCard';
import { useStoreUI } from './store-ui';

type Sort = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre';

const precioDesde = (p: CatalogProduct) =>
  p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.basePrice;

export function CatalogBrowser({ products }: { products: CatalogProduct[] }) {
  const { query } = useStoreUI();
  const [categoria, setCategoria] = useState('Todos');
  const [sort, setSort] = useState<Sort>('relevancia');

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return ['Todos', ...Array.from(set).sort()];
  }, [products]);

  const filtrados = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchCat = categoria === 'Todos' || p.category === categoria;
      const matchQ =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term) ||
        (p.category ?? '').toLowerCase().includes(term);
      return matchCat && matchQ;
    });
    if (sort === 'precio-asc') list = [...list].sort((a, b) => precioDesde(a) - precioDesde(b));
    else if (sort === 'precio-desc') list = [...list].sort((a, b) => precioDesde(b) - precioDesde(a));
    else if (sort === 'nombre') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, categoria, sort]);

  return (
    <div>
      {/* Chips de categoría + orden */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        {categorias.length > 1 && (
          <div className="flex flex-wrap gap-2 flex-1">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  categoria === c
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="select sm:w-56 shrink-0"
          aria-label="Ordenar productos"
        >
          <option value="relevancia">Ordenar: Relevancia</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre: A-Z</option>
        </select>
      </div>

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {categoria === 'Todos' ? 'Todos los productos' : categoria}
        </h2>
        <span className="text-sm text-[var(--color-muted)] tnum">
          {filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="card p-10 text-center text-[var(--color-muted)]">
          {query.trim()
            ? `No encontramos productos para "${query.trim()}".`
            : 'No hay productos publicados por el momento.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filtrados.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
