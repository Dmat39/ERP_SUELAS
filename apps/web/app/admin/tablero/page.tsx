import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { soles, qty, fecha } from '@/lib/format';
import { statusBadge } from '@/lib/status';
import { ModuleHeader } from '../_components/ModuleHeader';
import { SizeCurve, sizeCurveRows } from '../_components/SizeCurve';
import { Donut, KpiSpark, SalesArea, TopBars } from './charts';
import type { Order, ProductionOrder, VariantFlat } from '@/lib/types';

type LowStock = { id: string; name: string; unit: string; totalStock: number; minStock: string }[];

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: '#d97706' },
  CONFIRMADO: { label: 'Confirmado', color: '#2563eb' },
  DESPACHADO: { label: 'Despachado', color: '#0891b2' },
  ENTREGADO: { label: 'Entregado', color: '#16a34a' },
  CANCELADO: { label: 'Cancelado', color: '#dc2626' },
};

// % de variación entre dos periodos. null si no hay base de comparación.
function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export default async function TableroPage() {
  const [orders, production, variants, lowStock] = await Promise.all([
    apiFetch<Order[]>('/orders'),
    apiFetch<ProductionOrder[]>('/production-orders'),
    apiFetch<VariantFlat[]>('/products/variants'),
    apiFetch<LowStock>('/raw-materials/below-min-stock'),
  ]);

  const activos = orders.filter((o) => o.status !== 'CANCELADO');

  // ---- Ventanas de tiempo: últimos 7 días vs los 7 anteriores ----
  const now = new Date();
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const last7Keys: string[] = [];
  const prev7Keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last7Keys.push(dayKey(d));
  }
  for (let i = 13; i >= 7; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    prev7Keys.push(dayKey(d));
  }
  const inWindow = (o: Order, keys: string[]) => keys.includes(o.createdAt.slice(0, 10));

  // ---- KPIs con tendencia ----
  const ventas7 = activos.filter((o) => inWindow(o, last7Keys)).reduce((s, o) => s + Number(o.total), 0);
  const ventasPrev = activos.filter((o) => inWindow(o, prev7Keys)).reduce((s, o) => s + Number(o.total), 0);
  const pedidos7 = activos.filter((o) => inWindow(o, last7Keys)).length;
  const pedidosPrev = activos.filter((o) => inWindow(o, prev7Keys)).length;

  const prodDone = production.filter((p) => p.status === 'COMPLETADA' && p.completedAt);
  const producidas7 = prodDone
    .filter((p) => last7Keys.includes(p.completedAt!.slice(0, 10)))
    .reduce((s, p) => s + Number(p.quantityToProduce), 0);
  const producidasPrev = prodDone
    .filter((p) => prev7Keys.includes(p.completedAt!.slice(0, 10)))
    .reduce((s, p) => s + Number(p.quantityToProduce), 0);

  const stockTotal = variants.reduce((s, v) => s + v.stock, 0);

  // ---- Serie diaria (para gráfico grande y sparklines) ----
  const salesByDay = last7Keys.map((key, idx) => {
    const dayOrders = activos.filter((o) => o.createdAt.slice(0, 10) === key);
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    return {
      day: new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: '2-digit' }).format(d),
      total: Number(dayOrders.reduce((s, o) => s + Number(o.total), 0).toFixed(2)),
      count: dayOrders.length,
    };
  });
  const sparkVentas = salesByDay.map((d) => ({ v: d.total }));
  const sparkPedidos = salesByDay.map((d) => ({ v: d.count }));
  const sparkProd = last7Keys.map((key) => ({
    v: prodDone
      .filter((p) => p.completedAt!.slice(0, 10) === key)
      .reduce((s, p) => s + Number(p.quantityToProduce), 0),
  }));
  const sparkStock = last7Keys.map(() => ({ v: stockTotal })); // línea plana: valor actual

  // ---- Pedidos por estado ----
  const statusData = Object.entries(STATUS_META)
    .map(([status, meta]) => ({
      name: meta.label,
      color: meta.color,
      value: orders.filter((o) => o.status === status).length,
    }))
    .filter((d) => d.value > 0);

  // ---- Ventas por origen ----
  const originData = [
    { name: 'Tienda web', color: '#2563eb', value: activos.filter((o) => o.origin === 'WEB').length },
    { name: 'Internos', color: '#0d9488', value: activos.filter((o) => o.origin === 'INTERNO').length },
  ].filter((d) => d.value > 0);

  // ---- Top productos vendidos (unidades, pedidos no cancelados) ----
  const vendidasPorSku = new Map<string, number>();
  for (const o of activos) {
    for (const i of o.items) {
      vendidasPorSku.set(i.variant.sku, (vendidasPorSku.get(i.variant.sku) ?? 0) + i.quantity);
    }
  }
  const topProducts = [...vendidasPorSku.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // ---- Curva de tallas (stock por talla, como lo mira calzado) ----
  const curvaRows = sizeCurveRows(variants);

  // ---- Últimos pedidos ----
  const ultimos = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div>
      <ModuleHeader moduleKey="tablero" />

      {/* KPIs con tendencia + sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiSpark
          label="Ventas (7 días)"
          value={soles(ventas7)}
          delta={deltaPct(ventas7, ventasPrev)}
          data={sparkVentas}
          color="#0d9488"
        />
        <KpiSpark
          label="Pedidos (7 días)"
          value={String(pedidos7)}
          delta={deltaPct(pedidos7, pedidosPrev)}
          data={sparkPedidos}
          color="#2563eb"
        />
        <KpiSpark
          label="Unidades producidas (7 días)"
          value={qty(producidas7)}
          delta={deltaPct(producidas7, producidasPrev)}
          data={sparkProd}
          color="#d97706"
          counter
        />
        <KpiSpark
          label="Stock producto terminado"
          value={`${qty(stockTotal)} u.`}
          delta={null}
          data={sparkStock}
          color="#16a34a"
        />
      </div>

      {/* Fila 1: ventas + estados */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-sm mb-4">Ventas — últimos 7 días</h2>
          <SalesArea data={salesByDay} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4">Pedidos por estado</h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] py-8 text-center">Aún no hay pedidos.</p>
          ) : (
            <Donut data={statusData} centerLabel="pedidos" />
          )}
        </div>
      </div>

      {/* Fila 2: top productos + origen + alertas MP */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4">Top productos vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] py-8 text-center">Sin ventas todavía.</p>
          ) : (
            <TopBars data={topProducts} />
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4">Pedidos por origen</h2>
          {originData.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] py-8 text-center">Sin pedidos todavía.</p>
          ) : (
            <Donut data={originData} centerLabel="pedidos" />
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm">Materia prima en alerta</h2>
            {lowStock.length > 0 && <span className="badge badge-warn">{lowStock.length}</span>}
          </div>
          {lowStock.length === 0 ? (
            <p className="px-4 py-8 text-sm text-center text-[var(--color-muted)]">
              Todo por encima del mínimo. ✓
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {lowStock.map((m) => (
                <li key={m.id} className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-sm">{m.name}</span>
                  <span className="text-sm tnum text-[var(--color-warn)] font-medium">
                    {qty(m.totalStock)} / {qty(m.minStock)} {m.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Fila 3: stock + últimos pedidos */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card tread-bg p-5 lg:col-span-2">
          <h2 className="font-semibold text-sm mb-4">Curva de tallas — stock por talla</h2>
          {curvaRows.length > 0 ? (
            <SizeCurve rows={curvaRows} />
          ) : (
            <p className="text-sm text-[var(--color-muted)] py-8 text-center">
              Sin stock de suelas terminadas todavía.
            </p>
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm">Últimos pedidos</h2>
            <Link href="/admin/ventas" className="text-xs text-[var(--color-primary-hover)] font-medium">
              Ver todos →
            </Link>
          </div>
          {ultimos.length === 0 ? (
            <p className="px-4 py-8 text-sm text-center text-[var(--color-muted)]">
              Aún no hay pedidos.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {ultimos.map((o) => {
                const b = statusBadge(o.status);
                return (
                  <li key={o.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{o.customer.name}</div>
                      <div className="text-xs text-[var(--color-muted)]">{fecha(o.createdAt)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm tnum font-medium">{soles(o.total)}</div>
                      <span className={b.className}>{b.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
