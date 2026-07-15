import { apiFetch } from '@/lib/api';
import { getSession } from '@/lib/session';
import { CustomerContact } from '../_components/CustomerContact';
import { InvoiceActions } from './InvoiceActions';
import { soles, fecha } from '@/lib/format';
import { statusBadge } from '@/lib/status';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { GenerateInvoice } from './GenerateInvoice';
import type { Invoice, Order } from '@/lib/types';

export default async function FacturacionPage() {
  const [invoices, orders, session] = await Promise.all([
    apiFetch<Invoice[]>('/invoices'),
    apiFetch<Order[]>('/orders'),
    getSession(),
  ]);
  const isAdmin = session?.role === 'ADMIN';

  // Pedidos elegibles: confirmados en adelante y sin comprobante emitido.
  const pendientes = orders.filter(
    (o) => o.status !== 'PENDIENTE' && o.status !== 'CANCELADO' && !o.invoice,
  );

  return (
    <div>
      <ModuleHeader moduleKey="facturacion" />

      {/* Pendientes de emitir */}
      <div className="card overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm">Pedidos por facturar</h2>
        </div>
        {pendientes.length === 0 ? (
          <EmptyState message="No hay pedidos confirmados pendientes de comprobante." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Estado pedido</th>
                  <th className="text-right">Total</th>
                  <th className="text-right w-64">Emitir comprobante</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((o) => {
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
                      <td>
                        <span className={b.className}>{b.label}</span>
                      </td>
                      <td className="text-right tnum">{soles(o.total)}</td>
                      <td>
                        <GenerateInvoice orderId={o.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprobantes emitidos */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm">Comprobantes emitidos</h2>
        </div>
        {invoices.length === 0 ? (
          <EmptyState message="Aún no se ha emitido ningún comprobante." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="text-right">Total</th>
                  <th>Estado SUNAT</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const b = statusBadge(inv.sunatStatus);
                  return (
                    <tr key={inv.id}>
                      <td className="font-medium tnum">
                        {inv.serie}-{String(inv.numero).padStart(6, '0')}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{inv.type}</span>
                      </td>
                      <td>
                        <CustomerContact
                          name={inv.order.customer.name}
                          phone={inv.order.customer.phone}
                          email={inv.order.customer.email}
                        />
                      </td>
                      <td className="text-[var(--color-muted)]">{fecha(inv.createdAt)}</td>
                      <td className="text-right tnum">{soles(inv.order.total)}</td>
                      <td>
                        <span className={b.className}>{b.label}</span>
                      </td>
                      <td>
                        <InvoiceActions
                          id={inv.id}
                          type={inv.type}
                          label={`${inv.serie}-${String(inv.numero).padStart(6, '0')}`}
                          isAdmin={isAdmin}
                        />
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
