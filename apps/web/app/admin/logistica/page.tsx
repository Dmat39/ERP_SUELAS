import { apiFetch } from '@/lib/api';
import { fecha } from '@/lib/format';
import { statusBadge } from '@/lib/status';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { CustomerContact } from '../_components/CustomerContact';
import { InlineAction } from '../_components/InlineAction';
import { CreateShipment } from './CreateShipment';
import { dispatchShipment, deliverShipment } from '@/lib/actions';
import type { Order, Shipment } from '@/lib/types';

export default async function LogisticaPage() {
  const [shipments, orders] = await Promise.all([
    apiFetch<Shipment[]>('/shipments'),
    apiFetch<Order[]>('/orders'),
  ]);

  // Elegibles: confirmados y sin despacho aún.
  const porDespachar = orders.filter((o) => o.status === 'CONFIRMADO' && !o.shipment);

  return (
    <div>
      <ModuleHeader moduleKey="logistica" />

      {/* Por despachar */}
      <div className="card overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm">Pedidos por despachar</h2>
        </div>
        {porDespachar.length === 0 ? (
          <EmptyState message="No hay pedidos confirmados esperando despacho." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Pedido</th>
                  <th className="text-right w-80">Crear despacho</th>
                </tr>
              </thead>
              <tbody>
                {porDespachar.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <CustomerContact
                        name={o.customer.name}
                        phone={o.customer.phone}
                        email={o.customer.email}
                      />
                    </td>
                    <td className="text-[var(--color-muted)] tnum">{o.id.slice(0, 8)}</td>
                    <td>
                      <CreateShipment orderId={o.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Despachos */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm">Despachos</h2>
        </div>
        {shipments.length === 0 ? (
          <EmptyState message="Aún no hay despachos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Entregado</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((sh) => {
                  const b = statusBadge(sh.status);
                  return (
                    <tr key={sh.id}>
                      <td>
                        <CustomerContact
                          name={sh.order.customer.name}
                          phone={sh.order.customer.phone}
                          email={sh.order.customer.email}
                        />
                      </td>
                      <td className="text-[var(--color-muted)] max-w-[260px] truncate">
                        {sh.address}
                      </td>
                      <td>
                        <span className={b.className}>{b.label}</span>
                      </td>
                      <td className="text-[var(--color-muted)]">{fecha(sh.deliveredAt)}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {sh.status === 'PENDIENTE' && (
                            <InlineAction
                              action={dispatchShipment}
                              fields={{ id: sh.id }}
                              label="Marcar en ruta"
                              className="btn btn-secondary btn-sm"
                            />
                          )}
                          {sh.status === 'EN_RUTA' && (
                            <InlineAction
                              action={deliverShipment}
                              fields={{ id: sh.id }}
                              label="Marcar entregado"
                              className="btn btn-primary btn-sm"
                            />
                          )}
                          {sh.status === 'ENTREGADO' && (
                            <span className="text-xs text-[var(--color-faint)]">—</span>
                          )}
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
    </div>
  );
}
