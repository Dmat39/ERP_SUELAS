import type { CatalogProduct } from '@erp/shared-types';
import { apiFetch } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { CatalogBrowser } from './CatalogBrowser';

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
        <div className="p-8 md:p-12 relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 rounded-full px-3 py-1 mb-4">
              Catálogo mayorista
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Suelas para cada paso
            </h1>
            <p className="mt-3 text-white/90 max-w-xl">
              Elige el modelo, tu talla y la cantidad, arma tu pedido y confírmalo. Coordinamos el
              pago y la entrega contigo — sin pago en línea.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {['Calidad de planta', 'Todas las tallas', 'Pedidos por volumen'].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5"
                >
                  <Icon name="check" size={15} strokeWidth={2.4} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Resumen del catálogo */}
          <div className="flex gap-4 md:flex-col md:gap-3 shrink-0">
            <div className="bg-white/12 rounded-xl px-5 py-4 text-center min-w-28">
              <div className="text-3xl font-semibold tnum">{products.length}</div>
              <div className="text-white/80 text-sm">modelos</div>
            </div>
            <div className="bg-white/12 rounded-xl px-5 py-4 text-center min-w-28">
              <div className="text-3xl font-semibold tnum">{totalVariantes}</div>
              <div className="text-white/80 text-sm">tallas</div>
            </div>
          </div>
        </div>
      </div>

      <CatalogBrowser products={products} />
    </div>
  );
}
