import type { CatalogProduct } from '@erp/shared-types';
import { apiFetch } from '@/lib/api';
import { ProductCard } from './ProductCard';

export default async function CatalogPage() {
  const products = await apiFetch<CatalogProduct[]>('/products/catalog', {
    auth: false,
  });

  const totalVariantes = products.reduce((s, p) => s + p.variants.length, 0);

  return (
    <div>
      {/* Hero */}
      <div
        className="card overflow-hidden mb-8 text-white relative"
        style={{ background: 'linear-gradient(120deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)' }}
      >
        {/* Textura de huella de suela, sutil, sobre el degradado */}
        <div className="absolute inset-0 tread-bg-dark" aria-hidden="true" />
        <div className="p-8 md:p-10 relative">
          <h1 className="text-3xl font-semibold">Suelas para cada paso</h1>
          <p className="mt-2 text-white/90 max-w-xl">
            Elige el modelo, tu talla y la cantidad, arma tu pedido y confírmalo. Coordinamos el
            pago y la entrega contigo — sin pago en línea.
          </p>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="text-2xl font-semibold tnum">{products.length}</span>
              <span className="text-white/80 ml-1.5">modelos</span>
            </div>
            <div>
              <span className="text-2xl font-semibold tnum">{totalVariantes}</span>
              <span className="text-white/80 ml-1.5">tallas</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Catálogo</h2>

      {products.length === 0 ? (
        <div className="card p-10 text-center text-[var(--color-muted)]">
          No hay productos publicados por el momento.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
