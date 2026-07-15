import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { soles } from '@/lib/format';
import { getSession } from '@/lib/session';
import { FLOW, GROUPS, MODULES, ICONS } from './_components/modules';
import type { Order, ProductionOrder, PurchaseOrder } from '@/lib/types';

type LowStock = { id: string; name: string; unit: string; totalStock: number; minStock: string }[];

interface Accion {
  color: string;
  count: number;
  title: string;
  lines: string[];
  cta: string;
  href: string;
}

// ---------- Tarjeta HÉROE: la acción más urgente del día ----------
function HeroAction({ a }: { a: Accion }) {
  return (
    <div
      className="card p-6 flex flex-col bg-[var(--color-surface)] h-full"
      style={{ borderLeft: `4px solid ${a.color}` }}
    >
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-5xl font-semibold tnum leading-none" style={{ color: a.color }}>
          {a.count}
        </span>
        <span className="text-base font-semibold uppercase tracking-wide">{a.title}</span>
      </div>
      <div className="mt-3 space-y-1 flex-1">
        {a.lines.map((l, i) => (
          <p key={i} className="text-sm text-[var(--color-muted)]">
            {l}
          </p>
        ))}
      </div>
      <div className="mt-5">
        <Link href={a.href} className="btn text-white" style={{ backgroundColor: a.color }}>
          {a.cta} →
        </Link>
      </div>
    </div>
  );
}

