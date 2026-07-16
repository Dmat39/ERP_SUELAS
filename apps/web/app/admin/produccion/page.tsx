import { apiFetch } from '@/lib/api';
import { qty, fecha } from '@/lib/format';
import { statusBadge } from '@/lib/status';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { InlineAction } from '../_components/InlineAction';
import { NewProductionOrder } from './NewProductionOrder';
import { NewBom } from './NewBom';
import { startProduction, completeProduction, cancelProduction, deleteBom } from '@/lib/actions';
import { getSession } from '@/lib/session';
import type { Bom, ProductionOrder, RawMaterial, VariantFlat, Warehouse } from '@/lib/types';

export default async function ProduccionPage() {
  const [orders, boms, variants, materials, warehouses, session] = await Promise.all([
    apiFetch<ProductionOrder[]>('/production-orders'),
    apiFetch<Bom[]>('/boms'),
    apiFetch<VariantFlat[]>('/products/variants'),
    apiFetch<RawMaterial[]>('/raw-materials'),
    apiFetch<Warehouse[]>('/raw-materials/warehouses'),
    getSession(),
  ]);
  const wh = warehouses[0]?.id ?? '';
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div>
      <ModuleHeader moduleKey="produccion">
        <NewBom variants={variants} materials={materials} />
        <NewProductionOrder boms={boms} />
      </ModuleHeader>

      {/* Órdenes de producción */}
      <div className="card overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm">Órdenes de producción</h2>
        </div>
        {orders.length === 0 ? (
          <EmptyState message="No hay órdenes de producción todavía." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Receta</th>
                  <th className="text-right">Cantidad</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const b = statusBadge(o.status);
                  const activa = o.status === 'PLANIFICADA' || o.status === 'EN_PROCESO';
                  return (
                    <tr key={o.id}>
                      <td className="font-medium">
                        {o.bom.variant.template.name}{' '}
                        <span className="text-[var(--color-muted)]">{o.bom.variant.sku}</span>
                      </td>
                      <td className="text-[var(--color-muted)]">{o.bom.name}</td>
                      <td className="text-right tnum">{qty(o.quantityToProduce)}</td>
                      <td className="text-[var(--color-muted)]">{fecha(o.createdAt)}</td>
                      <td>
                        <span className={b.className}>{b.label}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {o.status === 'PLANIFICADA' && (
                            <InlineAction
                              action={startProduction}
                              fields={{ id: o.id }}
                              label="Iniciar"
                              className="btn btn-secondary btn-sm"
                            />
                          )}
                          {activa && (
                            <InlineAction
                              action={completeProduction}
                              fields={{ id: o.id, warehouseId: wh }}
                              label="Completar"
                              className="btn btn-primary btn-sm"
                              confirmText="¿Completar la orden? Se consumirá materia prima y se sumará producto terminado."
                            />
                          )}
                          {activa && isAdmin && (
                            <InlineAction
                              action={cancelProduction}
                              fields={{ id: o.id }}
                              label="Cancelar"
                              className="btn btn-ghost btn-sm"
                              confirmText="¿Cancelar esta orden de producción?"
                            />
                          )}
                          {!activa && <span className="text-xs text-[var(--color-faint)]">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recetas / LDM */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm">Recetas (LDM)</h2>
        </div>
        {boms.length === 0 ? (
          <EmptyState message="No hay recetas. Crea una para poder producir." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Receta</th>
                  <th>Producto</th>
                  <th>Insumos por unidad</th>
                  {isAdmin && <th className="text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {boms.map((bom) => (
                  <tr key={bom.id}>
                    <td className="font-medium">{bom.name}</td>
                    <td className="text-[var(--color-muted)]">
                      {bom.variant.template.name} {bom.variant.sku}
                    </td>
                    <td className="text-[var(--color-muted)]">
                      {bom.lines
                        .map((l) => `${l.rawMaterial.name} ${qty(l.quantity)}${l.rawMaterial.unit}`)
                        .join(' · ')}
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <InlineAction
                          action={deleteBom}
                          fields={{ id: bom.id }}
                          label="Eliminar"
                          className="btn btn-ghost btn-sm"
                          confirmText={`¿Eliminar la receta "${bom.name}"? Solo es posible si nunca se usó en producción.`}
                        />
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
