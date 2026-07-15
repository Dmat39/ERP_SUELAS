import { apiFetch } from '@/lib/api';
import { soles, qty, fecha } from '@/lib/format';
import { statusBadge } from '@/lib/status';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { InlineAction } from '../_components/InlineAction';
import { NewPurchase } from './NewPurchase';
import { receivePurchase, cancelPurchase } from '@/lib/actions';
import { getSession } from '@/lib/session';
import type { Contact, PurchaseOrder, RawMaterial, Warehouse } from '@/lib/types';

export default async function ComprasPage() {
  const [orders, suppliers, materials, warehouses, session] = await Promise.all([
    apiFetch<PurchaseOrder[]>('/purchase-orders'),
    apiFetch<Contact[]>('/contacts?isSupplier=true'),
    apiFetch<RawMaterial[]>('/raw-materials'),
    apiFetch<Warehouse[]>('/raw-materials/warehouses'),
    getSession(),
  ]);
  const wh = warehouses[0]?.id ?? '';
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div>
      <ModuleHeader moduleKey="compras">
        <NewPurchase suppliers={suppliers} materials={materials} />
      </ModuleHeader>

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState message="No hay órdenes de compra. Crea la primera con el botón de arriba." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const b = statusBadge(o.status);
                  const total = o.items.reduce(
                    (s, i) => s + Number(i.quantity) * Number(i.unitCost),
                    0,
                  );
                  return (
                    <tr key={o.id}>
                      <td className="font-medium">{o.supplier.name}</td>
                      <td className="text-[var(--color-muted)] max-w-[280px]">
                        {o.items.map((i) => (
                          <div key={i.id} className="truncate">
                            {i.rawMaterial.name} · {qty(i.quantity)} {i.rawMaterial.unit}
                          </div>
                        ))}
                      </td>
                      <td className="text-[var(--color-muted)]">{fecha(o.createdAt)}</td>
                      <td>
                        <span className={b.className}>{b.label}</span>
                      </td>
                      <td className="text-right tnum">{soles(total)}</td>
                      <td className="text-right">
                        {o.status !== 'RECIBIDA' && o.status !== 'CANCELADA' ? (
                          <div className="flex justify-end gap-1.5">
                            <InlineAction
                              action={receivePurchase}
                              fields={{ id: o.id, warehouseId: wh }}
                              label="Recibir"
                              className="btn btn-primary btn-sm"
                              confirmText="¿Confirmar recepción? Se sumará el stock de materia prima."
                            />
                            {isAdmin && (
                              <InlineAction
                                action={cancelPurchase}
                                fields={{ id: o.id }}
                                label="Cancelar"
                                className="btn btn-ghost btn-sm"
                                confirmText="¿Cancelar esta orden de compra?"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-faint)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
