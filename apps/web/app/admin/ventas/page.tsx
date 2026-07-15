import { apiFetch } from '@/lib/api';
import { soles, fecha } from '@/lib/format';
import { statusBadge } from '@/lib/status';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { CustomerContact } from '../_components/CustomerContact';
import { InlineAction } from '../_components/InlineAction';
import { NewOrder } from './NewOrder';
import { confirmOrder, cancelOrder } from '@/lib/actions';
import { getSession } from '@/lib/session';
import type { Contact, Order, VariantFlat, Warehouse } from '@/lib/types';

export default async function VentasPage() {
  const [orders, customers, variants, warehouses, session] = await Promise.all([
    apiFetch<Order[]>('/orders'),
    apiFetch<Contact[]>('/contacts?isCustomer=true'),
    apiFetch<VariantFlat[]>('/products/variants'),
    apiFetch<Warehouse[]>('/raw-materials/warehouses'),
    getSession(),
  ]);
  const wh = warehouses[0]?.id ?? '';
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div>
      <ModuleHeader moduleKey="ventas">
        <NewOrder customers={customers} variants={variants} />
      </ModuleHeader>

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState message="No hay pedidos. Crea uno interno o recibe pedidos del storefront." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Detalle</th>
                  <th>Origen</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const b = statusBadge(o.status);
                  return (
                    <tr key={o.id}>
                      <td>
                        <CustomerContact
                          name={o.customer.name}
                          phone={o.customer.phone}
                          email={o.customer.email}
                        />
                      </td>
                      <td className="text-[var(--color-muted)] max-w-[240px]">
                        {o.items.map((i) => (
                          <div key={i.id} className="truncate">
                            {i.variant.template.name} {i.variant.sku} × {i.quantity}
                          </div>
                        ))}
                      </td>
                      <td>
                        <span
                          className={
                            o.origin === 'WEB' ? 'badge badge-info' : 'badge badge-neutral'
                          }
                        >
                          {o.origin}
                        </span>
                      </td>
                      <td className="text-[var(--color-muted)]">{fecha(o.createdAt)}</td>
                      <td>
                        <span className={b.className}>{b.label}</span>
                        {o.invoice && (
                          <div className="text-[11px] text-[var(--color-muted)] mt-0.5">
                            {o.invoice.serie}-{o.invoice.numero}
                          </div>
                        )}
                      </td>
                      <td className="text-right tnum">{soles(o.total)}</td>
                      <td className="text-right">
                        {o.status === 'PENDIENTE' ? (
                          <div className="flex justify-end gap-1.5">
                            <InlineAction
                              action={confirmOrder}
                              fields={{ id: o.id, warehouseId: wh }}
                              label="Confirmar"
                              className="btn btn-primary btn-sm"
                              confirmText="¿Confirmar el pedido? Se descontará stock de producto terminado."
                            />
                            {isAdmin && (
                              <InlineAction
                                action={cancelOrder}
                                fields={{ id: o.id }}
                                label="Cancelar"
                                className="btn btn-ghost btn-sm"
                                confirmText="¿Cancelar este pedido? No se puede deshacer."
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