// ---------- Fila compacta: acciones secundarias (sin botón, solo flecha) ----------
function CompactAction({ a }: { a: Accion }) {
  return (
    <Link
      href={a.href}
      className="card px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow bg-[var(--color-surface)]"
      style={{ borderLeft: `3px solid ${a.color}` }}
      title={a.lines.join(' · ')}
    >
      <span className="text-xl font-semibold tnum leading-none shrink-0" style={{ color: a.color }}>
        {a.count}
      </span>
      <span className="text-sm font-medium flex-1 leading-snug">{a.title}</span>
      <span className="text-[var(--color-faint)]" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

// ---------- Franja: la línea de la fábrica (colapsada por defecto) ----------
function FlowStrip() {
  const steps = FLOW.map((k) => MODULES.find((m) => m.key === k)!);
  return (
    <div className="card p-4 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {steps.map((m, i) => (
          <div key={m.key} className="flex items-center gap-1">
            <Link
              href={m.href}
              className="flex items-center gap-2 rounded-full border border-[var(--color-border)] pl-1.5 pr-3 py-1 text-xs font-medium hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${m.color}1a`, color: m.color }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={m.icon} />
                </svg>
              </span>
              {m.label}
            </Link>
            {i < steps.length - 1 && (
              <span className="text-[var(--color-faint)] px-0.5" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-3">
        Compras insumos → entran al almacén → producción los convierte en suelas → quedan listas
        para vender → entra el pedido → se emite la boleta → se entrega.
      </p>
    </div>
  );
}

export default async function AdminHome() {
  const [session, orders, production, purchases, lowStock] = await Promise.all([
    getSession(),
    apiFetch<Order[]>('/orders'),
    apiFetch<ProductionOrder[]>('/production-orders'),
    apiFetch<PurchaseOrder[]>('/purchase-orders'),
    apiFetch<LowStock>('/raw-materials/below-min-stock'),
  ]);

  // ---------- Datos para las tarjetas de acción ----------
  const pendientes = orders.filter((o) => o.status === 'PENDIENTE');
  const totalPendiente = pendientes.reduce((s, o) => s + Number(o.total), 0);
  const masAntiguo = pendientes.length
    ? Math.floor(
        (Date.now() -
          Math.min(...pendientes.map((o) => new Date(o.createdAt).getTime()))) /
          86_400_000,
      )
    : 0;

  const porRecibir = purchases.filter((p) => p.status === 'BORRADOR' || p.status === 'ENVIADA');
  const activas = production.filter(
    (p) => p.status === 'PLANIFICADA' || p.status === 'EN_PROCESO',
  );
  const primeraActiva = activas[0];
  const porDespachar = orders.filter((o) => o.status === 'CONFIRMADO' && !o.shipment);

  // Candidatas por prioridad; solo se muestran las que tienen trabajo (máx. 4).
  const acciones = [
    pendientes.length > 0 && {
      color: '#D97706',
      count: pendientes.length,
      title: pendientes.length === 1 ? 'pedido por confirmar' : 'pedidos por confirmar',
      lines: [
        `${soles(totalPendiente)} esperando confirmación`,
        masAntiguo > 0 ? `El más antiguo lleva ${masAntiguo} día(s) esperando` : 'Entraron hoy',
      ],
      cta: 'Confirmar pedidos',
      href: '/admin/ventas',
    },
    lowStock.length > 0 && {
      color: '#DC2626',
      count: lowStock.length,
      title: lowStock.length === 1 ? 'insumo bajo mínimo' : 'insumos bajo mínimo',
      lines: [
        lowStock.slice(0, 3).map((m) => m.name).join(' · '),
        'La producción puede parar si se agotan',
      ],
      cta: 'Crear compra',
      href: '/admin/compras',
    },
    porRecibir.length > 0 && {
      color: '#059669',
      count: porRecibir.length,
      title: porRecibir.length === 1 ? 'compra por recibir' : 'compras por recibir',
      lines: [
        porRecibir[0] ? `Proveedor: ${porRecibir[0].supplier.name}` : '',
        'Al recibirlas, el stock de insumos sube solo',
      ].filter(Boolean),
      cta: 'Recibir compras',
      href: '/admin/compras',
    },
    activas.length > 0 && {
      color: '#2563EB',
      count: activas.length,
      title: activas.length === 1 ? 'producción en curso' : 'producciones en curso',
      lines: [
        primeraActiva
          ? `${Number(primeraActiva.quantityToProduce)} × ${primeraActiva.bom.variant.template.name} ${primeraActiva.bom.variant.sku}`
          : '',
        'Complétala para sumar suelas al stock',
      ].filter(Boolean),
      cta: 'Ir a producción',
      href: '/admin/produccion',
    },
    porDespachar.length > 0 && {
      color: '#0891B2',
      count: porDespachar.length,
      title: porDespachar.length === 1 ? 'pedido por despachar' : 'pedidos por despachar',
      lines: ['Confirmados y esperando salir a reparto'],
      cta: 'Crear entregas',
      href: '/admin/logistica',
    },
  ].filter(Boolean) as Accion[];

  const paraHoy = acciones.slice(0, 4);
  const [hero, ...resto] = paraHoy;

  const hoy = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div>
      {/* Saludo + acceso a indicadores */}
      <div className="mb-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">
            Hola, {session?.name?.split(' ')[0] ?? ''} 👋
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5 first-letter:uppercase">{hoy}</p>
        </div>
        <Link href="/admin/tablero" className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS.tablero} />
          </svg>
          Ver indicadores
        </Link>
      </div>

      {/* Enlace discreto: el flujo de la fábrica, colapsado por defecto */}
      <details className="mb-6 group">
        <summary className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
          ¿Cómo funciona el flujo de la fábrica?
          <span className="transition-transform group-open:rotate-180" aria-hidden="true">
            ▾
          </span>
        </summary>
        <div className="mt-3">
          <FlowStrip />
        </div>
      </details>

      {/* ⚡ PARA HOY — héroe (lo más urgente) + secundarias compactas */}
      <section className="card tread-bg p-5 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-4 flex items-center gap-1.5">
          <span aria-hidden="true">⚡</span> Para hoy
        </h2>
        {!hero ? (
          <div className="flex items-center gap-3 py-6 justify-center text-[var(--color-ok)]">
            <span className="h-9 w-9 rounded-full bg-[var(--color-ok-soft)] flex items-center justify-center text-lg">
              ✓
            </span>
            <span className="font-medium">Todo al día. No hay nada urgente pendiente.</span>
          </div>
        ) : resto.length === 0 ? (
          <HeroAction a={hero} />
        ) : (
          <div className="grid lg:grid-cols-5 gap-4 items-stretch">
            <div className="lg:col-span-3">
              <HeroAction a={hero} />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-3">
              {resto.map((a) => (
                <CompactAction key={a.title} a={a} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Grilla de módulos estilo "Apps" de Odoo: ícono grande y colorido,
          nombre debajo, agrupados por flujo de trabajo. */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-5">
          Todos los módulos
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          {GROUPS.map((g) => {
            const mods = MODULES.filter((m) => m.group === g.key && m.key !== 'tablero');
            if (mods.length === 0) return null;
            return (
              <div key={g.key}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)] mb-3">
                  {g.title}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-6">
                  {mods.map((m) => (
                    <Link
                      key={m.key}
                      href={m.href}
                      title={m.desc}
                      className="group flex flex-col items-center gap-2 w-24 text-center"
                    >
                      <span
                        className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md"
                        style={{ backgroundColor: m.color }}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={m.icon} />
                        </svg>
                      </span>
                      <span className="text-xs font-medium leading-tight text-[var(--color-ink)]">
                        {m.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
