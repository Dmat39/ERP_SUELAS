import { apiFetch } from '@/lib/api';
import { getSession } from '@/lib/session';
import { soles, qty } from '@/lib/format';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { SizeCurve, sizeCurveRows } from '../_components/SizeCurve';
import { NewTemplate, NewVariant } from './NewProduct';
import { VariantActions } from './VariantActions';
import type { AttributeWithValues, TemplateAdmin, VariantFlat } from '@/lib/types';

export default async function InventarioPage() {
  const [templates, variants, attributes, session] = await Promise.all([
    apiFetch<TemplateAdmin[]>('/products'),
    apiFetch<VariantFlat[]>('/products/variants'),
    apiFetch<AttributeWithValues[]>('/products/attributes'),
    getSession(),
  ]);
  const isAdmin = session?.role === 'ADMIN';

  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  return (
    <div>
      <ModuleHeader
        moduleKey="inventario"
        subtitle={`${templates.length} producto(s) · ${variants.length} variante(s) · ${qty(totalStock)} unidades en stock`}
      >
        <NewTemplate />
        <NewVariant templates={templates} attributes={attributes} />
      </ModuleHeader>

      {/* Curva de tallas: la vista de stock como la piensa la industria del calzado */}
      {variants.length > 0 && (
        <div className="card tread-bg p-5 mb-6">
          <h2 className="font-semibold text-sm mb-4">Curva de tallas — stock por talla</h2>
          <SizeCurve rows={sizeCurveRows(variants)} />
        </div>
      )}

      <div className="card overflow-hidden">
        {variants.length === 0 ? (
          <EmptyState message="No hay variantes de producto. Crea un producto y sus tallas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Atributos</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">Stock</th>
                  {isAdmin && <th className="text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.productName}</td>
                    <td className="text-[var(--color-muted)] tnum">{v.sku}</td>
                    <td>
                      {v.attributes.map((a) => (
                        <span key={a.attribute + a.value} className="badge badge-neutral mr-1">
                          {a.attribute}: {a.value}
                        </span>
                      ))}
                    </td>
                    <td className="text-right tnum">{soles(v.price)}</td>
                    <td className="text-right tnum font-medium">
                      {v.stock > 0 ? (
                        qty(v.stock)
                      ) : (
                        <span className="text-[var(--color-faint)]">0</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        <VariantActions variant={v} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
